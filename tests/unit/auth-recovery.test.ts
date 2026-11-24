import assert from "node:assert/strict";
import { test } from "node:test";
import {
  AuthApiError,
  AuthRetryableFetchError,
  AuthSessionMissingError,
  type AuthError,
  type User,
} from "@supabase/supabase-js";
import { NextRequest } from "next/server";

test("staff authentication distinguishes outages from invalid sessions", async (t) => {
  let error: AuthError | null = null;
  let user: User | null = null;
  let thrown: Error | null = null;
  class SignInRedirect extends Error {}

  t.mock.module("server-only", { exports: {} });
  t.mock.module("next/navigation", {
    exports: {
      redirect: () => {
        throw new SignInRedirect();
      },
    },
  });
  t.mock.module("../../src/lib/supabase/server.ts", {
    exports: {
      createServerSupabaseClient: async () => ({
        auth: { getUser: async () => ({ data: { user }, error }) },
      }),
    },
  });
  t.mock.module("@supabase/ssr", {
    exports: {
      createServerClient: () => ({
        auth: {
          getClaims: async () => {
            if (thrown) throw thrown;
            return { data: null, error };
          },
        },
      }),
    },
  });
  const names = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ] as const;
  const previous = names.map((name) => [name, process.env[name]] as const);
  t.after(() => {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:54391";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_unit_test";
  const { requireIdentity } = await import("../../src/lib/auth/access");
  const { refreshStaffSession } = await import("../../src/lib/supabase/proxy");
  const request = () => new NextRequest("http://127.0.0.1:3000/staff");

  await t.test("retryable getUser failures reach the error boundary without redirecting", async () => {
    for (const status of [0, 500, 503, 504]) {
      error = new AuthRetryableFetchError("Internal provider details", status);
      await assert.rejects(requireIdentity, (actual: unknown) => {
        assert.ok(actual instanceof Error);
        assert.ok(!(actual instanceof SignInRedirect));
        assert.match(actual.message, /temporarily unavailable/);
        assert.doesNotMatch(actual.message, /Internal provider details/);
        return true;
      });
    }
  });
  await t.test("missing and invalid identities still redirect", async () => {
    for (const failure of [
      null,
      new AuthSessionMissingError(),
      new AuthApiError("Invalid token", 401, "bad_jwt"),
    ]) {
      error = failure;
      await assert.rejects(requireIdentity, SignInRedirect);
    }
  });
  await t.test("verified identities remain available", async () => {
    error = null;
    user = { id: "verified-staff" } as User;
    assert.equal((await requireIdentity()).user, user);
    user = null;
  });
  await t.test("returned retryable claims failures produce a private 503", async () => {
    for (const status of [0, 500, 503, 504]) {
      error = new AuthRetryableFetchError("Internal provider details", status);
      const response = await refreshStaffSession(request());
      assert.equal(response.status, 503);
      assert.match(
        response.headers.get("cache-control") ?? "",
        /private.*no-store/,
      );
      assert.deepEqual(await response.json(), {
        error: "Authentication is temporarily unavailable. Please try again.",
      });
    }
  });
  await t.test("anonymous and invalid sessions continue to the route guard", async () => {
    for (const failure of [
      null,
      new AuthSessionMissingError(),
      new AuthApiError("Invalid token", 401, "bad_jwt"),
    ]) {
      error = failure;
      const response = await refreshStaffSession(request());
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("x-middleware-next"), "1");
      assert.match(
        response.headers.get("cache-control") ?? "",
        /private.*no-store/,
      );
    }
  });
  await t.test("unexpected thrown failures still return a private 503", async () => {
    thrown = new Error("Internal provider details");
    const response = await refreshStaffSession(request());
    assert.equal(response.status, 503);
    assert.match(response.headers.get("cache-control") ?? "", /private.*no-store/);
  });
});

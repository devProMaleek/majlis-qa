import assert from "node:assert/strict";
import { test } from "node:test";
import { signInSchema } from "../../src/lib/auth/schemas";
import {
  authCookieOptions,
  supabaseConfigSchema,
} from "../../src/lib/supabase/config";

test("sign-in normalises surrounding email whitespace without changing the password", () => {
  assert.deepEqual(
    signInSchema.parse({
      email: " staff@example.org ",
      password: " space-sensitive ",
    }),
    { email: "staff@example.org", password: " space-sensitive " },
  );
});
test("sign-in rejects malformed fields and oversized input on the shared server schema", () => {
  for (const values of [
    { email: "invalid", password: "valid" },
    { email: "staff@example.org", password: "" },
    { email: "staff@example.org", password: "x".repeat(1025) },
    { email: new File([], "invalid"), password: "valid" },
  ])
    assert.equal(signInSchema.safeParse(values).success, false);
});
test("public configuration accepts publishable keys and local legacy anon keys", () => {
  const anon = `header.${btoa(JSON.stringify({ role: "anon" }))}.signature`;
  assert.equal(
    supabaseConfigSchema.safeParse({ url: "http://127.0.0.1:54391", key: anon })
      .success,
    true,
  );
  assert.equal(
    supabaseConfigSchema.safeParse({
      url: "https://project.supabase.co",
      key: "sb_publishable_valid_example_key",
    }).success,
    true,
  );
});
test("public configuration rejects elevated keys, partial config and insecure remote URLs", () => {
  const service = `header.${btoa(JSON.stringify({ role: "service_role" }))}.signature`;
  for (const key of [service, "sb_secret_never_public", "invalid"])
    assert.equal(
      supabaseConfigSchema.safeParse({
        url: "https://project.supabase.co",
        key,
      }).success,
      false,
    );
  assert.equal(
    supabaseConfigSchema.safeParse({
      url: "http://remote.example.org",
      key: "sb_publishable_valid_example_key",
    }).success,
    false,
  );
  assert.equal(
    supabaseConfigSchema.safeParse({
      url: "ftp://127.0.0.1",
      key: "sb_publishable_valid_example_key",
    }).success,
    false,
  );
  assert.equal(
    supabaseConfigSchema.safeParse({
      url: "https://user:secret@project.supabase.co",
      key: "sb_publishable_valid_example_key",
    }).success,
    false,
  );
  assert.equal(
    supabaseConfigSchema.safeParse({ url: "https://project.supabase.co" })
      .success,
    false,
  );
});
test("session cookies are scoped and secure on HTTPS, with local HTTP supported", () => {
  assert.deepEqual(authCookieOptions("https://project.supabase.co"), {
    path: "/",
    sameSite: "lax",
    secure: true,
  });
  assert.equal(authCookieOptions("http://127.0.0.1:54391").secure, false);
});

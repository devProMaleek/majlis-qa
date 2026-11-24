import assert from "node:assert/strict";
import { before, test } from "node:test";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { Client } from "pg";
import {
  demo,
  localReviewAccounts,
  localReviewPassword,
  localTestConfig,
  seedLocalBackend,
} from "../../scripts/seed-local-backend";
import type { Database } from "../../src/lib/supabase/database.types";

const config = localTestConfig();
const client = () =>
  createClient<Database>(config.url, config.key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const signedIn: Record<string, SupabaseClient<Database>> = {};
let userIds: Record<string, string>;

before(async () => {
  userIds = await seedLocalBackend();
  for (const [name, email] of Object.entries(localReviewAccounts)) {
    const supabase = client();
    const result = await supabase.auth.signInWithPassword({
      email,
      password: localReviewPassword,
    });
    assert.ifError(result.error);
    signedIn[name] = supabase;
  }
});

test("Data API denies anonymous reads of all private tables", async () => {
  const anon = client();
  for (const table of [
    "questions",
    "organisation_memberships",
    "moderator_assignments",
  ] as const) {
    const result = await anon.from(table).select("*");
    assert.equal(result.error?.code, "42501");
    assert.equal(result.data, null);
  }
});
test("Data API exposes published metadata but no draft event", async () => {
  const result = await client()
    .from("events")
    .select("id")
    .in("id", [demo.eventA, demo.eventB]);
  assert.ifError(result.error);
  assert.deepEqual(result.data, [{ id: demo.eventA }]);
});
test("real Auth JWTs enforce organisation and assignment isolation", async () => {
  for (const [name, expected] of Object.entries({
    admin: ["Local private question A", "Local private question A2"],
    moderator: ["Local private question A"],
    otherAdmin: ["Local private question B"],
    outsider: [],
    unassigned: [],
  })) {
    const result = await signedIn[name]
      .from("questions")
      .select("body")
      .in("organisation_id", [demo.orgA, demo.orgB])
      .order("body");
    assert.ifError(result.error);
    assert.deepEqual(
      result.data?.map((row) => row.body),
      expected,
      name,
    );
  }
});
test("direct API calls cannot promote users, assign moderators or insert questions", async () => {
  const membership = await signedIn.moderator
    .from("organisation_memberships")
    .update({ role: "organisation_admin" })
    .eq("user_id", userIds.moderator);
  assert.equal(membership.error?.code, "42501");
  const assignment = await signedIn.moderator
    .from("moderator_assignments")
    .insert({
      organisation_id: demo.orgA,
      session_id: demo.sessionA2,
      user_id: userIds.moderator,
    });
  assert.equal(assignment.error?.code, "42501");
  const question = await client()
    .from("questions")
    .insert({
      organisation_id: demo.orgA,
      event_id: demo.eventA,
      session_id: demo.sessionA,
      submission_id: crypto.randomUUID(),
      body: "Bypass attempt",
    });
  assert.equal(question.error?.code, "42501");
});
test("user-editable Auth metadata cannot grant organisation access", async () => {
  const result = await signedIn.moderator.auth.updateUser({
    data: { role: "organisation_admin", organisation_id: demo.orgB },
  });
  assert.ifError(result.error);
  const questions = await signedIn.moderator.from("questions").select("body");
  assert.ifError(questions.error);
  assert.deepEqual(questions.data, [{ body: "Local private question A" }]);
});
test("membership revocation takes effect with the existing access token", async () => {
  const db = new Client({ connectionString: config.databaseUrl });
  await db.connect();
  try {
    await db.query(
      "delete from public.organisation_memberships where organisation_id=$1 and user_id=$2",
      [demo.orgA, userIds.moderator],
    );
    const result = await signedIn.moderator.from("questions").select("id");
    assert.ifError(result.error);
    assert.deepEqual(result.data, []);
  } finally {
    await db.query(
      "insert into public.organisation_memberships (organisation_id,user_id,role) values ($1,$2,'moderator') on conflict do nothing",
      [demo.orgA, userIds.moderator],
    );
    await db.query(
      "insert into public.moderator_assignments (organisation_id,session_id,user_id) values ($1,$2,$3) on conflict do nothing",
      [demo.orgA, demo.sessionA, userIds.moderator],
    );
    await db.end();
  }
});
test("public RPC wrapper still rejects moderators and foreign admins", async () => {
  const moderator = await signedIn.moderator.rpc("set_session_status", {
    target_session_id: demo.sessionA,
    expected_revision: 0,
    desired_status: "closed",
  });
  assert.equal(moderator.error?.code, "42501");
  const foreign = await signedIn.admin.rpc("set_session_status", {
    target_session_id: demo.sessionB,
    expected_revision: 0,
    desired_status: "open",
  });
  assert.equal(foreign.error?.code, "42501");
  const admin = await signedIn.admin.rpc("set_session_status", {
    target_session_id: demo.sessionA,
    expected_revision: 0,
    desired_status: "open",
  });
  assert.ifError(admin.error);
});
test("public signup is disabled and forged access tokens are rejected", async () => {
  const signup = await client().auth.signUp({
    email: `uninvited-${crypto.randomUUID()}@example.test`,
    password: localReviewPassword,
  });
  assert.ok(signup.error);
  assert.equal(signup.data.user, null);
  const forged = createClient<Database>(config.url, config.key, {
    accessToken: async () => "invalid.forged.token",
  });
  const result = await forged.from("questions").select("body");
  assert.ok(result.error);
  assert.equal(result.data, null);
});
test("Auth refresh issues a valid session and local sign-out revokes its refresh token", async () => {
  const auth = client();
  const login = await auth.auth.signInWithPassword({
    email: localReviewAccounts.outsider,
    password: localReviewPassword,
  });
  assert.ifError(login.error);
  const refresh = await auth.auth.refreshSession();
  assert.ifError(refresh.error);
  assert.ok(refresh.data.session?.refresh_token);
  const user = await auth.auth.getUser();
  assert.ifError(user.error);
  assert.equal(user.data.user?.id, userIds.outsider);
  const token = refresh.data.session!.refresh_token;
  assert.ifError((await auth.auth.signOut({ scope: "local" })).error);
  const revoked = await client().auth.refreshSession({ refresh_token: token });
  assert.ok(revoked.error);
});

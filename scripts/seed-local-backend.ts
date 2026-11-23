import { createClient } from "@supabase/supabase-js";
import { Client } from "pg";

export const localReviewPassword = "MajlisLocalReview2026!";
export const localReviewAccounts = {
  admin: "admin@majlis.example.test",
  moderator: "moderator@majlis.example.test",
  otherAdmin: "other-admin@majlis.example.test",
  outsider: "outsider@majlis.example.test",
  unassigned: "unassigned@majlis.example.test",
} as const;
export const demo = {
  orgA: "a2000000-0000-4000-8000-000000000001",
  orgB: "a2000000-0000-4000-8000-000000000002",
  eventA: "a3000000-0000-4000-8000-000000000001",
  eventB: "a3000000-0000-4000-8000-000000000002",
  sessionA: "a4000000-0000-4000-8000-000000000001",
  sessionA2: "a4000000-0000-4000-8000-000000000002",
  sessionB: "a4000000-0000-4000-8000-000000000003",
};

export function localTestConfig() {
  if (
    process.env.TEST_SUPABASE_URL !== "http://127.0.0.1:54391" ||
    !process.env.TEST_SUPABASE_KEY ||
    !process.env.TEST_SUPABASE_SECRET_KEY ||
    !process.env.TEST_DATABASE_URL
  )
    throw new Error(
      "Local backend environment is missing. Run backend:env first.",
    );
  const dbUrl = new URL(process.env.TEST_DATABASE_URL);
  if (
    dbUrl.hostname !== "127.0.0.1" ||
    dbUrl.port !== "54392" ||
    dbUrl.pathname !== "/postgres"
  )
    throw new Error("Test tooling cannot target a hosted database.");
  return {
    url: process.env.TEST_SUPABASE_URL,
    key: process.env.TEST_SUPABASE_KEY,
    secret: process.env.TEST_SUPABASE_SECRET_KEY,
    databaseUrl: process.env.TEST_DATABASE_URL,
  };
}

export async function seedLocalBackend() {
  const config = localTestConfig();
  const admin = createClient(config.url, config.secret, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const list = await admin.auth.admin.listUsers({ perPage: 1000 });
  if (list.error) throw new Error("Could not read local test accounts.");
  const users: Record<string, string> = {};
  for (const [name, email] of Object.entries(localReviewAccounts)) {
    const existing = list.data.users.find((user) => user.email === email);
    const result = existing
      ? await admin.auth.admin.updateUserById(existing.id, {
          password: localReviewPassword,
          email_confirm: true,
        })
      : await admin.auth.admin.createUser({
          email,
          password: localReviewPassword,
          email_confirm: true,
        });
    if (result.error || !result.data.user)
      throw new Error(`Could not provision local review account ${name}.`);
    users[name] = result.data.user.id;
  }
  const db = new Client({ connectionString: config.databaseUrl });
  await db.connect();
  try {
    await db.query("begin");
    await db.query(
      "insert into public.organisations (id,name,slug) values ($1,'Deen Communications','dcl'),($2,'Other Test Organisation','other-test') on conflict(id) do nothing",
      [demo.orgA, demo.orgB],
    );
    await db.query(
      "insert into public.organisation_memberships (organisation_id,user_id,role) values ($1,$2,'organisation_admin'),($1,$3,'moderator'),($1,$4,'moderator'),($5,$6,'organisation_admin') on conflict(organisation_id,user_id) do update set role=excluded.role",
      [
        demo.orgA,
        users.admin,
        users.moderator,
        users.unassigned,
        demo.orgB,
        users.otherAdmin,
      ],
    );
    await db.query(
      "insert into public.events (id,organisation_id,name,slug,published_at) values ($1,$2,'Knowledge Builder Course 2026','kbc-2026',now()),($3,$4,'Other Private Event','private-event',null) on conflict(id) do nothing",
      [demo.eventA, demo.orgA, demo.eventB, demo.orgB],
    );
    await db.query(
      "insert into public.lecture_sessions (id,organisation_id,event_id,title,status) values ($1,$2,$3,'Understanding Our Deen','open'),($4,$2,$3,'Questions and Answers','scheduled'),($5,$6,$7,'Other Private Session','scheduled') on conflict(id) do nothing",
      [
        demo.sessionA,
        demo.orgA,
        demo.eventA,
        demo.sessionA2,
        demo.sessionB,
        demo.orgB,
        demo.eventB,
      ],
    );
    await db.query(
      "insert into public.moderator_assignments (organisation_id,session_id,user_id) values ($1,$2,$3) on conflict do nothing",
      [demo.orgA, demo.sessionA, users.moderator],
    );
    await db.query(
      "insert into public.questions (organisation_id,event_id,session_id,submission_id,body) values ($1,$2,$3,'a6000000-0000-4000-8000-000000000001','Local private question A'),($1,$2,$4,'a6000000-0000-4000-8000-000000000002','Local private question A2'),($5,$6,$7,'a6000000-0000-4000-8000-000000000003','Local private question B') on conflict(session_id,submission_id) do nothing",
      [
        demo.orgA,
        demo.eventA,
        demo.sessionA,
        demo.sessionA2,
        demo.orgB,
        demo.eventB,
        demo.sessionB,
      ],
    );
    await db.query("commit");
  } catch (error) {
    await db.query("rollback");
    throw error;
  } finally {
    await db.end();
  }
  return users;
}

if (process.argv[1]?.endsWith("seed-local-backend.ts")) {
  seedLocalBackend()
    .then(() => {
      console.log(
        "Provisioned five LOCAL-ONLY review accounts and sample records. See docs/backend-foundation.md for the accounts. No remote environment was changed.",
      );
    })
    .catch(() => {
      console.error(
        "Local account provisioning failed. Check the local stack and environment configuration.",
      );
      process.exitCode = 1;
    });
}

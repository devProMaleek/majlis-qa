import { Client } from "pg";

export const ids = {
  adminA: "10000000-0000-4000-8000-000000000001",
  moderatorA: "10000000-0000-4000-8000-000000000002",
  adminB: "10000000-0000-4000-8000-000000000003",
  outsider: "10000000-0000-4000-8000-000000000004",
  orgA: "20000000-0000-4000-8000-000000000001",
  orgB: "20000000-0000-4000-8000-000000000002",
  eventA: "30000000-0000-4000-8000-000000000001",
  eventB: "30000000-0000-4000-8000-000000000002",
  sessionA: "40000000-0000-4000-8000-000000000001",
  sessionA2: "40000000-0000-4000-8000-000000000002",
  sessionB: "40000000-0000-4000-8000-000000000003",
};

export function localDatabaseUrl() {
  const value = process.env.TEST_DATABASE_URL;
  if (!value)
    throw new Error(
      "Set TEST_DATABASE_URL for the isolated local Supabase database.",
    );
  const url = new URL(value);
  if (
    url.hostname !== "127.0.0.1" ||
    url.port !== "54392" ||
    url.pathname !== "/postgres" ||
    url.searchParams.has("host") ||
    url.searchParams.has("port")
  ) {
    throw new Error(
      "Backend tests are restricted to 127.0.0.1:54392/postgres.",
    );
  }
  return value;
}

export async function connect() {
  const client = new Client({ connectionString: localDatabaseUrl() });
  await client.connect();
  return client;
}

export async function fixture(client: Client) {
  await client.query(
    `insert into auth.users (id, email) values ($1,'sql-admin-a@example.test'),($2,'sql-moderator@example.test'),($3,'sql-admin-b@example.test'),($4,'sql-outsider@example.test')`,
    [ids.adminA, ids.moderatorA, ids.adminB, ids.outsider],
  );
  await client.query(
    `insert into public.organisations (id,name,slug) values ($1,'SQL Organisation A','sql-org-a'),($2,'SQL Organisation B','sql-org-b')`,
    [ids.orgA, ids.orgB],
  );
  await client.query(
    `insert into public.organisation_memberships (organisation_id,user_id,role) values ($1,$2,'organisation_admin'),($1,$3,'moderator'),($4,$5,'organisation_admin')`,
    [ids.orgA, ids.adminA, ids.moderatorA, ids.orgB, ids.adminB],
  );
  await client.query(
    `insert into public.events (id,organisation_id,name,slug,published_at) values ($1,$2,'SQL Published A','sql-event',now()),($3,$4,'SQL Draft B','sql-event',null)`,
    [ids.eventA, ids.orgA, ids.eventB, ids.orgB],
  );
  await client.query(
    `insert into public.lecture_sessions (id,organisation_id,event_id,title,status) values ($1,$2,$3,'SQL Session A','open'),($4,$2,$3,'SQL Session A2','scheduled'),($5,$6,$7,'SQL Session B','scheduled')`,
    [
      ids.sessionA,
      ids.orgA,
      ids.eventA,
      ids.sessionA2,
      ids.sessionB,
      ids.orgB,
      ids.eventB,
    ],
  );
  await client.query(
    `insert into public.moderator_assignments (organisation_id,session_id,user_id) values ($1,$2,$3)`,
    [ids.orgA, ids.sessionA, ids.moderatorA],
  );
  await client.query(
    `insert into public.questions (organisation_id,event_id,session_id,submission_id,body) values ($1,$2,$3,gen_random_uuid(),'Private SQL question A'),($1,$2,$4,gen_random_uuid(),'Private SQL question A2'),($5,$6,$7,gen_random_uuid(),'Private SQL question B')`,
    [
      ids.orgA,
      ids.eventA,
      ids.sessionA,
      ids.sessionA2,
      ids.orgB,
      ids.eventB,
      ids.sessionB,
    ],
  );
}

export async function asUser(client: Client, userId: string | null) {
  await client.query("reset role");
  await client.query("select set_config('request.jwt.claims',$1,true)", [
    JSON.stringify(
      userId ? { sub: userId, role: "authenticated" } : { role: "anon" },
    ),
  ]);
  await client.query(
    userId ? "set local role authenticated" : "set local role anon",
  );
}

export async function expectSqlError(
  client: Client,
  sql: string,
  values: unknown[],
  code: string,
) {
  await client.query("savepoint expected_error");
  let actual: unknown;
  try {
    await client.query(sql, values);
  } catch (error) {
    actual = error;
  }
  await client.query("rollback to savepoint expected_error");
  await client.query("release savepoint expected_error");
  if (
    !actual ||
    typeof actual !== "object" ||
    !("code" in actual) ||
    actual.code !== code
  ) {
    throw new Error(
      `Expected SQLSTATE ${code}, received ${actual instanceof Error ? actual.message : "success"}`,
    );
  }
}

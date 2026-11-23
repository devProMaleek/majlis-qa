import assert from "node:assert/strict";
import { afterEach, beforeEach, describe, it } from "node:test";
import type { Client } from "pg";
import { asUser, connect, expectSqlError, fixture, ids } from "./helpers";

describe("PostgreSQL tenant boundaries and grants", () => {
  let db: Client;
  beforeEach(async () => {
    db = await connect();
    await db.query("begin");
    await fixture(db);
  });
  afterEach(async () => {
    await db.query("rollback");
    await db.end();
  });

  it("enables RLS on every application table", async () => {
    const result = await db.query(
      "select relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity",
    );
    assert.deepEqual(result.rows, []);
  });
  it("pins and hides all SECURITY DEFINER functions", async () => {
    const result = await db.query(
      "select n.nspname,p.proconfig from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname in ('public','private') and p.prosecdef",
    );
    assert.ok(result.rows.length >= 4);
    for (const row of result.rows) {
      assert.equal(row.nspname, "private");
      assert.ok(row.proconfig.includes('search_path=""'));
    }
  });
  it("anonymous clients cannot read questions, memberships or assignments", async () => {
    await asUser(db, null);
    for (const table of [
      "questions",
      "organisation_memberships",
      "moderator_assignments",
    ])
      await expectSqlError(db, `select * from public.${table}`, [], "42501");
  });
  it("anonymous clients see only published events and their open session", async () => {
    await asUser(db, null);
    assert.deepEqual(
      (
        await db.query(
          "select id from public.events where id = any($1::uuid[]) order by id",
          [[ids.eventA, ids.eventB]],
        )
      ).rows,
      [{ id: ids.eventA }],
    );
    assert.deepEqual(
      (
        await db.query(
          "select id from public.lecture_sessions where id = any($1::uuid[]) order by id",
          [[ids.sessionA, ids.sessionA2, ids.sessionB]],
        )
      ).rows,
      [{ id: ids.sessionA }],
    );
    assert.deepEqual(
      (
        await db.query(
          "select id from public.organisations where id = any($1::uuid[]) order by id",
          [[ids.orgA, ids.orgB]],
        )
      ).rows,
      [{ id: ids.orgA }],
    );
  });
  it("anonymous clients cannot execute session transitions", async () => {
    await asUser(db, null);
    await expectSqlError(
      db,
      "select public.set_session_status($1,0,'closed')",
      [ids.sessionA],
      "42501",
    );
  });
  it("an authenticated outsider cannot read any questions or private staff records", async () => {
    await asUser(db, ids.outsider);
    for (const table of [
      "questions",
      "organisation_memberships",
      "moderator_assignments",
    ])
      assert.equal(
        (await db.query(`select * from public.${table}`)).rowCount,
        0,
      );
  });
  it("organisation admins read only their organisation's questions", async () => {
    await asUser(db, ids.adminA);
    assert.deepEqual(
      (
        await db.query("select body from public.questions order by body")
      ).rows.map((r) => r.body),
      ["Private SQL question A", "Private SQL question A2"],
    );
    await asUser(db, ids.adminB);
    assert.deepEqual(
      (await db.query("select body from public.questions")).rows.map(
        (r) => r.body,
      ),
      ["Private SQL question B"],
    );
  });
  it("moderators read only questions in assigned sessions", async () => {
    await asUser(db, ids.moderatorA);
    assert.deepEqual(
      (await db.query("select body from public.questions")).rows,
      [{ body: "Private SQL question A" }],
    );
    assert.equal(
      (
        await db.query("select * from public.lecture_sessions where id=$1", [
          ids.sessionA2,
        ])
      ).rowCount,
      0,
    );
    assert.equal(
      (await db.query("select * from public.events where id=$1", [ids.eventB]))
        .rowCount,
      0,
    );
  });
  it("revoking an assignment removes access with the same JWT claims", async () => {
    await db.query(
      "delete from public.moderator_assignments where session_id=$1",
      [ids.sessionA],
    );
    await asUser(db, ids.moderatorA);
    assert.equal(
      (await db.query("select * from public.questions")).rowCount,
      0,
    );
  });
  it("revoking membership cascades assignments and removes access", async () => {
    await db.query(
      "delete from public.organisation_memberships where user_id=$1",
      [ids.moderatorA],
    );
    assert.equal(
      (
        await db.query(
          "select * from public.moderator_assignments where user_id=$1",
          [ids.moderatorA],
        )
      ).rowCount,
      0,
    );
    await asUser(db, ids.moderatorA);
    assert.equal(
      (await db.query("select * from public.questions")).rowCount,
      0,
    );
  });
  it("staff cannot create membership, promote themselves or assign sessions", async () => {
    for (const user of [ids.adminA, ids.moderatorA, ids.outsider]) {
      await asUser(db, user);
      await expectSqlError(
        db,
        "insert into public.organisation_memberships (organisation_id,user_id,role) values ($1,$2,'organisation_admin')",
        [ids.orgB, user],
        "42501",
      );
      await expectSqlError(
        db,
        "update public.organisation_memberships set role='organisation_admin' where user_id=$1",
        [user],
        "42501",
      );
      await expectSqlError(
        db,
        "insert into public.moderator_assignments (organisation_id,session_id,user_id) values ($1,$2,$3)",
        [ids.orgA, ids.sessionA2, user],
        "42501",
      );
    }
  });
  it("nobody can bypass the future submission/moderation boundary with direct writes", async () => {
    for (const user of [null, ids.adminA, ids.moderatorA, ids.outsider]) {
      await asUser(db, user);
      await expectSqlError(
        db,
        "insert into public.questions (organisation_id,event_id,session_id,submission_id,body) values ($1,$2,$3,gen_random_uuid(),'Bypass')",
        [ids.orgA, ids.eventA, ids.sessionA],
        "42501",
      );
      await expectSqlError(
        db,
        "update public.questions set status='answered'",
        [],
        "42501",
      );
    }
  });
  it("admins can create and edit their event metadata but not another tenant's", async () => {
    await asUser(db, ids.adminA);
    assert.equal(
      (
        await db.query(
          "insert into public.events (organisation_id,name,slug) values ($1,'New event','new-event') returning id",
          [ids.orgA],
        )
      ).rowCount,
      1,
    );
    await expectSqlError(
      db,
      "insert into public.events (organisation_id,name,slug) values ($1,'Foreign','foreign')",
      [ids.orgB],
      "42501",
    );
    assert.equal(
      (
        await db.query(
          "update public.events set name='Updated' where id=$1 returning id",
          [ids.eventA],
        )
      ).rowCount,
      1,
    );
    assert.equal(
      (
        await db.query(
          "insert into public.lecture_sessions (organisation_id,event_id,title) values ($1,$2,'New session') returning id",
          [ids.orgA, ids.eventA],
        )
      ).rowCount,
      1,
    );
    assert.equal(
      (
        await db.query(
          "update public.events set name='Foreign' where id=$1 returning id",
          [ids.eventB],
        )
      ).rowCount,
      0,
    );
  });
  it("moderators cannot edit event metadata or create sessions", async () => {
    await asUser(db, ids.moderatorA);
    assert.equal(
      (
        await db.query(
          "update public.events set name='Invalid' where id=$1 returning id",
          [ids.eventA],
        )
      ).rowCount,
      0,
    );
    await expectSqlError(
      db,
      "insert into public.lecture_sessions (organisation_id,event_id,title) values ($1,$2,'Invalid')",
      [ids.orgA, ids.eventA],
      "42501",
    );
  });
  it("raw clients cannot publish events or change session status/revision", async () => {
    await asUser(db, ids.adminA);
    for (const sql of [
      "update public.events set published_at=now()",
      "update public.lecture_sessions set status='open'",
      "update public.lecture_sessions set revision=100",
    ])
      await expectSqlError(db, sql, [], "42501");
  });
  it("rejects cross-tenant event/session/question/assignment relationships", async () => {
    await expectSqlError(
      db,
      "insert into public.lecture_sessions (organisation_id,event_id,title) values ($1,$2,'Cross tenant')",
      [ids.orgB, ids.eventA],
      "23503",
    );
    await expectSqlError(
      db,
      "insert into public.questions (organisation_id,event_id,session_id,submission_id,body) values ($1,$2,$3,gen_random_uuid(),'Cross tenant')",
      [ids.orgB, ids.eventB, ids.sessionA],
      "23503",
    );
    await expectSqlError(
      db,
      "insert into public.moderator_assignments (organisation_id,session_id,user_id) values ($1,$2,$3)",
      [ids.orgB, ids.sessionA, ids.adminB],
      "23503",
    );
    await expectSqlError(
      db,
      "insert into public.moderator_assignments (organisation_id,session_id,user_id) values ($1,$2,$3)",
      [ids.orgA, ids.sessionA2, ids.adminB],
      "23503",
    );
  });
  it("protects permanent route slugs even for privileged SQL updates", async () => {
    await expectSqlError(
      db,
      "update public.organisations set slug='changed' where id=$1",
      [ids.orgA],
      "23514",
    );
    await expectSqlError(
      db,
      "update public.events set slug='changed' where id=$1",
      [ids.eventA],
      "23514",
    );
    await expectSqlError(
      db,
      "update public.lecture_sessions set event_id=$1 where id=$2",
      [ids.eventB, ids.sessionA],
      "23514",
    );
  });
  it("enforces question body bounds and per-session submission uniqueness", async () => {
    for (const body of ["", "   \n", "x".repeat(1001)])
      await expectSqlError(
        db,
        "insert into public.questions (organisation_id,event_id,session_id,submission_id,body) values ($1,$2,$3,gen_random_uuid(),$4)",
        [ids.orgA, ids.eventA, ids.sessionA, body],
        "23514",
      );
    await expectSqlError(
      db,
      "insert into public.questions (organisation_id,event_id,session_id,submission_id,body) select organisation_id,event_id,session_id,submission_id,body from public.questions limit 1",
      [],
      "23505",
    );
  });
  it("enforces one open session even when bypassing the RPC with owner SQL", async () => {
    await expectSqlError(
      db,
      "update public.lecture_sessions set status='open' where id=$1",
      [ids.sessionA2],
      "23505",
    );
  });
  it("allows checked admin transitions and rejects stale/foreign/moderator transitions", async () => {
    await asUser(db, ids.adminA);
    await expectSqlError(
      db,
      "select public.set_session_status($1,0,'open')",
      [ids.sessionA2],
      "23505",
    );
    await db.query("select public.set_session_status($1,0,'closed')", [
      ids.sessionA,
    ]);
    await expectSqlError(
      db,
      "select public.set_session_status($1,0,'open')",
      [ids.sessionA],
      "40001",
    );
    await db.query("select public.set_session_status($1,0,'open')", [
      ids.sessionA2,
    ]);
    await expectSqlError(
      db,
      "select public.set_session_status($1,0,'open')",
      [ids.sessionB],
      "42501",
    );
    await asUser(db, ids.moderatorA);
    await expectSqlError(
      db,
      "select public.set_session_status($1,1,'open')",
      [ids.sessionA],
      "42501",
    );
  });
});

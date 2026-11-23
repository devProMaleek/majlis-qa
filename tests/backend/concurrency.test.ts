import assert from "node:assert/strict";
import { test } from "node:test";
import { asUser, connect, fixture, ids } from "./helpers";

test("competing admin activations leave exactly one open session", async () => {
  const owner = await connect();
  const first = await connect();
  const second = await connect();
  try {
    await owner.query("begin");
    await fixture(owner);
    await owner.query(
      "update public.lecture_sessions set status='scheduled' where event_id=$1",
      [ids.eventA],
    );
    await owner.query("commit");
    for (let attempt = 0; attempt < 5; attempt++) {
      await owner.query(
        "update public.lecture_sessions set status='scheduled' where event_id=$1",
        [ids.eventA],
      );
      const rows = await owner.query(
        "select id,revision from public.lecture_sessions where event_id=$1 order by id",
        [ids.eventA],
      );
      for (const client of [first, second]) {
        await client.query("begin");
        await client.query("set local statement_timeout='5s'");
        await asUser(client, ids.adminA);
      }
      const outcomes = await Promise.allSettled(
        [first, second].map(async (client, index) => {
          try {
            await client.query(
              "select public.set_session_status($1,$2,'open')",
              [rows.rows[index].id, rows.rows[index].revision],
            );
            await client.query("commit");
          } catch (error) {
            await client.query("rollback");
            throw error;
          }
        }),
      );
      assert.equal(
        outcomes.filter((outcome) => outcome.status === "fulfilled").length,
        1,
      );
      const failure = outcomes.find((outcome) => outcome.status === "rejected");
      assert.equal(
        failure?.status === "rejected" ? failure.reason.code : null,
        "23505",
      );
      assert.equal(
        (
          await owner.query(
            "select * from public.lecture_sessions where event_id=$1 and status='open'",
            [ids.eventA],
          )
        ).rowCount,
        1,
      );
    }
  } finally {
    await owner.query("rollback");
    await owner.query(
      "delete from public.organisations where id = any($1::uuid[])",
      [[ids.orgA, ids.orgB]],
    );
    await owner.query("delete from auth.users where id = any($1::uuid[])", [
      [ids.adminA, ids.adminB, ids.moderatorA, ids.outsider],
    ]);
    await Promise.all([owner.end(), first.end(), second.end()]);
  }
});

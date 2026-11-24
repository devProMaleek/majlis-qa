import assert from "node:assert/strict";
import { test } from "node:test";
import { localTestConfig } from "../../scripts/seed-local-backend";
import { localDatabaseUrl } from "../backend/helpers";

test("local database guards reject connection-target query overrides", (t) => {
  const names = [
    "TEST_DATABASE_URL",
    "TEST_SUPABASE_URL",
    "TEST_SUPABASE_KEY",
    "TEST_SUPABASE_SECRET_KEY",
  ] as const;
  const previous = names.map((name) => [name, process.env[name]] as const);
  t.after(() => {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  });
  process.env.TEST_SUPABASE_URL = "http://127.0.0.1:54391";
  process.env.TEST_SUPABASE_KEY = "unit-test-public-key";
  process.env.TEST_SUPABASE_SECRET_KEY = "unit-test-provisioning-key";
  const local = "postgresql://127.0.0.1:54392/postgres";

  for (const suffix of [
    "?host=remote.example.test",
    "?port=5432",
    "?host=remote.example.test&port=5432",
    "?h%6fst=remote.example.test",
    "?host=127.0.0.1&host=remote.example.test",
    "?host=",
    "?port=",
  ]) {
    process.env.TEST_DATABASE_URL = local + suffix;
    assert.throws(() => localTestConfig(), /hosted database/);
    assert.throws(() => localDatabaseUrl(), /restricted/);
  }

  for (const value of [local, local + "?application_name=majlis-tests"]) {
    process.env.TEST_DATABASE_URL = value;
    assert.equal(localTestConfig().databaseUrl, value);
    assert.equal(localDatabaseUrl(), value);
  }
});

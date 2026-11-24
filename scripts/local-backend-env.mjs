import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync } from "node:fs";

const result = spawnSync(
  process.execPath,
  ["scripts/supabase.mjs", "status", "-o", "json"],
  { encoding: "utf8" },
);
if (result.status !== 0)
  throw new Error(
    "Start the local Supabase project before generating local environment files.",
  );
const values = JSON.parse(result.stdout);
const url = values.API_URL;
if (url !== "http://127.0.0.1:54391")
  throw new Error("Only this app's isolated local Supabase URL is allowed.");
const key = values.PUBLISHABLE_KEY ?? values.ANON_KEY;
const secret = values.SECRET_KEY ?? values.SERVICE_ROLE_KEY;
if (!key || !secret || !values.DB_URL)
  throw new Error("Local Supabase status is missing required values.");
const marker =
  "# Generated for the isolated Majlis local backend. Never use these files for hosted credentials.\n";
for (const file of [".env.local", ".env.test.local"]) {
  if (existsSync(file) && !readFileSync(file, "utf8").startsWith(marker))
    throw new Error(
      `Refusing to replace the existing ${file}. Configure it manually.`,
    );
}
writeFileSync(
  ".env.local",
  `${marker}NEXT_PUBLIC_SUPABASE_URL=${url}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${key}\n`,
  { mode: 0o600 },
);
writeFileSync(
  ".env.test.local",
  `${marker}TEST_SUPABASE_URL=${url}\nTEST_SUPABASE_KEY=${key}\nTEST_SUPABASE_SECRET_KEY=${secret}\nTEST_DATABASE_URL=${values.DB_URL}\n`,
  { mode: 0o600 },
);
console.log(
  "Wrote ignored local app/test environment files. No keys were printed.",
);

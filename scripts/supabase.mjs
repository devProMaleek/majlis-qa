import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = fileURLToPath(new URL("../", import.meta.url));
const result = spawnSync(
  path.join(root, "node_modules/.bin/supabase"),
  process.argv.slice(2),
  {
    cwd: root,
    stdio: "inherit",
    env: {
      ...process.env,
      SUPABASE_HOME: path.join(root, "work/supabase-cli"),
    },
  },
);
if (result.error) throw result.error;
process.exit(result.status ?? 1);

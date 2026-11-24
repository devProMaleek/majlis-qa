import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { authCookieOptions, getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export async function createServerSupabaseClient(canWriteCookies = false) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  // Auth initialisation also starts asynchronous expiry checks. Keep the entire
  // SDK lifecycle out of Cache Components prerendering, not just the cookie read.
  await connection();
  const cookieStore = await cookies();
  return createServerClient<Database>(config.url, config.key, {
    cookieOptions: authCookieOptions(config.url),
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll(cookiesToSet) {
        // Server Components cannot persist cookies. The proxy refreshes them first.
        // Server Actions opt in so sign-in/out failures cannot be swallowed.
        if (canWriteCookies)
          for (const { name, value, options } of cookiesToSet)
            cookieStore.set(name, value, options);
      },
    },
  });
}

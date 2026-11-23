"use client";

import { createBrowserClient } from "@supabase/ssr";
import { authCookieOptions, getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

export function createBrowserSupabaseClient() {
  const config = getSupabaseConfig();
  if (!config) throw new Error("Supabase is not configured.");
  return createBrowserClient<Database>(config.url, config.key, {
    cookieOptions: authCookieOptions(config.url),
  });
}

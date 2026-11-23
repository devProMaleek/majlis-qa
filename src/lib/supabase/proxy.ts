import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { authCookieOptions, getSupabaseConfig } from "./config";
import type { Database } from "./database.types";

function noStore(response: NextResponse) {
  response.headers.set(
    "Cache-Control",
    "private, no-cache, no-store, must-revalidate, max-age=0",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export async function refreshStaffSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const config = getSupabaseConfig();
  if (!config) return noStore(response);
  const supabase = createServerClient<Database>(config.url, config.key, {
    cookieOptions: authCookieOptions(config.url),
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet, cacheHeaders) {
        for (const { name, value } of cookiesToSet)
          request.cookies.set(name, value);
        const previousCookies = response.cookies.getAll();
        response = NextResponse.next({ request });
        for (const cookie of previousCookies) response.cookies.set(cookie);
        for (const { name, value, options } of cookiesToSet)
          response.cookies.set(name, value, options);
        for (const [name, value] of Object.entries(cacheHeaders))
          response.headers.set(name, value);
      },
    },
  });
  try {
    // Refresh and verify. Authorisation happens again in the DAL and PostgreSQL.
    await supabase.auth.getClaims();
  } catch {
    return noStore(
      NextResponse.json(
        {
          error: "Authentication is temporarily unavailable. Please try again.",
        },
        { status: 503 },
      ),
    );
  }
  return noStore(response);
}

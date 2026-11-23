import { z } from "zod";

function isPublishableKey(key: string) {
  if (key.startsWith("sb_publishable_") && key.length > 20) return true;
  // Local stacks can supply the legacy anon JWT. Never accept a service-role JWT.
  try {
    const parts = key.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")),
    );
    return payload.role === "anon";
  } catch {
    return false;
  }
}

export const supabaseConfigSchema = z.object({
  url: z.url().refine((value) => {
    const url = new URL(value);
    return (
      !url.username &&
      !url.password &&
      (url.protocol === "https:" ||
        (url.protocol === "http:" &&
          ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname)))
    );
  }),
  key: z.string().refine(isPublishableKey),
});

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url && !key) return null;
  const result = supabaseConfigSchema.safeParse({ url, key });
  if (!result.success)
    throw new Error(
      "Invalid Supabase public configuration. Use an HTTPS project URL (or local development URL) and a publishable/anon key.",
    );
  return result.data;
}

export function authCookieOptions(url: string) {
  return {
    path: "/",
    sameSite: "lax" as const,
    secure: new URL(url).protocol === "https:",
  };
}

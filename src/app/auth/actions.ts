"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { signInSchema, type AuthActionState } from "@/lib/auth/schemas";

export async function signIn(
  _previous: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return {
      message: "Check your email and password.",
      errors: {
        email: parsed.error.issues.find((issue) => issue.path[0] === "email")
          ?.message,
        password: parsed.error.issues.find(
          (issue) => issue.path[0] === "password",
        )?.message,
      },
    };
  }
  if (!getSupabaseConfig())
    return { message: "Staff sign-in has not been configured yet." };
  const supabase = await createServerSupabaseClient(true);
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error)
    return {
      message:
        error.status === 429
          ? "Too many sign-in attempts. Please wait and try again."
          : "Sign-in failed. Check your details or contact your organisation administrator.",
    };
  revalidatePath("/staff", "layout");
  redirect("/staff");
}

export async function signOut(): Promise<AuthActionState> {
  if (!getSupabaseConfig()) redirect("/auth/sign-in");
  const supabase = await createServerSupabaseClient(true);
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) return { message: "Could not sign out. Please try again." };
  revalidatePath("/staff", "layout");
  redirect("/auth/sign-in");
}

import "server-only";
import { isAuthRetryableFetchError } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function requireIdentity() {
  if (!getSupabaseConfig()) redirect("/auth/sign-in");
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.getUser();
  if (isAuthRetryableFetchError(error))
    throw new Error("Staff access is temporarily unavailable. Please try again.");
  if (error || !data.user) redirect("/auth/sign-in");
  return { supabase, user: data.user };
}

export async function loadStaffWorkspace() {
  const { supabase, user } = await requireIdentity();
  const [memberships, assignments] = await Promise.all([
    supabase
      .from("organisation_memberships")
      .select("organisation_id,role,organisations!inner(name,slug)")
      .eq("user_id", user.id),
    supabase
      .from("moderator_assignments")
      .select(
        "session_id,organisation_id,lecture_sessions!inner(title,events!inner(name))",
      )
      .eq("user_id", user.id),
  ]);
  if (memberships.error || assignments.error)
    throw new Error("Staff access could not be loaded. Please try again.");
  return {
    email: user.email,
    memberships: memberships.data,
    assignments: assignments.data,
  };
}

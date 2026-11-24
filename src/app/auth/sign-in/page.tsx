import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { SignInForm } from "@/components/auth/sign-in-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Staff sign-in" };

async function SignInContent() {
  const configured = Boolean(getSupabaseConfig());
  if (configured) {
    const supabase = await createServerSupabaseClient();
    const { data } = await supabase.auth.getUser();
    if (data.user) redirect("/staff");
  }
  return <SignInForm configured={configured} />;
}

export default function SignInPage() {
  return (
    <div className="page-width flex max-w-xl flex-col gap-5 py-7 sm:py-12">
      <header>
        <p className="text-[19px] font-bold">Majlis Q&A</p>
        <p className="body-copy">Organisation staff</p>
      </header>
      <main id="main-content" tabIndex={-1}>
        <Card>
          <CardHeader className="gap-3">
            <CardTitle>
              <h1 className="page-title">Staff sign-in</h1>
            </CardTitle>
            <CardDescription>
              Use the account provided by your organisation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense
              fallback={
                <p className="body-copy" role="status">
                  Loading sign-in…
                </p>
              }
            >
              <SignInContent />
            </Suspense>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

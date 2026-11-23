import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { loadStaffWorkspace } from "@/lib/auth/access";
import { SignOutForm } from "@/components/auth/sign-out-form";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

export const metadata: Metadata = { title: "Staff workspace" };

async function StaffWorkspace() {
  const workspace = await loadStaffWorkspace();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">Signed in</p>
          <p className="body-copy wrap-anywhere">{workspace.email}</p>
        </div>
        <SignOutForm />
      </div>
      {!workspace.memberships.length ? (
        <Empty className="border bg-card">
          <EmptyHeader>
            <EmptyTitle>No organisation access</EmptyTitle>
            <EmptyDescription>
              Your account has no current organisation membership. Contact your
              organisation administrator.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <>
          <section
            aria-labelledby="organisations-heading"
            className="flex flex-col gap-3"
          >
            <h2 id="organisations-heading" className="section-title">
              Your organisations
            </h2>
            {workspace.memberships.map((membership) => (
              <Card key={membership.organisation_id}>
                <CardHeader className="gap-3">
                  <CardTitle>
                    <h3>{membership.organisations.name}</h3>
                  </CardTitle>
                  <Badge variant="secondary">
                    {membership.role === "organisation_admin"
                      ? "Organisation admin"
                      : "Moderator"}
                  </Badge>
                  <CardDescription>
                    {membership.role === "organisation_admin"
                      ? "Organisation-wide staff access. Event administration is the next milestone."
                      : "Question access is limited to your assigned sessions."}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </section>
          <section
            aria-labelledby="assignments-heading"
            className="flex flex-col gap-3"
          >
            <h2 id="assignments-heading" className="section-title">
              Assigned sessions
            </h2>
            {workspace.assignments.length ? (
              workspace.assignments.map((assignment) => (
                <Card key={assignment.session_id}>
                  <CardHeader>
                    <CardTitle>
                      <h3>{assignment.lecture_sessions.title}</h3>
                    </CardTitle>
                    <CardDescription>
                      {assignment.lecture_sessions.events.name}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))
            ) : (
              <p className="body-copy">No moderator session assignments.</p>
            )}
          </section>
        </>
      )}
      <p className="body-copy">
        This workspace verifies your current staff access. Question submission
        and moderation actions remain unavailable.
      </p>
      <Link className="review-link w-fit" href="/preview/admin">
        Open design previews
      </Link>
    </div>
  );
}

export default function StaffPage() {
  return (
    <div className="page-width flex max-w-3xl flex-col gap-5 py-7">
      <header>
        <p className="text-[19px] font-bold">Majlis Q&A</p>
        <p className="body-copy">Private staff area</p>
      </header>
      <main id="main-content" tabIndex={-1} className="flex flex-col gap-5">
        <h1 className="page-title">Staff workspace</h1>
        <Suspense
          fallback={
            <p className="body-copy" role="status">
              Checking staff access…
            </p>
          }
        >
          <StaffWorkspace />
        </Suspense>
      </main>
    </div>
  );
}

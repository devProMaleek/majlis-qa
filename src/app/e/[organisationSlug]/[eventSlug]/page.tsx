import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ApplicationShell,
  PreviewNotice,
} from "@/components/shells/application-shell";
import { QuestionFormPreview } from "@/components/attendee/question-form-preview";
import { SessionCard } from "@/components/session-card";
import { pilotEvent, previewSessions } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Ask the lecturer" };

export function generateStaticParams() {
  return [
    {
      organisationSlug: pilotEvent.organisationSlug,
      eventSlug: pilotEvent.slug,
    },
  ];
}

export default async function EventPage({
  params,
}: {
  params: Promise<{ organisationSlug: string; eventSlug: string }>;
}) {
  const { organisationSlug, eventSlug } = await params;
  if (
    organisationSlug !== pilotEvent.organisationSlug ||
    eventSlug !== pilotEvent.slug
  )
    notFound();

  return (
    <ApplicationShell
      context={`${pilotEvent.shortName} · Private questions`}
      active="attendee"
    >
      <div className="flex w-full max-w-[580px] flex-col gap-5">
        <PreviewNotice />
        <section
          aria-labelledby="ask-heading"
          className="flex flex-col gap-5 sm:rounded-2xl sm:border sm:bg-card sm:px-[30px] sm:py-8"
        >
          <div className="flex flex-col gap-3 rounded-xl border bg-card p-[18px] sm:rounded-none sm:border-0 sm:bg-transparent sm:p-0">
            <h1
              id="ask-heading"
              className="text-[17px] leading-tight font-semibold sm:text-[30px] sm:font-bold"
            >
              Ask the lecturer
            </h1>
            <p className="body-copy">
              Submit a question anonymously for the currently active lecture.
            </p>
          </div>
          <SessionCard
            title={previewSessions[0].title}
            details={`${pilotEvent.name} · Session 1`}
            preview
          />
          <QuestionFormPreview />
        </section>
      </div>
    </ApplicationShell>
  );
}

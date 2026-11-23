import type { Metadata } from "next";
import {
  ApplicationShell,
  PreviewNotice,
} from "@/components/shells/application-shell";
import { QuestionQueuePreview } from "@/components/moderator/question-queue-preview";

export const metadata: Metadata = { title: "Moderator preview" };

export default function ModeratorPage() {
  return (
    <ApplicationShell
      context="Moderation / KBC 2026 / Understanding Our Deen"
      active="moderator"
    >
      <PreviewNotice />
      <QuestionQueuePreview />
    </ApplicationShell>
  );
}

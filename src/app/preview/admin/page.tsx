import type { Metadata } from "next";
import {
  ApplicationShell,
  PreviewNotice,
} from "@/components/shells/application-shell";
import { OrganisationOverview } from "@/components/admin/organisation-overview";
import { pilotEvent } from "@/lib/preview/data";

export const metadata: Metadata = { title: "Organisation admin preview" };

export default function AdminPage() {
  return (
    <ApplicationShell
      context={`${pilotEvent.organisation} / Organisation dashboard`}
      active="admin"
    >
      <PreviewNotice />
      <OrganisationOverview />
    </ApplicationShell>
  );
}

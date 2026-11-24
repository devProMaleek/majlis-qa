import Link from "next/link";
import { Button } from "@/components/ui/button";
import { pilotEvent } from "@/lib/preview/data";

export default function NotFound() {
  return (
    <main
      id="main-content"
      className="page-width flex min-h-dvh max-w-xl flex-col items-start justify-center gap-5"
    >
      <p className="text-sm font-semibold text-muted-foreground">
        Majlis Q&A · 404
      </p>
      <h1 className="page-title">Page not found</h1>
      <p className="body-copy">
        Check the event link or return to the sample event.
      </p>
      <Button asChild>
        <Link href={pilotEvent.href}>Open sample event</Link>
      </Button>
    </main>
  );
}

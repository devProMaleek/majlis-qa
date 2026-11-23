"use client";

import { Button } from "@/components/ui/button";

export default function StaffError({ reset }: { reset: () => void }) {
  return (
    <main
      id="main-content"
      className="page-width flex max-w-xl flex-col items-start gap-5 py-12"
    >
      <h1 className="page-title">Staff access is unavailable</h1>
      <p className="body-copy">
        We could not verify your access or load this workspace. Please try
        again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}

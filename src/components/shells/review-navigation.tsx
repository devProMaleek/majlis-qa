"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { pilotEvent } from "@/lib/preview/data";

const previews = [
  { id: "attendee", label: "Attendee", href: pilotEvent.href },
  { id: "moderator", label: "Moderator", href: "/preview/moderator" },
  { id: "admin", label: "Admin", href: "/preview/admin" },
  { id: "components", label: "Components", href: "/preview/design-system" },
] as const;

export type PreviewSurface = (typeof previews)[number]["id"];

export function ReviewNavigation({ active }: { active: PreviewSurface }) {
  const [open, setOpen] = useState(false);
  const links = previews.map((preview) => (
    <Link
      key={preview.id}
      href={preview.href}
      className="review-link"
      aria-current={active === preview.id ? "page" : undefined}
      onClick={() => setOpen(false)}
    >
      {preview.label}
    </Link>
  ));

  return (
    <>
      <nav
        aria-label="Preview navigation"
        className="hidden items-center gap-1 md:flex"
      >
        {links}
      </nav>
      <div className="md:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              Previews
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader className="pr-10">
              <DialogTitle>Application previews</DialogTitle>
              <DialogDescription>
                Explore the sample screens. These links do not change your
                account role.
              </DialogDescription>
            </DialogHeader>
            <nav
              aria-label="Preview navigation"
              className="flex flex-col gap-1"
            >
              {links}
            </nav>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

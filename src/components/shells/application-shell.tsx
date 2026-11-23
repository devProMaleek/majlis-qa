import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReviewNavigation, type PreviewSurface } from "./review-navigation";
import { cn } from "@/lib/utils";

export function ApplicationShell({
  context,
  active,
  children,
  className,
}: {
  context: string;
  active: PreviewSurface;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <header className="page-width flex items-start justify-between gap-4 pt-7 pb-5">
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-[19px] leading-tight font-bold">Majlis Q&A</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {context}
          </p>
        </div>
        <ReviewNavigation active={active} />
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className={cn("page-width flex flex-col gap-5 pb-10", className)}
      >
        {children}
      </main>
    </>
  );
}

export function PreviewNotice() {
  return (
    <Alert role="note" className="max-w-[1120px]" aria-label="Design preview">
      <InfoIcon aria-hidden="true" />
      <AlertTitle>Design preview</AlertTitle>
      <AlertDescription>
        Sample content only. Questions are not sent and staff actions are not
        connected.
      </AlertDescription>
    </Alert>
  );
}

export function SectionNavigation({
  items,
}: {
  items: readonly { label: string; href: string }[];
}) {
  return (
    <nav
      aria-label="Page sections"
      className="flex w-fit max-w-full flex-wrap items-center gap-1 rounded-xl bg-muted p-1"
    >
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          className="review-link text-foreground"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

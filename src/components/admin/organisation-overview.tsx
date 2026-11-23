import { CheckIcon, CircleIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionNavigation } from "@/components/shells/application-shell";
import { pilotEvent, previewSessions } from "@/lib/preview/data";

const checklist = [
  { label: "Event details complete", complete: true },
  { label: "Lecture sessions added", complete: true },
  { label: "Moderator assigned", complete: false },
  { label: "Publish event", complete: false },
];

export function OrganisationOverview() {
  return (
    <div className="flex max-w-[1120px] flex-col gap-5">
      <section
        id="overview"
        aria-labelledby="overview-heading"
        className="flex flex-col gap-5"
      >
        <h1 id="overview-heading" className="page-title">
          Events overview
        </h1>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { title: "1 Draft event", description: "Not yet published" },
            {
              title: `${previewSessions.length} Sessions`,
              description: "One may be open at a time",
            },
            {
              title: "2 Moderators",
              description: "Session assignments pending",
            },
          ].map((stat) => (
            <Card key={stat.title} size="sm">
              <CardHeader className="gap-2.5">
                <CardTitle>{stat.title}</CardTitle>
                <CardDescription>{stat.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>
      <Card id="events">
        <CardHeader className="gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <CardTitle>
              <h2>{pilotEvent.name}</h2>
            </CardTitle>
            <Badge variant="secondary">{pilotEvent.status}</Badge>
          </div>
          <CardDescription>
            Event details · Sessions · Moderators · Publish · Stable event QR
            code
          </CardDescription>
        </CardHeader>
      </Card>
      <section
        id="setup"
        aria-labelledby="setup-heading"
        className="flex flex-col gap-5"
      >
        <h2 id="setup-heading" className="section-title">
          Guided event setup
        </h2>
        <ol aria-label="Event setup progress" className="flex flex-wrap gap-2">
          {["Details", "Sessions", "Team", "Review", "QR"].map(
            (step, index) => (
              <li key={step}>
                <Badge variant={index === 2 ? "outline" : "secondary"}>
                  {index + 1} {step}
                  {index < 2 ? " ✓" : ""}
                </Badge>
              </li>
            ),
          )}
        </ol>
        <div className="grid items-start gap-[18px] md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h3>Event details</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="body-copy grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1">
                <dt>Name</dt>
                <dd>{pilotEvent.name}</dd>
                <dt>Slug</dt>
                <dd className="wrap-anywhere">
                  {pilotEvent.organisationSlug}/{pilotEvent.slug}
                </dd>
                <dt>Dates</dt>
                <dd>{pilotEvent.dateLabel}</dd>
                <dt>Status</dt>
                <dd>{pilotEvent.status}</dd>
              </dl>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <h3>Publishing checklist</h3>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col gap-3">
                {checklist.map((item) => (
                  <li
                    key={item.label}
                    className="flex items-center gap-2 text-[13px] text-muted-foreground"
                  >
                    {item.complete ? (
                      <CheckIcon
                        className="size-4 shrink-0 text-success-foreground"
                        aria-hidden="true"
                      />
                    ) : (
                      <CircleIcon
                        className="size-4 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>
                      {item.label}
                      <span className="sr-only">
                        : {item.complete ? "complete" : "pending"}
                      </span>
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
        <div className="flex flex-col items-start gap-3">
          <Button disabled aria-describedby="setup-help">
            Continue event setup
          </Button>
          <p id="setup-help" className="body-copy">
            Editing and publishing will be available once staff access is
            connected.
          </p>
        </div>
      </section>
      <Card id="team">
        <CardHeader>
          <CardTitle>
            <h2>Team and quick actions</h2>
          </CardTitle>
          <CardDescription>
            2 sample moderators · Session assignments pending.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="body-copy">
            Invite staff, assign moderators and prepare a permanent QR code for
            your event.
          </p>
        </CardContent>
        <CardFooter className="flex-wrap gap-2">
          <Button variant="secondary" size="sm" disabled>
            Create event
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Invite moderator
          </Button>
          <Button variant="secondary" size="sm" disabled>
            Get QR code
          </Button>
        </CardFooter>
      </Card>
      <SectionNavigation
        items={[
          { label: "Home", href: "#overview" },
          { label: "Events", href: "#events" },
          { label: "Team", href: "#team" },
        ]}
      />
    </div>
  );
}

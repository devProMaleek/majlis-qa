import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SessionCard } from "@/components/session-card";
import { ButtonExamples } from "@/components/design-system/button-examples";
import { ApplicationShell } from "@/components/shells/application-shell";

export const metadata: Metadata = { title: "Design system preview" };

const tokens = [
  { name: "Canvas", value: "#f8fafc", className: "bg-background" },
  { name: "Surface", value: "#ffffff", className: "bg-card" },
  { name: "Ink", value: "#111827", className: "bg-foreground" },
  { name: "Muted", value: "#64748b", className: "bg-muted-foreground" },
  { name: "Primary", value: "#2563eb", className: "bg-primary" },
  { name: "Light", value: "#f1f5f9", className: "bg-muted" },
  { name: "Border", value: "#e2e8f0", className: "bg-border" },
  { name: "Green", value: "#16a34a", className: "bg-success" },
  { name: "Amber", value: "#d97706", className: "bg-warning" },
];

export default function DesignSystemPage() {
  return (
    <ApplicationShell
      context="Design foundations / Reusable components"
      active="components"
    >
      <div className="flex max-w-[1000px] flex-col gap-5">
        <h1 className="page-title">Component system</h1>
        <p className="body-copy">
          Figma foundations with Inter typography, semantic colours and
          accessible controls.
        </p>
        <Card>
          <CardHeader>
            <CardTitle>
              <h2>Actions</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ButtonExamples />
          </CardContent>
        </Card>
        <div className="grid gap-5 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Status badges</h2>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="success">● Live</Badge>
              <Badge variant="warning">Connection unstable</Badge>
              <Badge variant="secondary">Draft</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>
                <h2>Form controls</h2>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="example-input">Example input</FieldLabel>
                  <Input id="example-input" placeholder="Enter a value..." />
                  <FieldDescription>
                    44px minimum control height.
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>
        <SessionCard
          title="Understanding Our Deen"
          details="Scheduled · 1 assigned moderator (example)"
        />
        <Alert role="note">
          <AlertTitle>Connection interrupted</AlertTitle>
          <AlertDescription>
            Changes cannot be saved until you reconnect. Component example only.
          </AlertDescription>
        </Alert>
        <Card id="tokens">
          <CardHeader>
            <CardTitle>
              <h2>Colour tokens</h2>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-4 min-[420px]:grid-cols-2 sm:grid-cols-3">
              {tokens.map((token) => (
                <li key={token.name} className="flex items-center gap-3">
                  <span
                    aria-hidden="true"
                    className={`size-10 shrink-0 rounded-lg border ${token.className}`}
                  />
                  <div>
                    <p className="text-sm font-semibold">{token.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {token.value}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </ApplicationShell>
  );
}

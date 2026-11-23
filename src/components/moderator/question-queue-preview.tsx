"use client";

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionNavigation } from "@/components/shells/application-shell";
import { QuestionCard } from "./question-card";
import { countQuestions, filterQuestions } from "@/lib/preview/questions";
import {
  previewQuestions,
  questionStatuses,
  type PreviewQuestion,
  type QuestionStatus,
} from "@/lib/preview/data";

function QuestionBody({ question }: { question: PreviewQuestion }) {
  return (
    <div className="flex min-w-0 flex-col gap-5">
      <p
        className="text-xl leading-snug font-semibold wrap-anywhere sm:text-[25px]"
        dir="auto"
      >
        {question.body}
      </p>
      <p className="body-copy">
        Received at {question.receivedAt} · Anonymous attendee
      </p>
      <div className="flex flex-wrap gap-3">
        <Button disabled>
          {question.status === "Selected"
            ? "Mark answered"
            : question.status === "Dismissed"
              ? "Restore question"
              : "Select question"}
        </Button>
        {question.status !== "Dismissed" && (
          <Button variant="secondary" disabled>
            Dismiss
          </Button>
        )}
      </div>
      <p className="body-copy">
        Moderation actions are unavailable in this preview.
      </p>
      <section
        className="flex flex-col items-start gap-2 rounded-xl border p-[18px]"
        aria-label="Reading mode preview"
      >
        <h3 className="text-[17px] font-semibold">Reading mode</h3>
        <p className="body-copy">
          A focused view for selected questions, with larger text and keyboard
          navigation.
        </p>
        <Button variant="outline" size="sm" disabled>
          Open reading mode
        </Button>
      </section>
    </div>
  );
}

export function QuestionQueuePreview() {
  const [status, setStatus] = useState<QuestionStatus>("New");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(101);
  const [detailOpen, setDetailOpen] = useState(false);
  const opener = useRef<HTMLButtonElement | null>(null);
  const visible = filterQuestions(previewQuestions, status, search);
  const selected =
    visible.find((question) => question.id === selectedId) ?? visible[0];

  function openQuestion(id: number) {
    setSelectedId(id);
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      opener.current = document.activeElement as HTMLButtonElement;
      setDetailOpen(true);
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2" aria-label="Sample queue status">
        <Badge variant="warning">Preview · Not connected</Badge>
        {questionStatuses.slice(0, 3).map((item) => (
          <Badge key={item} variant="secondary">
            {countQuestions(previewQuestions, item)} {item}
          </Badge>
        ))}
      </div>
      <section
        id="questions"
        aria-labelledby="queue-heading"
        className="flex max-w-[1150px] flex-col gap-4"
      >
        <h1 id="queue-heading" className="section-title">
          Incoming questions
        </h1>
        <Tabs
          value={status}
          onValueChange={(value) => setStatus(value as QuestionStatus)}
          className="gap-4"
        >
          <div className="flex max-w-[390px] flex-col gap-3">
            <Field>
              <FieldLabel htmlFor="question-search" className="sr-only">
                Search questions
              </FieldLabel>
              <Input
                id="question-search"
                type="search"
                placeholder="Search questions or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Field>
            <TabsList
              variant="line"
              aria-label="Question status"
              className="w-full"
            >
              {questionStatuses.map((item) => (
                <TabsTrigger key={item} value={item}>
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {questionStatuses.map((item) => (
            <TabsContent key={item} value={item}>
              <div className="grid gap-5 lg:grid-cols-[350px_minmax(0,1fr)]">
                <div className="flex min-w-0 flex-col gap-3">
                  <p className="sr-only" role="status">
                    {visible.length} {status.toLowerCase()} questions
                  </p>
                  {visible.length ? (
                    visible.map((question) => (
                      <QuestionCard
                        key={question.id}
                        question={question}
                        active={selected?.id === question.id}
                        onOpen={() => openQuestion(question.id)}
                      />
                    ))
                  ) : (
                    <Empty className="border">
                      <EmptyHeader>
                        <EmptyTitle>No matching questions</EmptyTitle>
                        <EmptyDescription>
                          Try a different search or another status.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
                <div className="hidden min-w-0 lg:block">
                  {selected ? (
                    <Card className="gap-5 [--card-spacing:--spacing(6)]">
                      <CardHeader>
                        <h2 className="text-sm font-semibold text-muted-foreground">
                          Question #{selected.id} · {selected.status}
                        </h2>
                      </CardHeader>
                      <CardContent>
                        <QuestionBody question={selected} />
                      </CardContent>
                    </Card>
                  ) : (
                    <Empty className="min-h-64 border">
                      <EmptyHeader>
                        <EmptyTitle>No question selected</EmptyTitle>
                        <EmptyDescription>
                          Matching questions will appear here.
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </section>
      <section
        id="sessions"
        className="max-w-[1150px]"
        aria-label="Session assignment preview"
      >
        <p className="body-copy">
          Sample session: Understanding Our Deen · KBC 2026. Assigned-session
          access will be connected in a later milestone.
        </p>
      </section>
      <SectionNavigation
        items={[
          { label: "Questions", href: "#questions" },
          { label: "Session", href: "#sessions" },
        ]}
      />
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent
          className="max-h-[90dvh] overflow-y-auto sm:max-w-xl"
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            opener.current?.focus();
          }}
        >
          <DialogHeader className="pr-10">
            <DialogTitle>
              Question #{selected?.id} · {selected?.status}
            </DialogTitle>
            <DialogDescription>Sample question · KBC 2026</DialogDescription>
          </DialogHeader>
          {selected && <QuestionBody question={selected} />}
        </DialogContent>
      </Dialog>
    </>
  );
}

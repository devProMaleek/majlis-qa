"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export function QuestionFormPreview() {
  const [question, setQuestion] = useState("");
  return (
    <form
      onSubmit={(event) => event.preventDefault()}
      className="flex flex-col gap-5"
      aria-label="Question preview"
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="question">Your question</FieldLabel>
          <Textarea
            id="question"
            name="question"
            dir="auto"
            placeholder="Assalamu alaykum. My question is..."
            value={question}
            maxLength={1000}
            onChange={(event) => setQuestion(event.target.value)}
            aria-describedby="question-count question-preview-help"
            className="min-h-[100px] resize-y sm:min-h-[132px]"
          />
          <FieldDescription id="question-count">
            {question.length.toLocaleString("en")} / 1,000 characters
          </FieldDescription>
        </Field>
      </FieldGroup>
      <div className="flex flex-col items-start gap-3">
        <Button type="submit" disabled aria-describedby="question-preview-help">
          Submit question
        </Button>
        <p id="question-preview-help" className="body-copy">
          Submission is unavailable in this preview. Please use sample text; it
          is not saved.
        </p>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Anonymous · Private to moderators · No account needed
      </p>
    </form>
  );
}

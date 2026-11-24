import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { PreviewQuestion } from "@/lib/preview/data";
import { cn } from "@/lib/utils";

export function QuestionCard({
  question,
  active,
  onOpen,
}: {
  question: PreviewQuestion;
  active: boolean;
  onOpen: () => void;
}) {
  return (
    <Card
      size="sm"
      className={cn(
        "relative lg:has-data-[slot=card-footer]:pb-4",
        active && "lg:border-primary",
      )}
    >
      <CardHeader className="gap-2.5">
        <CardTitle>
          <button
            type="button"
            onClick={onOpen}
            aria-label={`View question ${question.id}: ${question.status.toUpperCase()} · #${question.id}`}
            aria-pressed={active}
            className="min-h-11 text-left after:absolute after:inset-0 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-primary"
          >
            {question.status.toUpperCase()} · #{question.id}
          </button>
        </CardTitle>
        <CardDescription>{question.summary}</CardDescription>
      </CardHeader>
      <CardFooter className="relative flex-wrap gap-2 lg:hidden">
        <Button variant="secondary" size="sm" disabled>
          Select
        </Button>
        <Button variant="ghost" size="sm" disabled>
          Dismiss
        </Button>
      </CardFooter>
    </Card>
  );
}

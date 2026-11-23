"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function ButtonExamples() {
  const [example, setExample] = useState(
    "Choose a button to inspect its interaction state.",
  );
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={() =>
            setExample("Primary button activated. This is a component example.")
          }
        >
          Primary action
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setExample(
              "Secondary button activated. This is a component example.",
            )
          }
        >
          Secondary action
        </Button>
        <Button
          variant="destructive"
          onClick={() =>
            setExample("Destructive button activated. No data was changed.")
          }
        >
          Destructive action
        </Button>
        <Button disabled>Disabled action</Button>
      </div>
      <p className="body-copy" role="status">
        {example}
      </p>
    </div>
  );
}

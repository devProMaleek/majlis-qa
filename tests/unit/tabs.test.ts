import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Tabs, TabsList, TabsTrigger } from "../../src/components/ui/tabs";

test("tabs expose matching Radix tablist semantics for both orientations", () => {
  for (const orientation of [undefined, "horizontal", "vertical"] as const) {
    const html = renderToStaticMarkup(
      createElement(
        Tabs,
        { orientation, defaultValue: "first" },
        createElement(
          TabsList,
          { "aria-label": "Example tabs" },
          createElement(TabsTrigger, { value: "first" }, "First"),
        ),
      ),
    );
    assert.match(
      html,
      new RegExp(`role="tablist"[^>]*aria-orientation="${orientation ?? "horizontal"}"`),
    );
  }
});

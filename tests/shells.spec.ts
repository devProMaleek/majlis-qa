import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const routes = [
  { path: "/e/dcl/kbc-2026", heading: "Ask the lecturer", name: "attendee" },
  {
    path: "/preview/moderator",
    heading: "Incoming questions",
    name: "moderator",
  },
  { path: "/preview/admin", heading: "Events overview", name: "admin" },
  {
    path: "/preview/design-system",
    heading: "Component system",
    name: "components",
  },
];

async function openPreviewNavigation(page: Page) {
  const menu = page.getByRole("button", { name: "Previews", exact: true });
  if (await menu.isVisible()) await menu.click();
  return page.getByRole("navigation", { name: "Preview navigation" });
}

for (const route of routes) {
  test(`${route.name}: accessible responsive shell`, async ({
    page,
  }, testInfo) => {
    const runtimeErrors: string[] = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    await page.goto(route.path);
    await expect(
      page.getByRole("heading", { name: route.heading, exact: true }),
    ).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(runtimeErrors).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`${route.name}.png`),
      fullPage: true,
    });
  });
}

test("review navigation works without implying a role change", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/e\/dcl\/kbc-2026$/);
  const navigation = await openPreviewNavigation(page);
  await navigation
    .getByRole("link", { name: "Moderator", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Incoming questions" }),
  ).toBeVisible();
  await expect(page.getByText("Preview · Not connected")).toBeVisible();
  const adminNavigation = await openPreviewNavigation(page);
  await adminNavigation
    .getByRole("link", { name: "Admin", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Events overview" }),
  ).toBeVisible();
  await expect(page.getByText("1 Draft event", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue event setup" }),
  ).toBeDisabled();
});

test("attendee form counts text, enforces its preview limit and sends nothing", async ({
  page,
}) => {
  const writes: string[] = [];
  page.on("request", (request) => {
    if (!["GET", "HEAD"].includes(request.method())) writes.push(request.url());
  });
  await page.goto("/e/dcl/kbc-2026");
  const question = page.getByRole("textbox", { name: "Your question" });
  await question.fill("A sample question");
  await expect(page.getByText("17 / 1,000 characters")).toBeVisible();
  await question.fill("a".repeat(1000));
  await question.press("End");
  await question.press("b");
  await expect(question).toHaveValue("a".repeat(1000));
  await expect(
    page.getByRole("button", { name: "Submit question" }),
  ).toBeDisabled();
  await expect(
    page.getByText("Submission is unavailable in this preview.", {
      exact: false,
    }),
  ).toBeVisible();
  await page.reload();
  await expect(question).toHaveValue("");
  expect(writes).toEqual([]);
});

test("queue search, empty state, status filters and detail browsing", async ({
  page,
}) => {
  await page.goto("/preview/moderator");
  const search = page.getByRole("searchbox", { name: "Search questions" });
  await search.fill("102");
  await expect(
    page.getByRole("button", { name: "View question 102" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "View question 101" }),
  ).toHaveCount(0);
  await search.fill("no such sample question");
  await expect(
    page.getByText("No matching questions", { exact: true }),
  ).toBeVisible();
  await search.fill("");
  await page.getByRole("tab", { name: "Selected", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "View question 103" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Answered", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "View question 104" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "Dismissed", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "View question 105" }),
  ).toBeVisible();
  await page.getByRole("tab", { name: "New", exact: true }).click();
  const question = page.getByRole("button", { name: "View question 102" });
  await question.click();
  if ((page.viewportSize()?.width ?? 0) < 1024) {
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByText(/when doing good deeds/)).toBeVisible();
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(question).toBeFocused();
  } else {
    await expect(
      page.getByRole("heading", { name: "Question #102 · New" }),
    ).toBeVisible();
    await expect(page.getByText(/when doing good deeds/)).toBeVisible();
  }
});

test("keyboard navigation and approved minimum control sizes", async ({
  page,
}) => {
  await page.goto("/preview/moderator");
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();
  await page.getByRole("tab", { name: "New", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Selected", exact: true }),
  ).toBeFocused();
  const controls = page.locator(
    "button:visible:not(:disabled), input:visible, [role=tab]:visible",
  );
  for (const control of await controls.all()) {
    const box = await control.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
  }
});

test("unknown event and organisation do not resolve to the pilot", async ({
  page,
}) => {
  for (const path of ["/e/other/kbc-2026", "/e/dcl/missing"]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", { name: "Page not found" }),
    ).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Your question" }),
    ).toHaveCount(0);
  }
});

test("approved light palette stays consistent under a dark system preference", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/e/dcl/kbc-2026");
  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(248, 250, 252)",
  );
  await expect(page.getByRole("textbox", { name: "Your question" })).toHaveCSS(
    "background-color",
    "rgb(255, 255, 255)",
  );
});

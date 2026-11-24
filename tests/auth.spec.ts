import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import {
  localReviewAccounts,
  localReviewPassword,
} from "../scripts/seed-local-backend";

test.skip(
  !process.env.TEST_SUPABASE_URL,
  "Start and seed the local backend to run Auth browser tests.",
);

const runtimeErrors = new WeakMap<Page, string[]>();
test.beforeEach(({ page }) => {
  const errors: string[] = [];
  runtimeErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
});
test.afterEach(({ page }) => {
  expect(runtimeErrors.get(page)).toEqual([]);
});

async function login(page: Page, email: string) {
  await page.goto("/auth/sign-in");
  await page.getByRole("textbox", { name: "Email address" }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(localReviewPassword);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/staff$/);
}

test("staff route requires a verified session and auth responses are not cacheable", async ({
  page,
}) => {
  await page.goto("/staff");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
  await expect(
    page.getByRole("heading", { name: "Staff sign-in", exact: true }),
  ).toBeVisible();
  const response = await page.goto("/auth/sign-in");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("wrong credentials display a generic error without exposing staff data", async ({
  page,
}) => {
  await page.goto("/auth/sign-in");
  await page
    .getByRole("textbox", { name: "Email address" })
    .fill(localReviewAccounts.admin);
  await page.getByLabel("Password", { exact: true }).fill("WrongPassword2026!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(
    page.getByRole("form", { name: "Staff sign-in" }).getByRole("alert"),
  ).toContainText("Sign-in failed.");
  await expect(
    page.getByRole("heading", { name: "Your organisations" }),
  ).toHaveCount(0);
});

test("admin sign-in persists on reload, scopes membership and signs out", async ({
  page,
}) => {
  await login(page, localReviewAccounts.admin);
  await expect(
    page.getByRole("heading", { name: "Deen Communications", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Other Test Organisation", exact: true }),
  ).toHaveCount(0);
  const response = await page.reload();
  expect(response?.headers()["cache-control"]).toContain("no-store");
  await expect(
    page.getByRole("heading", { name: "Deen Communications", exact: true }),
  ).toBeVisible();
  expect(
    (
      await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze()
    ).violations,
  ).toEqual([]);
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
  await page.goto("/staff");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
});

test("moderator workspace contains only its actual assigned session", async ({
  page,
}) => {
  await login(page, localReviewAccounts.moderator);
  await expect(
    page.getByRole("heading", { name: "Understanding Our Deen", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Questions and Answers", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Other Private Session", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByText("Local private question B", { exact: true }),
  ).toHaveCount(0);
});

test("authenticated accounts without membership receive no organisation access", async ({
  page,
}) => {
  await login(page, localReviewAccounts.outsider);
  await expect(
    page.getByText("No organisation access", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Deen Communications", exact: true }),
  ).toHaveCount(0);
});

test("unverifiable session cookies cannot unlock the staff workspace", async ({
  page,
  context,
}) => {
  const value = `base64-${Buffer.from(JSON.stringify({ access_token: "invalid.forged.token", refresh_token: "invalid", expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: "10000000-0000-4000-8000-000000000001" } })).toString("base64url")}`;
  await context.addCookies([
    {
      name: "sb-127-auth-token",
      value,
      url: "http://127.0.0.1:3100",
      sameSite: "Lax",
    },
  ]);
  await page.goto("/staff");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
  await expect(
    page.getByRole("heading", { name: "Deen Communications", exact: true }),
  ).toHaveCount(0);
});

test("proxy refreshes an expired stored session and preserves new cookies", async ({
  page,
  context,
}) => {
  await login(page, localReviewAccounts.admin);
  const cookies = (await context.cookies())
    .filter((cookie) => cookie.name.includes("auth-token"))
    .sort((a, b) => a.name.localeCompare(b.name));
  expect(cookies.length).toBeGreaterThan(0);
  const value = cookies.map((cookie) => cookie.value).join("");
  expect(value.startsWith("base64-")).toBe(true);
  const session = JSON.parse(
    Buffer.from(value.slice(7), "base64url").toString("utf8"),
  );
  // Keep the genuine refresh token. Expire only the persisted session metadata.
  session.expires_at = Math.floor(Date.now() / 1000) - 60;
  const expired = `base64-${Buffer.from(JSON.stringify(session)).toString("base64url")}`;
  let offset = 0;
  await context.addCookies(
    cookies.map((cookie, index) => {
      const chunk =
        index === cookies.length - 1
          ? expired.slice(offset)
          : expired.slice(offset, offset + cookie.value.length);
      offset += chunk.length;
      return { ...cookie, value: chunk };
    }),
  );
  const response = await page.goto("/staff");
  await expect(
    page.getByRole("heading", { name: "Deen Communications", exact: true }),
  ).toBeVisible();
  expect((await response?.allHeaders())?.["set-cookie"]).toBeTruthy();
  expect(response?.headers()["cache-control"]).toContain("no-store");
  const refreshed = (await context.cookies())
    .filter((cookie) => cookie.name.includes("auth-token"))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((cookie) => cookie.value)
    .join("");
  const refreshedSession = JSON.parse(
    Buffer.from(refreshed.slice(7), "base64url").toString("utf8"),
  );
  expect(refreshedSession.expires_at).toBeGreaterThan(Date.now() / 1000);
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Deen Communications", exact: true }),
  ).toBeVisible();
});

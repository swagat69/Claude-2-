import { expect, test } from "@playwright/test";

test("the live hero question starts with the selected purpose", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("See which loan routes may fit, before you talk to anyone");
  const goals = page.getByRole("list", { name: "Loan purposes" });
  await expect(goals.getByRole("link")).toHaveCount(6);
  await goals.getByRole("link", { name: "Debt consolidation", exact: true }).click();
  await expect(page).toHaveURL(/\/assessment\/goal\?goal=consolidation&from=hero$/);
  await expect(page.getByRole("radio", { name: /^Debt consolidation/ })).toBeChecked();
});

test("a direct goal link works in a fresh tab", async ({ page }) => {
  await page.goto("/assessment/goal?goal=renovation&from=hero");
  await expect(page.getByRole("radio", { name: /^Home renovation/ })).toBeChecked();
});

test("a new hero choice preserves saved answers until a restart is confirmed", async ({ page }) => {
  await page.goto("/assessment/goal?goal=personal&from=hero");
  await expect(page.getByRole("radio", { name: /^Personal loan/ })).toBeChecked();
  await page.goto("/");
  await page.getByRole("link", { name: "Debt consolidation", exact: true }).click();
  await expect(page).toHaveURL(/\/assessment\?goal=consolidation&from=hero$/);
  expect(await page.evaluate(() => JSON.parse(sessionStorage.getItem("dfx.assessment")!).answers.goal)).toBe("personal");
  await expect(page.getByRole("button", { name: "Continue where I left off" })).toBeVisible();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("all four FAQ answers and purpose links are available", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#faqs dd")).toHaveCount(4);
    for (const answer of await page.locator("#faqs dd").all()) await expect(answer).toBeVisible();
    await expect(page.getByRole("link", { name: "Personal loan", exact: true })).toHaveAttribute("href", "/assessment/goal?goal=personal&from=hero");
  });
});

test("reduced motion leaves the page immediately readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("heading", { name: "What happens after you answer" })).toBeVisible();
  expect(await page.evaluate(() => document.getAnimations().filter(a => a.playState === "running").length)).toBe(0);
});

test("anchor links land below the header", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "FAQs" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await page.getByRole("banner").getByRole("link", { name: "FAQs" }).click();
  }
  const heading = page.getByRole("heading", { name: "Questions people ask first" });
  await expect(heading).toBeInViewport();
  const bottom = await page.getByRole("banner").evaluate(h => h.getBoundingClientRect().bottom);
  await expect.poll(() => heading.evaluate(h => h.getBoundingClientRect().top)).toBeGreaterThanOrEqual(Math.max(bottom, 0));
});

test("every footer link resolves", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.getByRole("contentinfo").getByRole("link").evaluateAll(links => links.map(a => a.getAttribute("href") ?? ""));
  for (const href of new Set(hrefs.map(h => h.split("#")[0] || "/"))) expect((await request.get(href)).status(), href).toBe(200);
});

test("unknown pages retain the shared header, footer and a way home", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We can’t find that page");
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go to the homepage" })).toBeVisible();
});

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = ["/", "/design-system", "/design-system/forms", "/design-system/feedback", "/design-system/cards"];

for (const route of routes) {
  test(`${route} has no WCAG 2.2 AA violations`, async ({ page }) => {
    await page.goto(route);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      // The contrast audit's "don't use" chips fail on purpose; nothing else is excluded.
      .exclude('[data-axe-exempt="contrast-example"]')
      .analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`);
    expect(summary).toEqual([]);
  });

  test(`${route} loads without console errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(route);
    await page.waitForLoadState("networkidle");
    expect(errors).toEqual([]);
  });

  test(`${route} never scrolls sideways at 320px`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBe(0);
  });
}

test("an open dialog has no WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto("/design-system/feedback");
  await page.locator("#dialogs").getByRole("button", { name: "Start again" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
  expect(results.violations.map((v) => v.id)).toEqual([]);
});

test("the old /design-system/components URL redirects to forms", async ({ page }) => {
  await page.goto("/design-system/components");
  await expect(page).toHaveURL(/\/design-system\/forms$/);
});

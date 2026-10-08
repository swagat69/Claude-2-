import { expect, test, type Page } from "@playwright/test";

const revealedOpacities = (page: Page) =>
  page.$$eval("[data-reveal]", (els) => els.map((el) => [el.getAttribute("data-reveal"), getComputedStyle(el).opacity]));

async function scrollThrough(page: Page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= height; y += 400) {
    await page.evaluate((top) => window.scrollTo(0, top), y);
    await page.waitForTimeout(40);
  }
}

test("hero promise, CTA and first paint", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Make the right next move, with clarity.");
  const cta = page.getByRole("main").getByRole("link", { name: "Find my next step" }).first();
  await expect(cta).toHaveAttribute("href", "/assessment?from=hero");
  await expect(page.getByText("Illustrative preview").first()).toBeVisible();
  await page.waitForTimeout(900);
  expect(await page.getByRole("heading", { level: 1 }).evaluate((h) => getComputedStyle(h).opacity)).toBe("1");
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("every section is readable", async ({ page }) => {
    await page.goto("/");
    for (const [, opacity] of await revealedOpacities(page)) expect(opacity).toBe("1");
    for (const name of ["Three steps. You stay in control.", "Start from what you need.", "Before you start", "Ready when you are."]) {
      await expect(page.getByRole("heading", { name })).toBeVisible();
    }
  });
});

test.describe("with reduced motion", () => {
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  test("nothing is hidden or waits to appear", async ({ page }) => {
    await page.goto("/");
    await scrollThrough(page);
    for (const [state, opacity] of await revealedOpacities(page)) {
      expect(state).toBe("static");
      expect(opacity).toBe("1");
    }
  });
});

test("sections reveal once as they scroll into view", async ({ page }) => {
  await page.goto("/");
  const steps = page.locator("#how-it-works ol");
  await expect(steps).toHaveAttribute("data-reveal", "pending");
  await steps.scrollIntoViewIfNeeded();
  await expect(steps).toHaveAttribute("data-reveal", "in");
  await expect.poll(() => steps.evaluate((el) => getComputedStyle(el).opacity)).toBe("1");
});

test("anchor links land below the header", async ({ page, isMobile }) => {
  await page.goto("/");
  if (isMobile) {
    await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "FAQs" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeHidden();
  } else {
    await page.getByRole("banner").getByRole("link", { name: "FAQs" }).click();
  }
  const heading = page.getByRole("heading", { name: "Before you start" });
  await expect(heading).toBeInViewport();
  const headerBottom = await page.getByRole("banner").evaluate((h) => h.getBoundingClientRect().bottom);
  await expect.poll(() => heading.evaluate((h) => h.getBoundingClientRect().top)).toBeGreaterThanOrEqual(Math.max(headerBottom, 0));
});

test("header compresses on scroll on wide screens and scrolls away on phones", async ({ page, isMobile }) => {
  await page.goto("/");
  const header = page.getByRole("banner");
  if (isMobile) {
    expect(await header.evaluate((h) => getComputedStyle(h).position)).toBe("static");
    return;
  }
  await expect(header).not.toHaveAttribute("data-compact");
  await page.evaluate(() => window.scrollTo(0, 600));
  await expect(header).toHaveAttribute("data-compact", "true");
  expect(await header.evaluate((h) => getComputedStyle(h).position)).toBe("sticky");
});

test("the product preview follows the story as you scroll", async ({ page, isMobile }) => {
  test.skip(isMobile, "Phones show each preview inline instead of a sticky panel.");
  await page.goto("/");
  const second = page.locator('[data-step="1"]');
  await second.evaluate((el) => {
    const box = el.getBoundingClientRect();
    window.scrollBy(0, box.top + box.height / 2 - window.innerHeight / 2);
  });
  await expect(second).toHaveAttribute("data-active", "true");
  await expect(page.locator("[class*=stagePanel][data-active]")).toContainText("Check your answers before we continue.");
});

test("category tiles start the assessment with that goal", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Debt consolidation" });
  await expect(link).toHaveAttribute("href", "/assessment?goal=consolidation&from=tile");
  await link.click();
  await expect(page).toHaveURL(/\/assessment\?goal=consolidation&from=tile$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Let’s find the next step that fits you.");
  await expect(page.getByText("Starting with Debt consolidation")).toBeVisible();
});

test("every footer link resolves", async ({ page, request }) => {
  await page.goto("/");
  const hrefs = await page.getByRole("contentinfo").getByRole("link").evaluateAll((links) =>
    links.map((a) => (a as HTMLAnchorElement).getAttribute("href") ?? ""),
  );
  expect(hrefs.length).toBeGreaterThan(5);
  for (const href of new Set(hrefs.map((h) => h.split("#")[0] || "/"))) {
    expect((await request.get(href)).status(), href).toBe(200);
  }
});

test("unknown pages get a helpful 404", async ({ page }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("We can’t find that page");
  await expect(page.getByRole("link", { name: "Go to the homepage" })).toBeVisible();
});

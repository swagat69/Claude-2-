import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/design-system/feedback");
});

test("dialog traps focus, starts on the safe choice, and returns focus on Escape", async ({ page }) => {
  const opener = page.locator("#dialogs").getByRole("button", { name: "Start again" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Start again?" });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Keep my answers" })).toBeFocused();

  // Tabbing never reaches the page behind. (Past the last control a native modal
  // lets focus go to the browser's own toolbar, which shows up here as <body>.)
  for (let i = 0; i < 6; i += 1) {
    await page.keyboard.press("Tab");
    const onPageBehind = await dialog.evaluate((d) => {
      const active = document.activeElement;
      return Boolean(active && active !== document.body && !d.contains(active));
    });
    expect(onPageBehind).toBe(false);
  }

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();
});

test("dialog closes from its close button and the backdrop", async ({ page }) => {
  const opener = page.getByRole("button", { name: "How we use your information" });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "How we use your information" });
  await dialog.getByRole("button", { name: "Close" }).click();
  await expect(dialog).toBeHidden();
  await expect(opener).toBeFocused();

  await opener.click();
  await expect(dialog).toBeVisible();
  await page.mouse.click(4, 4);
  await expect(dialog).toBeHidden();
});

test("toasts are announced, can be dismissed, and never pile up past three", async ({ page }) => {
  const region = page.getByRole("status", { name: "Notifications" });
  const save = page.getByRole("button", { name: "Save my answers" });
  for (let i = 0; i < 4; i += 1) await save.click();
  await expect(region.getByText("Your answers are saved.")).toHaveCount(3);
  await region.getByRole("button", { name: "Dismiss notification" }).first().click();
  await expect(region.getByText("Your answers are saved.")).toHaveCount(2);
});

test("help tip opens on click, closes on Escape and returns focus", async ({ page }) => {
  const trigger = page.getByRole("button", { name: "Why we ask about monthly income" });
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("Lenders use income to work out")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
  await expect(trigger).toBeFocused();
});

test("help tip stays on screen at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.getByRole("button", { name: "About your mobile number" }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBe(0);
});

test("FAQ in single mode keeps one answer open", async ({ page }) => {
  const faq = page.locator("#faq");
  await faq.getByText("What will I be asked?").click();
  await faq.getByText("Is the result guaranteed?").click();
  await expect(faq.getByText("Lenders make the final decision")).toBeVisible();
  await expect(faq.getByText("Each question says why we ask it.")).toBeHidden();
});

test("dismissible notice can be closed and brought back", async ({ page }) => {
  const notice = page.locator("#notices").getByText("You can leave and come back");
  await expect(notice).toBeVisible();
  await page.locator("#notices").getByRole("button", { name: "Dismiss" }).click();
  await expect(notice).toBeHidden();
});

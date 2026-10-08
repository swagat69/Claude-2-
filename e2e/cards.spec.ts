import { expect, test } from "@playwright/test";

test.describe("cards page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/design-system/cards");
  });

  test("booking asks for a time, then confirms the choice without claiming a booking", async ({ page }) => {
    const booking = page.locator("#booking");
    await booking.getByRole("button", { name: "Confirm this time" }).click();
    // The message follows a visually hidden "Error: " prefix, so match on the visible text.
    await expect(booking.getByText("Choose a time for your call")).toBeVisible();

    await booking.getByRole("radio", { name: /Tue, 13 Oct/ }).check();
    await booking.getByRole("radio", { name: /10:30 am/ }).check();
    await expect(booking.getByRole("status").first()).toContainText(
      "You’ve chosen Tue, 13 Oct at 10:30 am, Singapore time (GMT+8). It isn’t booked until you confirm.",
    );
    await booking.getByRole("button", { name: "Confirm this time" }).click();
    await expect(booking.getByText("only then says it’s booked")).toBeVisible();
  });

  test("a full day shows every time as unavailable, in text", async ({ page }) => {
    const booking = page.locator("#booking");
    await booking.getByRole("radio", { name: /Wed, 14 Oct/ }).check();
    const times = booking.getByRole("group", { name: "Time on Wed, 14 Oct" }).getByRole("radio");
    await expect(times).toHaveCount(6);
    for (const time of await times.all()) await expect(time).toBeDisabled();
    await expect(booking.getByText("Unavailable", { exact: true })).toHaveCount(6);
  });

  test("the whole category tile is clickable, with a visible focus ring", async ({ page }) => {
    const tile = page.locator("#tiles article").filter({ hasText: "Debt consolidation" });
    // A click anywhere on the tile lands on the title link's stretched hit area.
    await tile.click({ position: { x: 24, y: 120 } });
    await expect(page).toHaveURL(/#tiles$/);

    await tile.getByRole("link", { name: "Debt consolidation" }).focus();
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    const outline = await tile.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe("solid");
  });

  test("the phone-width header opens its menu as a dialog and returns focus", async ({ page }) => {
    const preview = page.locator("#navigation figure").filter({ hasText: "Phone width" });
    const menu = preview.getByRole("button", { name: "Menu" });
    await menu.click();
    const sheet = page.getByRole("dialog", { name: "Menu" });
    await expect(sheet).toBeVisible();
    await expect(sheet.getByRole("link", { name: "How it works" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(sheet).toBeHidden();
    await expect(menu).toBeFocused();
  });
});

test.describe("booking in another time zone", () => {
  test.use({ timezoneId: "Australia/Sydney" });

  test("offers the device zone and converts times, daylight saving included", async ({ page }) => {
    await page.goto("/design-system/cards");
    const booking = page.locator("#booking");
    await booking.getByRole("radio", { name: /Tue, 13 Oct/ }).check();
    await expect(booking.getByRole("radio", { name: /10:30 am/ })).toBeVisible();

    await booking.getByLabel("Show times in").selectOption("Australia/Sydney");
    await expect(booking.getByText("Australian Eastern Daylight Time (GMT+11)")).toBeVisible();
    // 10:30 am in Singapore is 1:30 pm in Sydney during daylight saving.
    await booking.getByRole("radio", { name: /Tue, 13 Oct/ }).check();
    await expect(booking.getByRole("radio", { name: /1:30 pm/ })).toBeVisible();
  });
});

import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/design-system/forms");
});

test("choice cards: arrow keys select, and an empty submit is explained", async ({ page }) => {
  const step = page.locator("#assembled");
  await step.getByRole("button", { name: "Continue to your situation" }).click();

  const summary = step.getByRole("alert");
  await expect(summary).toBeFocused();
  await expect(summary).toContainText("Select what you’d like help with");

  await summary.getByRole("link", { name: "Select what you’d like help with" }).click();
  const first = step.getByRole("radio", { name: /Personal loan/ });
  await expect(first).toBeFocused();

  await page.keyboard.press("Space");
  await expect(first).toBeChecked();
  await page.keyboard.press("ArrowDown");
  await expect(step.getByRole("radio", { name: /Debt consolidation/ })).toBeChecked();

  await step.getByRole("button", { name: "Continue to your situation" }).click();
  await expect(step.getByRole("alert")).toHaveCount(0);
  await expect(step.getByRole("status")).toContainText("Step 2 would load here");
});

test("text inputs: tidy on blur, explain errors, keep valid answers", async ({ page }) => {
  const demo = page.locator("#inputs form");
  const mobile = demo.getByLabel("Mobile number");
  const amount = demo.getByLabel("How much would you like to borrow?");
  const email = demo.getByLabel("Email address");

  await mobile.fill("+65 91234567");
  await mobile.blur();
  await expect(mobile).toHaveValue("9123 4567");

  await amount.fill("25000");
  await amount.blur();
  await expect(amount).toHaveValue("25,000");

  await email.fill("meiling@");
  await email.blur();
  await expect(email).toHaveAttribute("aria-invalid", "true");
  await expect(demo.getByText("Enter your email in the format name@example.com")).toBeVisible();

  await demo.getByRole("button", { name: "Check my answers" }).click();
  const summary = demo.getByRole("alert");
  await expect(summary).toBeFocused();
  await expect(summary.getByRole("link")).toHaveCount(1);
  await expect(mobile).toHaveValue("9123 4567");
  await expect(amount).toHaveValue("25,000");

  // Fixing the email and pressing the button straight away must work first time:
  // nothing may move under the button as the field loses focus.
  await email.fill("meiling@example.com");
  await demo.getByRole("button", { name: "Check my answers" }).click();
  await expect(demo.getByRole("status")).toContainText("All three answers look right.");
  await expect(demo.getByRole("alert")).toHaveCount(0);
});

test("busy button sends once, however often it is pressed", async ({ page }) => {
  const save = page.locator("#buttons").getByRole("button", { name: "Save my answers" });
  await save.click();
  // force: Playwright would otherwise wait for aria-disabled to clear; people don't.
  await save.click({ force: true });
  await save.click({ force: true });
  await expect(page.locator("#buttons").getByRole("status")).toContainText("Requests sent: 1");
});

test("stepper announces the current stage", async ({ page }) => {
  const demo = page.locator("#progress");
  const nav = demo.getByRole("navigation", { name: "Assessment progress" }).last();
  await expect(nav.locator('[aria-current="step"]')).toContainText("Your situation");
  await demo.getByRole("button", { name: "Continue" }).click();
  await expect(nav.locator('[aria-current="step"]')).toContainText("Preferences");
  await expect(nav).toContainText("Step 3 of 4 · Preferences");
});

test("review summary change links carry their context for screen readers", async ({ page }) => {
  const review = page.locator("#review");
  await expect(review.getByRole("link", { name: "Change your goals" })).toBeVisible();
  await expect(review.getByRole("link", { name: "Change when you need it" })).toBeVisible();
  await expect(review.getByText("Not provided", { exact: true })).toBeVisible();
});

test("marketing consent is optional and starts unticked", async ({ page }) => {
  const consent = page.locator("#consent");
  for (const box of await consent.getByRole("checkbox").all()) {
    await expect(box).not.toBeChecked();
  }
  await expect(consent.locator('input[name="consent_policy_version"]')).toHaveValue("2026-10-draft");
});

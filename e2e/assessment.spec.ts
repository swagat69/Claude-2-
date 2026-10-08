import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * The assessment against brief §24's QA scenarios: real interactions, both
 * desktop and phone. Earlier steps stay in the DOM hidden (Cache Components
 * keeps recent pages), so every query here is role- or label-based, which
 * only matches what is visible.
 */

type Event = Record<string, unknown>;
const events = (page: Page) => page.evaluate(() => (window as unknown as { dataLayer?: Event[] }).dataLayer ?? []);
const stored = (page: Page) => page.evaluate(() => JSON.parse(sessionStorage.getItem("dfx.assessment") ?? "null"));
const h1 = (page: Page) => page.getByRole("heading", { level: 1 });
const continueButton = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name, exact: typeof name === "string" });

async function noViolations(page: Page) {
  // Scan the settled state, not a dialog or notice halfway through fading in (capped, in case one never ends).
  await page.evaluate(() =>
    Promise.race([
      Promise.all(
        document
          .getAnimations()
          .filter((a) => a.effect?.getComputedTiming().iterations !== Infinity)
          .map((a) => a.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 1000)),
    ]),
  );
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
}

async function noSidewaysScroll(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(
    0,
  );
}

async function begin(page: Page, query = "") {
  await page.goto(`/assessment${query}`);
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(page).toHaveURL(/\/assessment\/goal$/);
}

async function chooseGoal(page: Page, goal: string) {
  await page.getByRole("radio", { name: new RegExp(`^${goal}`) }).check();
}

async function fillPersonalSituation(page: Page) {
  await page.getByRole("radio", { name: "Singapore citizen" }).check();
  await page.getByLabel("How old are you?").selectOption("30-39");
  await page.getByRole("radio", { name: "Employed full-time" }).check();
  await page.getByRole("radio", { name: "Within a month" }).check();
}

async function fillPersonalPreferences(page: Page) {
  await page.getByRole("radio", { name: "S$5,000 to S$19,999" }).check();
  await page.getByRole("radio", { name: "1 to 3 years" }).check();
}

/** Personal loan, all the way to the review. */
async function toReview(page: Page) {
  await begin(page);
  await chooseGoal(page, "Personal loan");
  await continueButton(page, "Continue to your situation").click();
  await expect(page).toHaveURL(/situation$/);
  await fillPersonalSituation(page);
  await continueButton(page, "Continue to your preferences").click();
  await expect(page).toHaveURL(/preferences$/);
  await fillPersonalPreferences(page);
  await page.getByRole("checkbox", { name: "Lowest monthly repayment" }).check();
  await continueButton(page, "Review my answers").click();
  await expect(page).toHaveURL(/review$/);
}

test("A0 sets expectations and preselects the goal from a homepage tile", async ({ page }) => {
  await page.goto("/assessment?goal=renovation&from=tile");
  await expect(h1(page)).toHaveText("Let’s find the next step that fits you.");
  await expect(page.getByRole("list", { name: "The four stages" }).getByRole("listitem")).toHaveCount(4);
  await expect(page.getByText("Starting with Home renovation")).toBeVisible();
  await page.getByRole("button", { name: "Begin" }).click();
  await expect(h1(page)).toHaveText("What would you like help with?");
  await expect(h1(page)).toBeFocused();
  await expect(page.getByRole("radio", { name: /^Home renovation/ })).toBeChecked();
  expect(await events(page)).toContainEqual({ event: "assessment_started", source: "tile", goal_preset: "renovation" });
});

test("the hero and final CTA reach the same start, tracked apart", async ({ page }) => {
  for (const [name, source] of [
    ["hero", "hero"],
    ["final", "final"],
  ] as const) {
    await page.goto("/");
    const links = page.getByRole("main").getByRole("link", { name: "Find my next step" });
    await (source === "hero" ? links.first() : links.last()).click();
    await expect(page, name).toHaveURL(new RegExp(`/assessment\\?from=${source}$`));
    await page.getByRole("button", { name: "Begin" }).click();
    await expect(page).toHaveURL(/\/assessment\/goal$/);
    expect(await events(page)).toContainEqual({ event: "assessment_started", source, goal_preset: "none" });
    await page.evaluate(() => sessionStorage.clear());
  }
});

test("happy path: answers, review, contact choice and separate consent", async ({ page }) => {
  await toReview(page);
  await expect(h1(page)).toBeFocused();
  await expect(page.getByRole("region", { name: "Your goals" })).toContainText("Personal loan");
  const situation = page.getByRole("region", { name: "Your situation" });
  await expect(situation).toContainText("Singapore citizen");
  await expect(situation).toContainText("30 to 39");
  // A skipped optional question reads "Not provided", never 0.
  await expect(situation).toContainText("Not provided");
  await expect(page.getByRole("region", { name: "Preferences" })).toContainText("Lowest monthly repayment");

  await page.getByRole("radio", { name: /^Email/ }).check();
  await expect(page.getByRole("button", { name: "Continue with email" })).toBeVisible();
  await page.getByLabel("Email address").fill("ana@example.com");
  await page.getByRole("checkbox", { name: "Send me occasional tips and offers by email" }).check();
  await page.getByRole("button", { name: "Continue with email" }).click();

  await expect(page).toHaveURL(/\/assessment\/continue$/);
  await expect(h1(page)).toHaveText("Get a secure link by email");
  await expect(h1(page)).toBeFocused();
  await expect(page.getByLabel("Email address")).toHaveValue("ana@example.com");

  const draft = await stored(page);
  expect(draft.status).toBe("submitted");
  expect(draft.contact).toEqual({ channel: "email", email: "ana@example.com" });
  expect(draft.consent.map((c: Event) => [c.purpose, c.channel, c.granted])).toEqual([
    ["service", "email", true],
    ["marketing", "email", true],
    ["marketing", "whatsapp", false],
  ]);

  // Analytics carry codes, never answers or contact details (brief §21, §24).
  const recorded = JSON.stringify(await events(page));
  for (const secret of ["ana@example.com", "citizen", "30-39", "5k-20k"]) expect(recorded).not.toContain(secret);
  expect(await events(page)).toContainEqual({
    event: "assessment_submitted",
    path_variant: "personal",
    channel: "email",
    marketing_opt_in: true,
  });
});

test("missing answers: a summary first, then each link focuses its question", async ({ page }) => {
  await begin(page);
  await continueButton(page, /^Continue/).click();
  const summary = page.getByRole("alert", { name: "There is a problem" });
  await expect(summary).toBeFocused();
  await summary.getByRole("link", { name: "Select what you’d like help with" }).click();
  await expect(page.locator("#q-goal")).toBeFocused();

  await chooseGoal(page, "Personal loan");
  await continueButton(page, "Continue to your situation").click();
  await page.getByRole("radio", { name: "Singapore citizen" }).check();
  await continueButton(page, "Continue to your preferences").click();
  await expect(page.getByRole("alert", { name: "There is a problem" }).getByRole("link")).toHaveText([
    "Select your age range",
    "Select your work situation",
    "Select when you need the money",
  ]);
  // What was already answered stays answered.
  await expect(page.getByRole("radio", { name: "Singapore citizen" })).toBeChecked();
  await page
    .getByRole("alert", { name: "There is a problem" })
    .getByRole("link", { name: "Select your age range" })
    .click();
  await expect(page.getByLabel("How old are you?")).toBeFocused();
  expect(await events(page)).toContainEqual({
    event: "assessment_validation_error",
    step_id: "situation",
    field_id: "ageBand",
    error_code: "required",
  });
});

test("a follow-up appears only when the goal needs it, without moving focus", async ({ page }) => {
  await begin(page);
  const followUp = page.getByRole("group", { name: "How many debts would you like to combine?" });
  await expect(followUp).toHaveCount(0);
  const consolidation = page.getByRole("radio", { name: /^Debt consolidation/ });
  await consolidation.check();
  await expect(followUp).toBeVisible();
  await expect(consolidation).toBeFocused();
  await chooseGoal(page, "Personal loan");
  await expect(followUp).toHaveCount(0);
});

test("changing goal from the review names the answers it removes, then asks the new questions", async ({ page }) => {
  await begin(page);
  await chooseGoal(page, "Business loan");
  await page.getByRole("radio", { name: "Yes, it has a UEN" }).check();
  await continueButton(page, "Continue to your situation").click();
  await page.getByRole("radio", { name: "1 to 3 years" }).check();
  await page.getByRole("radio", { name: "Within 2 weeks" }).check();
  await continueButton(page, "Continue to your preferences").click();
  await page.getByRole("radio", { name: "S$50,000 to S$199,999" }).check();
  await page.getByRole("radio", { name: "Up to 1 year" }).check();
  await continueButton(page, "Review my answers").click();
  await expect(page.getByRole("region", { name: "Your goals" })).toContainText("Business loan");

  await page.getByRole("link", { name: "Change your goals" }).click();
  await expect(page).toHaveURL(/goal$/);
  await chooseGoal(page, "Personal loan");
  const notice = page.getByRole("status").filter({ hasText: "Changing to personal loan changes the next questions" });
  await expect(notice).toBeVisible();
  await expect(notice).toContainText("registered in Singapore, trading for and amount");

  await continueButton(page, "Continue to your situation").click();
  await fillPersonalSituation(page);
  await continueButton(page, "Continue to your preferences").click();
  // The repayment period still applies, so it is kept; the business amount band is not.
  await expect(page.getByRole("radio", { name: "Up to 1 year" })).toBeChecked();
  await page.getByRole("radio", { name: "S$5,000 to S$19,999" }).check();
  await continueButton(page, "Review my answers").click();

  await expect(page.getByRole("region", { name: "Your goals" })).toContainText("Personal loan");
  await expect(page.getByRole("region", { name: "Your situation" })).not.toContainText("Trading for");
  expect((await stored(page)).answers).not.toHaveProperty("tradingTime");
  expect(await events(page)).toContainEqual({
    event: "assessment_branch_taken",
    step_id: "goal",
    path_variant: "personal",
  });
});

test("Change returns straight to the review, keeping every other answer", async ({ page }) => {
  await toReview(page);
  await page.getByRole("link", { name: "Change preferences" }).click();
  await expect(page).toHaveURL(/preferences$/);
  await expect(h1(page)).toBeFocused();
  await page.getByRole("radio", { name: "3 to 5 years" }).check();
  await continueButton(page, "Review my answers").click();
  await expect(page).toHaveURL(/review$/);
  await expect(page.getByRole("region", { name: "Preferences" })).toContainText("3 to 5 years");
  await expect(page.getByRole("region", { name: "Your situation" })).toContainText("Singapore citizen");
  expect(await events(page)).toContainEqual({
    event: "assessment_answer_changed",
    step_id: "preferences",
    field_id: "term",
  });

  // A step with nothing missing also goes straight back.
  await page.getByRole("link", { name: "Change your situation" }).click();
  await expect(continueButton(page, "Review my answers")).toBeVisible();
});

test("a hard stop gives the reason straight away and a way to correct it", async ({ page }) => {
  await begin(page);
  await chooseGoal(page, "Personal loan");
  await continueButton(page, "Continue to your situation").click();
  await fillPersonalSituation(page);
  await page.getByRole("radio", { name: "I don’t live in Singapore" }).check();
  await expect(
    page.getByRole("status").filter({ hasText: "We can only help people who live in Singapore at the moment." }),
  ).toBeVisible();
  await continueButton(page, "Continue").click();

  await expect(page).toHaveURL(/not-available$/);
  await expect(h1(page)).toHaveText("We can only help people living in Singapore");
  await expect(h1(page)).toBeFocused();
  await expect(page.getByText("We haven’t sent your answers anywhere.", { exact: false })).toBeVisible();
  expect(await events(page)).toContainEqual({
    event: "assessment_hard_gate",
    step_id: "situation",
    reason_code: "residency",
  });

  // Later steps can't be reached around the stop.
  await page.goto("/assessment/preferences");
  await expect(page).toHaveURL(/situation$/);
  await page.goto("/assessment/not-available");
  await page.getByRole("link", { name: "Change my answer" }).click();
  await expect(page).toHaveURL(/situation$/);
  await expect(page.getByRole("radio", { name: "I don’t live in Singapore" })).toBeChecked();
  await page.getByRole("radio", { name: "Singapore permanent resident" }).check();
  await continueButton(page, "Continue to your preferences").click();
  await expect(page).toHaveURL(/preferences$/);
});

test("answers survive a refresh and the browser's Back and Forward", async ({ page }) => {
  await begin(page);
  await chooseGoal(page, "Personal loan");
  await continueButton(page, "Continue to your situation").click();
  await page.getByRole("radio", { name: "Singapore citizen" }).check();
  await page.getByLabel("How old are you?").selectOption("40-54");
  await page.reload();
  await expect(page.getByRole("radio", { name: "Singapore citizen" })).toBeChecked();
  await expect(page.getByLabel("How old are you?")).toHaveValue("40-54");
  await page.goBack();
  await expect(page).toHaveURL(/goal$/);
  await expect(page.getByRole("radio", { name: /^Personal loan/ })).toBeChecked();
  await page.goForward();
  await expect(page.getByLabel("How old are you?")).toHaveValue("40-54");
});

test("deep links without the earlier answers go to the right step", async ({ page }) => {
  await page.goto("/assessment/review");
  await expect(page).toHaveURL(/\/assessment$/);
  await begin(page);
  await chooseGoal(page, "Personal loan");
  await continueButton(page, "Continue to your situation").click();
  await page.goto("/assessment/review");
  await expect(page).toHaveURL(/situation$/);
});

test("the start screen offers a saved draft back instead of overwriting it", async ({ page }) => {
  await begin(page);
  await chooseGoal(page, "Personal loan");
  await continueButton(page, "Continue to your situation").click();
  await page.goto("/assessment?goal=business");
  await expect(page.getByText("You have answers saved in this tab")).toBeVisible();
  await expect(page.getByText("They’re for a different goal.", { exact: false })).toBeVisible();
  await page.getByRole("button", { name: "Continue where I left off" }).click();
  await expect(page).toHaveURL(/situation$/);
});

test("Start again asks first, then clears everything", async ({ page }) => {
  await begin(page);
  await chooseGoal(page, "Personal loan");
  await page.getByRole("button", { name: "Start again", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Start again?" });
  await expect(dialog.getByRole("button", { name: "Keep my answers" })).toBeFocused();
  await dialog.getByRole("button", { name: "Keep my answers" }).click();
  await expect(page.getByRole("radio", { name: /^Personal loan/ })).toBeChecked();
  await page.getByRole("button", { name: "Start again", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Clear and start again" }).click();
  await expect(page).toHaveURL(/\/assessment$/);
  await expect(page.getByRole("button", { name: "Begin" })).toBeVisible();
  expect(await stored(page)).toBeNull();
});

test("contact details: format checked on blur, and only the chosen channel is required", async ({ page }) => {
  await toReview(page);
  await page.getByRole("button", { name: "See my next step" }).click();
  await expect(page.getByRole("alert", { name: "There is a problem" }).getByRole("link")).toHaveText([
    "Select how you’d like to continue",
  ]);
  await page.getByRole("radio", { name: /^WhatsApp/ }).check();
  await page.getByLabel("Mobile number").fill("912345");
  await page.getByLabel(/First name/).click();
  await expect(page.getByText("Enter an 8-digit Singapore number, like 9123 4567").first()).toBeVisible();
  await page.getByLabel("Mobile number").fill("+65 9123 4567");
  await page.getByRole("button", { name: "Continue with WhatsApp" }).click();
  await expect(h1(page)).toHaveText("Continue in WhatsApp");
  expect((await stored(page)).contact).toEqual({ channel: "whatsapp", mobile: "9123 4567" });
});

test("after sending, Back shows a notice instead of an editable form", async ({ page }) => {
  await toReview(page);
  await page.getByRole("radio", { name: /^WhatsApp/ }).check();
  await page.getByLabel("Mobile number").fill("91234567");
  await page.getByRole("button", { name: "Continue with WhatsApp" }).click();
  await expect(page).toHaveURL(/continue$/);
  await page.goBack();
  await expect(page).toHaveURL(/review$/);
  await expect(h1(page)).toHaveText("You’ve already sent your answers");
  await expect(page.getByRole("button", { name: "Continue with WhatsApp" })).toHaveCount(0);
});

test("the skip link reaches the page on screen after moving between pages", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("main").getByRole("link", { name: "Find my next step" }).first().click();
  await expect(h1(page)).toHaveText("Let’s find the next step that fits you.");
  await page.getByRole("link", { name: "Skip to main content" }).focus();
  await page.keyboard.press("Enter");
  const focused = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    return { tag: el.tagName, visible: el.getClientRects().length > 0, text: el.textContent ?? "" };
  });
  expect(focused.tag).toBe("MAIN");
  expect(focused.visible).toBe(true);
  expect(focused.text).toContain("Let’s find the next step that fits you.");
});

test("every assessment state passes WCAG 2.2 AA and fits 320px", async ({ page }) => {
  const check = async () => {
    await noViolations(page);
    await noSidewaysScroll(page);
  };
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto("/assessment?goal=consolidation&from=tile");
  await check();
  await page.getByRole("button", { name: "Begin" }).click();
  await continueButton(page, "Continue to your situation").click();
  await expect(page.getByRole("alert", { name: "There is a problem" })).toBeVisible();
  await check();
  await page.getByRole("radio", { name: "3 or 4" }).check();
  await continueButton(page, "Continue to your situation").click();
  // An open "Why we ask" is checked too.
  await page.getByText("Why we ask").first().click();
  await page.getByLabel("How old are you?").selectOption("under-21");
  await continueButton(page, "Continue").click();
  await expect(page.getByRole("status").filter({ hasText: "aged 21 or over" })).toBeVisible();
  await check();
  await page.getByRole("radio", { name: "Singapore citizen" }).check();
  await page.getByRole("radio", { name: "Employed full-time" }).check();
  await page.getByRole("radio", { name: "Within a month" }).check();
  await continueButton(page, "Continue").click();
  await expect(page).toHaveURL(/not-available$/);
  await check();
  await page.getByRole("link", { name: "Change my answer" }).click();
  await page.getByLabel("How old are you?").selectOption("21-29");
  await continueButton(page, "Continue to your preferences").click();
  await fillPersonalPreferences(page);
  await check();
  await continueButton(page, "Review my answers").click();
  await page.getByRole("radio", { name: /^WhatsApp/ }).check();
  await page.getByRole("button", { name: "Continue with WhatsApp" }).click();
  await expect(page.getByRole("alert", { name: "There is a problem" })).toBeVisible();
  await check();
  await page.getByLabel("Mobile number").fill("81234567");
  await page.getByRole("button", { name: "Continue with WhatsApp" }).click();
  await expect(page).toHaveURL(/continue$/);
  await expect(h1(page)).toHaveText("Continue in WhatsApp");
  await check();
  // The start screen knows the answers were sent.
  await page.goto("/assessment");
  await expect(page.getByText("You’ve already sent your answers")).toBeVisible();
  await check();
  await page.evaluate(() => sessionStorage.clear());
  await page.goto("/assessment/goal");
  await expect(page).toHaveURL(/\/assessment$/);
  await page.getByRole("button", { name: "Begin" }).click();
  await page.getByRole("button", { name: "Start again", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await check();
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("the start screen explains what to do instead", async ({ page }) => {
    await page.goto("/assessment");
    await expect(h1(page)).toHaveText("Let’s find the next step that fits you.");
    // Playwright's text queries skip <noscript>, so check the element itself.
    const notice = await page.locator("main noscript").evaluate((n) => n.innerHTML);
    expect(notice).toContain("The assessment needs JavaScript");
    expect(notice).toContain('href="/contact"');
    // A button that can't work is hidden, not left dead.
    await expect(page.getByRole("button", { name: "Begin" })).toBeHidden();
  });
});

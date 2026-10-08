import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/*
 * Parts 5 and 6 against brief §24: handoff, resume links, processing,
 * every result state and booking. The hub's prototype shortcuts create an
 * example assessment, so each test starts where it needs to.
 */

type Event = Record<string, unknown>;
const events = (page: Page) => page.evaluate(() => (window as unknown as { dataLayer?: Event[] }).dataLayer ?? []);
const h1 = (page: Page) => page.getByRole("heading", { level: 1 });
const button = (page: Page, name: string) => page.getByRole("button", { name, exact: true });

async function shortcut(page: Page, name: string) {
  await page.goto("/hub");
  await page.getByRole("region", { name: "Jump to a state" }).getByRole("button", { name, exact: true }).click();
}

async function settled(page: Page) {
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
}

async function check(page: Page) {
  await settled(page);
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(
    0,
  );
}

/* Part 5: handoff --------------------------------------------------------------- */

test("WhatsApp handoff shows exactly what is sent and never claims it was", async ({ page }) => {
  await shortcut(page, "WhatsApp handoff");
  await expect(h1(page)).toHaveText("Continue in WhatsApp");
  await expect(h1(page)).toBeFocused();
  const message = page.getByText(/^Hi DFX, I’d like my loan assessment result\. Reference: DFX-[0-9A-F]{6}$/).first();
  await expect(message).toBeVisible();
  await button(page, "Open WhatsApp").click();
  await expect(page.getByRole("status").filter({ hasText: "Waiting for your message in WhatsApp" })).toBeVisible();
  await expect(page.getByText(/message (was )?sent/i)).toHaveCount(0);

  // Launch problems: retry, copy and email are all there.
  await page.getByText("WhatsApp didn’t open?").click();
  await expect(button(page, "Copy message")).toBeVisible();
  await expect(button(page, "Open WhatsApp again")).toBeVisible();
  await button(page, "Get a link by email instead").click();
  await expect(h1(page)).toHaveText("Get a secure link by email");
  expect(await events(page)).toContainEqual({
    event: "fallback_selected",
    from_channel: "whatsapp",
    to_channel: "email",
  });
});

test("the reply link opens the result: real steps, then the result takes focus", async ({ page }) => {
  await shortcut(page, "WhatsApp handoff");
  await button(page, "Open WhatsApp").click();
  await button(page, "Send the message (simulated)").click();
  await page.getByRole("link", { name: "See my result" }).click();
  await expect(page).toHaveURL(/\/results$/);
  await expect(h1(page)).toHaveText("We’re checking the information you shared.");
  await expect(page.getByRole("listitem").filter({ hasText: "Answers received" })).toContainText("(done)");
  await expect(h1(page)).toHaveText("Here are the options worth exploring.", { timeout: 10_000 });
  await expect(h1(page)).toBeFocused();
  const recorded = await events(page);
  expect(recorded.map((e) => e.event)).toEqual(
    expect.arrayContaining([
      "handoff_attempted",
      "handoff_resumed",
      "processing_started",
      "processing_completed",
      "result_displayed",
    ]),
  );
  // No contact details or answers in analytics.
  expect(JSON.stringify(recorded)).not.toMatch(/9123|ana@|citizen|4k-6k/);
});

test("email handoff: typo hint, real delivery states, and a resend wait", async ({ page }) => {
  await shortcut(page, "Email handoff");
  await expect(h1(page)).toHaveText("Get a secure link by email");
  const field = page.getByLabel("Email address");
  await expect(field).toHaveValue("ana@example.com");
  await field.fill("ana@gmial.com");
  await expect(page.getByText("Did you mean ana@gmail.com?")).toBeVisible();
  await button(page, "Use this address").click();
  await expect(field).toHaveValue("ana@gmail.com");
  await button(page, "Send my link").click();
  const status = page.getByRole("status").filter({ hasText: /Sending your link|Link sent|Link delivered/ });
  await expect(status).toContainText(/Sending your link|Link sent/);
  await expect(status).toContainText("Link delivered", { timeout: 10_000 });
  await expect(page.getByText(/You can send another link in \d+ seconds/)).toBeVisible();
  await page.getByRole("link", { name: "See my result" }).click();
  await expect(page).toHaveURL(/\/results$/);
  await expect(h1(page)).toHaveText("Here are the options worth exploring.", { timeout: 10_000 });
});

test("a bounced email says so and offers to change the address", async ({ page }) => {
  await shortcut(page, "Email handoff");
  await page.getByRole("radio", { name: "Bounced back" }).check();
  await button(page, "Send my link").click();
  await expect(page.getByRole("status").filter({ hasText: "We couldn’t deliver your link" })).toBeVisible({
    timeout: 10_000,
  });
  await expect(button(page, "Change the address")).toBeVisible();
});

test("expired, used and broken links explain themselves; new-link requests reveal nothing", async ({
  page,
  context,
}) => {
  await page.goto("/resume?token=example");
  await expect(h1(page)).toHaveText("This link doesn’t work");
  await page.getByLabel("Email address").fill("nobody@example.com");
  await button(page, "Send me a new link").click();
  await expect(
    page.getByRole("status").filter({ hasText: "If there’s an assessment for nobody@example.com" }),
  ).toBeVisible();

  await shortcut(page, "Email handoff");
  await button(page, "Send my link").click();
  const link = page.getByRole("link", { name: "See my result" });
  const href = await link.getAttribute("href");
  await page.getByRole("radio", { name: "It has expired" }).check();
  await link.click();
  await expect(h1(page)).toHaveText("This link has expired");

  // Used: open it properly once, then again in a fresh tab.
  await page.goto("/hub");
  await page.evaluate(() => {
    const settings = JSON.parse(localStorage.getItem("dfx.prototype") ?? "{}");
    localStorage.setItem("dfx.prototype", JSON.stringify({ ...settings, link: "ok" }));
  });
  await page.goto(href!);
  await expect(page).toHaveURL(/\/results$/);
  const other = await context.newPage();
  await other.goto(href!);
  await expect(other.getByRole("heading", { level: 1 })).toHaveText("This link has already been used");
});

test("results need a link", async ({ page }) => {
  await page.goto("/results");
  await expect(h1(page)).toHaveText("Open your result from your link");
  await expect(page.getByRole("link", { name: "Get a new link" })).toBeVisible();
});

/* Part 6: results ------------------------------------------------------------------ */

test("routes found: no ranks or scores, the call comes second, and declining keeps the results", async ({ page }) => {
  await shortcut(page, "Routes found");
  await expect(h1(page)).toHaveText("Here are the options worth exploring.");
  const routes = page.getByRole("region", { name: "Routes that may fit" });
  await expect(routes.getByRole("article")).toHaveCount(2);
  await expect(routes.getByText("Suggested route")).toHaveCount(2);
  await expect(routes).not.toContainText("%");
  await expect(routes).not.toContainText(/top pick|best match|approved!/i);
  await routes.getByText("More about this route").first().click();
  expect(await events(page)).toContainEqual({
    event: "result_card_opened",
    route_id_safe: "personal-instalment",
    position: 1,
  });

  const panel = page.getByRole("complementary", { name: "Talk to our team" });
  await expect(panel.getByRole("link", { name: "Choose a time" })).toBeVisible();
  await panel.getByRole("button", { name: "No thanks, keep my results" }).click();
  await expect(page.getByText("No call needed")).toBeVisible();
  await expect(routes.getByRole("article")).toHaveCount(2);
});

test("a person needs to look: what is known, what is missing, and no urgency", async ({ page }) => {
  await shortcut(page, "A person needs to look");
  await expect(h1(page)).toHaveText("We need one more detail to recommend the best next step.");
  await expect(page.getByText("What we know")).toBeVisible();
  await expect(page.getByText("What’s missing")).toBeVisible();
  await button(page, "Continue later").click();
  await expect(page.getByRole("status").filter({ hasText: "Your result is saved" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Talk it through with our team" })).toBeVisible();
});

test("no match: a reason, a way to correct answers, other help, a separate opt-in, and no sales push", async ({
  page,
}) => {
  await shortcut(page, "No match");
  await expect(h1(page)).toHaveText("We don’t have a suitable option right now.");
  await expect(page.getByRole("link", { name: /choose a time|discuss/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /MoneySense/ })).toBeVisible();
  const optIn = page.getByRole("checkbox", { name: /Tell me on WhatsApp if a suitable option becomes available/ });
  await expect(optIn).not.toBeChecked();
  await optIn.check();
  await button(page, "Save my choice").click();
  await expect(page.getByText("Saved. We’ll only contact you if a suitable option comes up.")).toBeVisible();

  // The booking page isn't offered after no match, even by URL.
  await page.goto("/results/book");
  await expect(page).toHaveURL(/\/results$/);

  await button(page, "Check and change my answers").click();
  await expect(page).toHaveURL(/\/assessment\/review$/);
  await expect(page.getByRole("region", { name: "Your goals" })).toContainText("Personal loan");
});

test("an error is never a no match, and Try again recovers", async ({ page }) => {
  await shortcut(page, "An error, then retry");
  await expect(h1(page)).toHaveText("We couldn’t load your result just now.");
  await expect(page.getByText("Your answers are saved.")).toBeVisible();
  await button(page, "Try again").click();
  await expect(h1(page)).toHaveText("Here are the options worth exploring.", { timeout: 10_000 });
  expect((await events(page)).map((e) => e.event)).toEqual(
    expect.arrayContaining(["result_fetch_failed", "retry_clicked"]),
  );
});

/* Part 6: booking -------------------------------------------------------------------- */

test("booking: missing choices are explained, a taken slot is rechecked, then it's confirmed", async ({ page }) => {
  await shortcut(page, "Booking a call");
  await expect(h1(page)).toHaveText("Choose a time to talk");
  await expect(page.getByText(/Times in Singapore time \(GMT\+8\)/)).toBeVisible();
  await button(page, "Confirm this time").click();
  await expect(page.getByRole("alert", { name: "There is a problem" }).getByRole("link")).toHaveText([
    "Choose how you’d like to talk",
    "Choose a time for your call",
  ]);

  await page.getByRole("radio", { name: "Someone has just taken it" }).check();
  await page.getByRole("radio", { name: /^Phone call/ }).check();
  const first = page.locator("input[name=slot]:not([disabled])").first();
  const start = await first.getAttribute("value");
  await first.check();
  await button(page, "Confirm this time").click();
  await expect(page.getByRole("alert", { name: "There is a problem" })).toContainText("That time has just been taken");
  await expect(page.locator(`input[name=slot][value="${start}"]`)).toBeDisabled();
  // The other choices are kept.
  await expect(page.getByRole("radio", { name: /^Phone call/ })).toBeChecked();

  await page.locator("input[name=slot]:not([disabled])").first().check();
  await button(page, "Confirm this time").click();
  await expect(page).toHaveURL(/\/results\/booked$/);
  await expect(h1(page)).toHaveText("Your call is booked.");
  await expect(h1(page)).toBeFocused();
  await expect(page.getByText("Singapore time (GMT+8)", { exact: true }).filter({ visible: true })).toBeVisible();
  await expect(page.getByText("We’ll call +65 9123 4567.", { exact: true }).filter({ visible: true })).toBeVisible();

  const download = page.waitForEvent("download");
  await button(page, "Add to my calendar").click();
  expect((await download).suggestedFilename()).toBe("dfx-call.ics");

  await button(page, "Cancel the call").click();
  const dialog = page.getByRole("dialog", { name: "Cancel your call?" });
  await expect(dialog.getByRole("button", { name: "Keep my call" })).toBeFocused();
  await dialog.getByRole("button", { name: "Cancel the call" }).click();
  await expect(h1(page)).toHaveText("Your call is cancelled.");
  await page.getByRole("link", { name: "Back to my results" }).click();
  await expect(h1(page)).toHaveText("Here are the options worth exploring.");
});

test("on phones, the call button sticks only after a route has been read, and never over the panel", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "Phones only: from 1024px the call panel sits beside the result.");
  await shortcut(page, "Routes found");
  await expect(h1(page)).toHaveText("Here are the options worth exploring.");
  const bar = page.getByRole("link", { name: "Choose a time to talk" });
  await expect(bar).toHaveCount(0);
  await page.getByRole("region", { name: "Routes that may fit" }).getByRole("article").first().scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await expect(bar).toBeVisible();
  await page.getByRole("complementary", { name: "Talk to our team" }).scrollIntoViewIfNeeded();
  await expect(bar).toHaveCount(0);
});

/* Accessibility of every new state ------------------------------------------------------ */

test("every handoff, result and booking state passes WCAG 2.2 AA and fits 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await shortcut(page, "WhatsApp handoff");
  await check(page);
  await button(page, "Open WhatsApp").click();
  await page.getByText("WhatsApp didn’t open?").click();
  await check(page);
  await shortcut(page, "Email handoff");
  await button(page, "Send my link").click();
  await expect(page.getByRole("status").filter({ hasText: "Link delivered" })).toBeVisible({ timeout: 10_000 });
  await check(page);
  await page.goto("/resume?token=example");
  await expect(h1(page)).toHaveText("This link doesn’t work");
  await check(page);
  await shortcut(page, "Checking your answers");
  await expect(h1(page)).toHaveText("We’re checking the information you shared.");
  await check(page);
  for (const [name, title] of [
    ["Routes found", "Here are the options worth exploring."],
    ["A person needs to look", "We need one more detail to recommend the best next step."],
    ["No match", "We don’t have a suitable option right now."],
    ["An error, then retry", "We couldn’t load your result just now."],
  ]) {
    await shortcut(page, name);
    await expect(h1(page)).toHaveText(title);
    const answers = page.getByText("Answers you sent");
    if (await answers.count()) await answers.click();
    await check(page);
  }
  await shortcut(page, "Booking a call");
  await button(page, "Confirm this time").click();
  await check(page);
  await page.getByRole("radio", { name: /^Video call/ }).check();
  await page.locator("input[name=slot]:not([disabled])").first().check();
  await button(page, "Confirm this time").click();
  await expect(h1(page)).toHaveText("Your call is booked.");
  await check(page);
  await button(page, "Cancel the call").click();
  await check(page);
});

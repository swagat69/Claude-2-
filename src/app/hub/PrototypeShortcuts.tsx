"use client";

import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/button/Button";
import { draftStore } from "@/lib/assessment/draft.ts";
import type { Contact } from "@/lib/assessment/flow.ts";
import type { Answers } from "@/lib/assessment/questions.ts";
import { api, type PrototypeSettings } from "@/lib/service/api.ts";
import { sessionStore } from "@/lib/service/session.ts";
import styles from "./hub.module.css";

/** Example answers for the shortcuts: a personal loan, nothing unusual. */
const answers: Answers = {
  goal: "personal",
  residency: "citizen",
  ageBand: "30-39",
  employment: "employed",
  income: "4k-6k",
  timeline: "1-month",
  amount: "5k-20k",
  term: "1-3y",
  priorities: ["monthly"],
};
const whatsapp: Contact = { channel: "whatsapp", mobile: "9123 4567", firstName: "Ana" };
const email: Contact = { channel: "email", email: "ana@example.com", firstName: "Ana" };

/**
 * PROTOTYPE: jump straight to any state of Parts 5 and 6 with example
 * answers, instead of answering the questions each time.
 */
export function PrototypeShortcuts() {
  const router = useRouter();

  const toResult = (settings: Partial<PrototypeSettings>, path = "/results") => {
    api.setSettings({ speed: "fast", outcome: "auto", link: "ok", booking: "ok", ...settings });
    // Booking needs a result already in place; the others go through the check.
    const id = api.seed(answers, whatsapp, path === "/results" ? undefined : "fit");
    sessionStore.set({ id, channel: "whatsapp", verifiedAt: Date.now() });
    router.push(path);
  };

  const toHandoff = async (contact: Contact) => {
    api.setSettings({ speed: "normal", link: "ok", email: "deliver" });
    const draft = draftStore.start({ answers, source: "direct" });
    const sent = { ...draft, status: "submitted" as const, contact, submittedAt: Date.now() };
    draftStore.update(() => sent);
    await api.submit(sent);
    router.push("/assessment/continue");
  };

  return (
    <section id="prototype" className={styles.shortcuts} aria-labelledby="prototype-title">
      <h2 id="prototype-title" className="type-h2">
        Jump to a state
      </h2>
      <p className={styles.detail}>
        Parts 5 and 6 run on a stand-in for DFX’s systems, WhatsApp and email, so every state can be tried. These
        shortcuts use example answers for a personal loan.
      </p>
      <div className={styles.shortcutGroups}>
        <div>
          <h3 className="type-h3">Part 5 · Handoff</h3>
          <div className={styles.shortcutList}>
            <Button variant="secondary" size="compact" onClick={() => toHandoff(whatsapp)}>
              WhatsApp handoff
            </Button>
            <Button variant="secondary" size="compact" onClick={() => toHandoff(email)}>
              Email handoff
            </Button>
            <Button variant="secondary" size="compact" onClick={() => toResult({ speed: "normal" })}>
              Checking your answers
            </Button>
            <ButtonLink href="/resume?token=example" variant="secondary" size="compact">
              A broken link
            </ButtonLink>
          </div>
        </div>
        <div>
          <h3 className="type-h3">Part 6 · Results and call</h3>
          <div className={styles.shortcutList}>
            <Button variant="secondary" size="compact" onClick={() => toResult({ outcome: "fit" })}>
              Routes found
            </Button>
            <Button variant="secondary" size="compact" onClick={() => toResult({ outcome: "review" })}>
              A person needs to look
            </Button>
            <Button variant="secondary" size="compact" onClick={() => toResult({ outcome: "no-match" })}>
              No match
            </Button>
            <Button variant="secondary" size="compact" onClick={() => toResult({ outcome: "error" })}>
              An error, then retry
            </Button>
            <Button variant="secondary" size="compact" onClick={() => toResult({ outcome: "fit" }, "/results/book")}>
              Booking a call
            </Button>
          </div>
        </div>
      </div>
      <Button variant="tertiary" size="compact" iconStart="refresh" onClick={() => api.reset()}>
        Clear all prototype data
      </Button>
    </section>
  );
}

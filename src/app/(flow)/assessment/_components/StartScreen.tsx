"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Faq } from "@/components/faq/Faq";
import { Notice } from "@/components/feedback/Notice";
import { Icon, type IconName } from "@/components/icon/Icon";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { safeSource, track } from "@/lib/assessment/analytics.ts";
import { draftStore, type Draft } from "@/lib/assessment/draft.ts";
import { firstIncompleteStep } from "@/lib/assessment/flow.ts";
import { goalOptions, stepInfo } from "@/lib/assessment/questions.ts";
import { useDraft } from "@/lib/assessment/useDraft.ts";
import { useHeadingFocus } from "./StepFrame";
import styles from "./assessment.module.css";

const stages = [
  { name: "Your goals", text: "What you’d like help with." },
  { name: "Your situation", text: "A little about you, your work and your timing." },
  { name: "Preferences", text: "Roughly how much, over how long, and what matters to you." },
  { name: "Review", text: "Check every answer, then choose WhatsApp or email." },
];

const goodToKnow: { icon: IconName; title: string; text: string; placeholder?: string }[] = [
  { icon: "lock", title: "No account needed", text: "Your answers stay in this browser tab until you send them." },
  {
    icon: "shield",
    title: "No credit check here",
    text: "Answering these questions doesn’t involve a credit check. A lender may run one if you apply with them.",
    placeholder: "Credit-check wording confirmed by legal",
  },
  {
    icon: "route",
    title: "Suggestions, not approvals",
    text: "We show routes that may fit. Lenders make the final decision.",
  },
];

/** Reads ?goal= (from a homepage tile) and ?from= (which button was used), inside a Suspense boundary. */
export function StartScreenFromUrl() {
  const params = useSearchParams();
  return <StartScreen goal={params.get("goal")} from={params.get("from")} />;
}

/**
 * A0 (brief §7): makes the commitment feel finite before asking for
 * anything. Shows the four named stages, what is and isn't promised, and
 * picks up a saved draft instead of silently overwriting it.
 */
export function StartScreen({ goal, from }: { goal: string | null; from: string | null }) {
  const draft = useDraft();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const preset = goalOptions.find((o) => o.value === goal);

  useHeadingFocus(container, draft !== undefined);

  const begin = () => {
    const source = safeSource(from);
    draftStore.start({ answers: preset ? { goal: preset.value } : {}, source });
    track("assessment_started", { source, goal_preset: preset?.value ?? "none" });
    router.push(stepInfo.goal.href);
  };

  const resume = (saved: Draft) => {
    const step = firstIncompleteStep(saved.answers);
    track("session_recovered", { recovery_channel: "same_tab", step_id: step });
    router.push(stepInfo[step].href);
  };

  return (
    <div ref={container} className="container">
      <div className={styles.start}>
        <p className={`type-eyebrow ${styles.eyebrow}`}>Loan assessment</p>
        <h1 className={`type-h1 ${styles.startTitle}`} tabIndex={-1}>
          Let’s find the next step that fits you.
        </h1>
        <p className={`type-body-l ${styles.startLead}`}>
          This takes a few minutes. You can review your answers before sending.
        </p>

        <ol className={styles.stages} aria-label="The four stages">
          {stages.map((stage, i) => (
            <li key={stage.name} className={styles.stage}>
              <span className={styles.stageNum} aria-hidden="true">
                {i + 1}
              </span>
              <span>
                <strong>{stage.name}</strong>
                <span className={styles.stageText}>{stage.text}</span>
              </span>
            </li>
          ))}
        </ol>

        {draft && draft.status === "submitted" ? (
          <Notice
            tone="info"
            title="You’ve already sent your answers"
            actions={
              <>
                <ButtonLink href="/assessment/continue" iconEnd="arrow-right">
                  Go to your next step
                </ButtonLink>
                <Button variant="secondary" onClick={begin}>
                  Start a new assessment
                </Button>
              </>
            }
          >
            Your answers are saved in this tab. You can carry on, or start a new assessment.
          </Notice>
        ) : draft ? (
          <Notice
            tone="info"
            title="You have answers saved in this tab"
            actions={
              <>
                <Button onClick={() => resume(draft)} iconEnd="arrow-right">
                  Continue where I left off
                </Button>
                <Button variant="secondary" onClick={begin}>
                  Clear them and start again
                </Button>
              </>
            }
          >
            {preset && draft.answers.goal !== preset.value
              ? `They’re for a different goal. To start with “${preset.label}” instead, clear them and start again.`
              : "Pick up where you left off, or clear them and start again."}
          </Notice>
        ) : (
          <div className={styles.begin}>
            {preset ? (
              <p className={styles.preset}>
                {preset.icon ? <Icon name={preset.icon} size={20} /> : null}
                <span>
                  Starting with <strong>{preset.label}</strong>. You can change this in the first question.
                </span>
              </p>
            ) : null}
            <Button onClick={begin} iconEnd="arrow-right" className={styles.beginButton} data-requires-js>
              Begin
            </Button>
          </div>
        )}

        <ul className={styles.goodToKnow}>
          {goodToKnow.map((item) => (
            <li key={item.title}>
              <span className={styles.goodIcon} aria-hidden="true">
                <Icon name={item.icon} size={20} />
              </span>
              <span>
                <strong>{item.title}</strong>
                <span className={styles.stageText}>
                  {item.text} {item.placeholder ? <Placeholder note={item.placeholder} /> : null}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <Faq
          items={[
            {
              question: "Who sees my answers?",
              answer: (
                <>
                  <p>No one, until you send them on the last step. Then only the DFX team, to prepare your result.</p>
                  <p>
                    <Placeholder note="Whether and when details are shared with lenders">
                      We’ll ask you before sharing anything with a lender.
                    </Placeholder>
                  </p>
                </>
              ),
            },
            {
              question: "Can I continue later?",
              answer: (
                <p>
                  Your answers are kept in this browser tab, so you can go back or refresh without losing them. They’re
                  cleared when you close the tab, or after an hour without changes.{" "}
                  <Placeholder note="Save-and-resume policy and expiry, confirmed by product and legal" />
                </p>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}

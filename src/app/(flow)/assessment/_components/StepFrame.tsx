"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Notice } from "@/components/feedback/Notice";
import { ErrorSummary, type SummaryError } from "@/components/form/ErrorSummary";
import { Icon } from "@/components/icon/Icon";
import { BackLink } from "@/components/nav/SiteHeader";
import { Dialog } from "@/components/overlay/Dialog";
import { Stepper } from "@/components/progress/Stepper";
import { track } from "@/lib/assessment/analytics.ts";
import { draftStore, type Draft } from "@/lib/assessment/draft.ts";
import { canVisit, firstIncompleteStep, pathVariant, previousStep } from "@/lib/assessment/flow.ts";
import { STEPS, stageNames, stepInfo, type StepId } from "@/lib/assessment/questions.ts";
import { useDraft } from "@/lib/assessment/useDraft.ts";
import { useHeadingFocus } from "@/lib/useHeadingFocus";
import styles from "./assessment.module.css";

/* -------------------------------------------------------------------------- */
/* Guard                                                                      */
/* -------------------------------------------------------------------------- */

type Guard = { state: "pending" } | { state: "submitted"; draft: Draft } | { state: "ready"; draft: Draft };

/**
 * Sends a deep link or refresh to the right place: no draft goes to the
 * start, a step whose earlier answers are missing goes to the first one
 * that is. A sent assessment shows a notice instead of the form, without
 * trapping the Back button.
 */
export function useStepGuard(step: StepId): Guard {
  const draft = useDraft();
  const router = useRouter();
  const redirect =
    draft === undefined || draft?.status === "submitted"
      ? null
      : draft === null
        ? "/assessment"
        : canVisit(step, draft.answers)
          ? null
          : stepInfo[firstIncompleteStep(draft.answers)].href;

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  if (!draft || redirect) return { state: "pending" };
  if (draft.status === "submitted") return { state: "submitted", draft };
  return { state: "ready", draft };
}

/* -------------------------------------------------------------------------- */
/* Frame                                                                      */
/* -------------------------------------------------------------------------- */

interface StepFrameProps {
  step: StepId;
  guard: Guard;
  /** Desktop side panel (brief A2, A4). Below 1024px it follows the form, unless `mobileNote` replaces it. */
  rail?: ReactNode;
  railLabel?: string;
  /** Short trust note shown below the fields on phones and tablets, in place of the rail (brief A2). */
  mobileNote?: ReactNode;
  /** Review uses a wider column for the summary (brief A4: 760px + 300px rail). */
  wide?: boolean;
  errors: SummaryError[];
  attempt: number;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel: string;
  busy?: boolean;
  children: ReactNode;
}

/**
 * Shared step layout (brief §7): Back, named-stage progress, the error
 * summary above the heading, the questions, one Continue button that names
 * its destination, and a way to start again.
 */
export function StepFrame({
  step,
  guard,
  rail,
  railLabel = "What to expect",
  mobileNote,
  wide,
  errors,
  attempt,
  onSubmit,
  submitLabel,
  busy,
  children,
}: StepFrameProps) {
  const container = useRef<HTMLDivElement>(null);
  const ready = guard.state !== "pending";
  const answers = guard.state === "pending" ? null : guard.draft.answers;
  const back = previousStep(step);

  useHeadingFocus(container, ready);

  useEffect(() => {
    if (answers && guard.state === "ready")
      track("assessment_step_viewed", { step_id: step, path_variant: pathVariant(answers) });
    // Once per showing of the step, not on every answer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, step]);

  return (
    <div
      ref={container}
      className={`container ${styles.step}`}
      data-wide={wide || undefined}
      data-rail={rail ? true : undefined}
    >
      <div className={styles.top}>
        <BackLink href={back ? stepInfo[back].href : "/assessment"} />
        <Stepper stages={stageNames} current={STEPS.indexOf(step)} />
      </div>

      {guard.state === "pending" ? (
        <div className={styles.pending} aria-busy="true" />
      ) : guard.state === "submitted" ? (
        <SubmittedNotice />
      ) : (
        <div className={styles.columns}>
          <div className={styles.mainColumn}>
            <form noValidate onSubmit={onSubmit} className={styles.form}>
              <ErrorSummary errors={errors} attempt={attempt} />
              {children}
              {mobileNote ? <div className={styles.mobileNote}>{mobileNote}</div> : null}
              <div className={styles.actions}>
                <Button type="submit" iconEnd="arrow-right" busy={busy} className={styles.submit}>
                  {submitLabel}
                </Button>
              </div>
            </form>
            <StepFooter step={step} />
          </div>
          {rail ? (
            <aside className={styles.rail} data-desktop-only={mobileNote ? true : undefined} aria-label={railLabel}>
              {rail}
            </aside>
          ) : null}
        </div>
      )}
    </div>
  );
}

function SubmittedNotice() {
  return (
    <div className={styles.submitted}>
      <h1 className="type-h1" tabIndex={-1}>
        You’ve already sent your answers
      </h1>
      <Notice
        tone="info"
        actions={
          <>
            <ButtonLink href="/assessment/continue" iconEnd="arrow-right">
              Go to your next step
            </ButtonLink>
            <ButtonLink href="/assessment" variant="secondary">
              Start a new assessment
            </ButtonLink>
          </>
        }
      >
        To change an answer now, start a new assessment. The one you sent stays as it is.
      </Notice>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Start again                                                                */
/* -------------------------------------------------------------------------- */

/** "Answers are kept in this tab" plus a confirmed way to clear them (brief §7: a revocation route). */
export function StepFooter({ step }: { step: StepId | "not-available" }) {
  const [confirming, setConfirming] = useState(false);
  const keep = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  const restart = () => {
    track("assessment_restarted", { step_id: step });
    setConfirming(false);
    draftStore.clear();
    router.push("/assessment");
  };

  return (
    <div className={styles.footer}>
      <p className={styles.saved}>
        <Icon name="lock" size={20} />
        Your answers are kept in this browser tab until you send them or close it.
      </p>
      <Button variant="tertiary" size="compact" iconStart="refresh" onClick={() => setConfirming(true)}>
        Start again
      </Button>
      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Start again?"
        description="This clears every answer you’ve given so far. You can’t undo it."
        size="small"
        initialFocus={keep}
        footer={
          <>
            <Button ref={keep} variant="secondary" onClick={() => setConfirming(false)}>
              Keep my answers
            </Button>
            <Button variant="destructive" onClick={restart}>
              Clear and start again
            </Button>
          </>
        }
      />
    </div>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState, type FormEvent } from "react";
import { Notice } from "@/components/feedback/Notice";
import { QuestionHeading } from "@/components/question/QuestionHeading";
import { track } from "@/lib/assessment/analytics.ts";
import { draftStore } from "@/lib/assessment/draft.ts";
import {
  answerCount,
  answersToRemove,
  changedAnswers,
  continueLabel,
  hardGate,
  nextStep,
  pathVariant,
  pruneAnswers,
  stepErrors,
  visibleQuestions,
  type FieldError,
} from "@/lib/assessment/flow.ts";
import {
  goalOptions,
  panelTitles,
  questionById,
  stepInfo,
  type Answers,
  type PanelId,
  type Question,
  type QuestionId,
  type QuestionStepId,
} from "@/lib/assessment/questions.ts";
import { QuestionField, type AnswerChange } from "./QuestionField";
import { StepFrame, useStepGuard } from "./StepFrame";
import { SituationRail, TrustNote } from "./content";
import styles from "./assessment.module.css";

const listFormat = new Intl.ListFormat("en-SG", { type: "conjunction" });
/** "Registered in Singapore" -> "registered in Singapore": mid-sentence, proper nouns intact. */
const inSentence = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);

const setAnswer: AnswerChange = (id, value) =>
  draftStore.update((draft) => {
    const answers: Answers = { ...draft.answers };
    if (value === undefined) delete answers[id];
    else answers[id] = value;
    return { ...draft, answers };
  });

/**
 * A1–A3. Answers save as they change, so Back and refresh keep them (brief
 * §7); missing answers are reported only on Continue; answers that a new
 * goal no longer needs are named before they are removed (brief §24).
 */
export function QuestionStep({ step }: { step: QuestionStepId }) {
  const guard = useStepGuard(step);
  const router = useRouter();
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const shownAt = useRef(0);
  const entryAnswers = useRef<Answers>({});
  const shownQuestions = useRef<Set<QuestionId> | null>(null);

  const draft = guard.state === "ready" ? guard.draft : null;
  const answers = draft?.answers ?? {};
  const hasDraft = draft !== null;

  // Each time the step is shown (including a preserved page shown again by Back).
  useEffect(() => {
    if (!hasDraft) return;
    const current = draftStore.getSnapshot()?.answers ?? {};
    shownAt.current = performance.now();
    entryAnswers.current = current;
    shownQuestions.current = new Set(visibleQuestions(step, current).map((q) => q.id));
  }, [hasDraft, step]);

  // A page hidden mid-navigation must not come back with a spinning button.
  useLayoutEffect(() => () => setBusy(false), []);

  const visible = visibleQuestions(step, answers);
  const visibleIds = new Set(visible.map((q) => q.id));
  const shownErrors = errors.filter((e) => visibleIds.has(e.field as QuestionId));
  const errorFor = (id: QuestionId) => shownErrors.find((e) => e.field === id)?.message;
  const isNew = (id: QuestionId) => shownQuestions.current !== null && !shownQuestions.current.has(id);
  const goalAtEntry = () => entryAnswers.current.goal;
  const reviewSeen = draft?.status === "review";

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = draftStore.getSnapshot();
    if (!current || busy) return;
    const found = stepErrors(step, current.answers);
    setAttempt((n) => n + 1);
    setErrors(found);
    if (found.length) {
      for (const error of found) {
        track("assessment_validation_error", { step_id: step, field_id: error.field, error_code: error.code });
      }
      return;
    }

    const pruned = pruneAnswers(current.answers);
    const variant = pathVariant(pruned);
    track("assessment_step_completed", {
      step_id: step,
      path_variant: variant,
      time_on_stage_ms: performance.now() - shownAt.current,
      answer_count: answerCount(step, pruned),
    });
    if (step === "goal" && pathVariant(entryAnswers.current) !== variant) {
      track("assessment_branch_taken", { step_id: step, path_variant: variant });
    }
    if (current.status === "review") {
      for (const id of changedAnswers(entryAnswers.current, current.answers)) {
        if (questionById[id].step === step) track("assessment_answer_changed", { step_id: step, field_id: id });
      }
    }
    setBusy(true);

    const gate = hardGate(current.answers, step);
    if (gate) {
      // Answers are kept as they are, so the person can come back and change one.
      track("assessment_hard_gate", { step_id: step, reason_code: gate.reason });
      router.push("/assessment/not-available");
      return;
    }
    draftStore.update((d) => ({ ...d, answers: pruned }));
    router.push(stepInfo[nextStep(step, pruned, current.status === "review")].href);
  };

  const destination = draft ? nextStep(step, pruneAnswers(answers), reviewSeen) : "review";
  // A stopping answer leads to the stop page, which the notice beside the answer already describes.
  const stops = draft ? hardGate(answers, step) !== null : false;

  return (
    <StepFrame
      step={step}
      guard={guard}
      errors={shownErrors.map(({ fieldId, message }) => ({ fieldId, message }))}
      attempt={attempt}
      onSubmit={submit}
      submitLabel={stops ? "Continue" : continueLabel(destination)}
      busy={busy}
      rail={step === "situation" ? <SituationRail /> : undefined}
      mobileNote={step === "situation" ? <TrustNote /> : undefined}
    >
      {step === "goal" ? (
        <GoalQuestions
          visible={visible}
          answers={answers}
          errorFor={errorFor}
          isNew={isNew}
          goalAtEntry={goalAtEntry}
        />
      ) : step === "situation" ? (
        <SituationQuestions visible={visible} answers={answers} errorFor={errorFor} isNew={isNew} />
      ) : (
        <PreferenceQuestions visible={visible} answers={answers} errorFor={errorFor} isNew={isNew} />
      )}
    </StepFrame>
  );
}

interface GroupProps {
  visible: Question[];
  answers: Answers;
  errorFor: (id: QuestionId) => string | undefined;
  isNew: (id: QuestionId) => boolean;
}

/* A1 ------------------------------------------------------------------------ */

/**
 * Answers a goal change would remove: those that would go with the new goal
 * but not with the goal the person arrived with (brief §24 "Select and
 * change goal": the person understands any change before it happens).
 */
function removedByGoalChange(answers: Answers, previousGoal: Answers["goal"]) {
  if (!previousGoal || previousGoal === answers.goal) return [];
  const anyway = new Set(answersToRemove({ ...answers, goal: previousGoal }).map((r) => r.id));
  return answersToRemove(answers).filter((r) => !anyway.has(r.id));
}

function GoalQuestions({
  visible,
  answers,
  errorFor,
  isNew,
  goalAtEntry,
}: GroupProps & { goalAtEntry: () => Answers["goal"] }) {
  const [goal, ...followUps] = visible;
  const removed = removedByGoalChange(answers, goalAtEntry());
  const goalLabel = goalOptions.find((o) => o.value === answers.goal)?.label;
  return (
    <div className={styles.questions}>
      <QuestionField
        question={goal}
        answers={answers}
        error={errorFor(goal.id)}
        onChange={setAnswer}
        level="page-heading"
      />
      <div role="status" className={styles.gateLive}>
        {removed.length && goalLabel ? (
          <Notice tone="info" title={`Changing to ${inSentence(goalLabel)} changes the next questions`}>
            When you continue, we’ll remove{" "}
            {removed.length === 1 ? "an answer that no longer applies" : "answers that no longer apply"}:{" "}
            {listFormat.format(removed.map((r) => inSentence(r.label)))}. Choose your earlier option to keep{" "}
            {removed.length === 1 ? "it" : "them"}.
          </Notice>
        ) : null}
      </div>
      {followUps.map((q) => (
        <div key={q.id} className={styles.block}>
          <QuestionField
            question={q}
            answers={answers}
            error={errorFor(q.id)}
            onChange={setAnswer}
            reveal={isNew(q.id)}
          />
        </div>
      ))}
    </div>
  );
}

/* A2 ------------------------------------------------------------------------ */

function SituationQuestions({ visible, answers, errorFor, isNew }: GroupProps) {
  const panels = (Object.keys(panelTitles) as PanelId[])
    .map((panel) => ({ panel, items: visible.filter((q) => q.panel === panel) }))
    .filter((group) => group.items.length);
  return (
    <div className={styles.questions}>
      <QuestionHeading
        title="Tell us a little about your situation."
        lead="We use this to suggest a more relevant next step. Ranges are fine; we never ask for exact figures."
      />
      {panels.map(({ panel, items }) => (
        <section
          key={panel}
          className={styles.panel}
          aria-labelledby={`panel-${panel}`}
          data-reveal={items.every((q) => isNew(q.id)) || undefined}
        >
          <h2 id={`panel-${panel}`} className={`type-h3 ${styles.panelTitle}`}>
            {panelTitles[panel]}
          </h2>
          {items.map((q) => (
            <QuestionField
              key={q.id}
              question={q}
              answers={answers}
              error={errorFor(q.id)}
              onChange={setAnswer}
              level="label"
              reveal={isNew(q.id)}
            />
          ))}
        </section>
      ))}
    </div>
  );
}

/* A3 ------------------------------------------------------------------------ */

function PreferenceQuestions({ visible, answers, errorFor, isNew }: GroupProps) {
  return (
    <div className={styles.questions}>
      <QuestionHeading
        title="What matters most to you?"
        lead="We’ll keep these preferences in mind. “Not sure” is always a fine answer."
      />
      {visible.map((q) => (
        <div key={q.id} className={styles.block}>
          <QuestionField
            question={q}
            answers={answers}
            error={errorFor(q.id)}
            onChange={setAnswer}
            reveal={isNew(q.id)}
          />
        </div>
      ))}
    </div>
  );
}

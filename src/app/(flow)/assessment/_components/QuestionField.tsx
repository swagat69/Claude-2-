"use client";

import { Notice } from "@/components/feedback/Notice";
import { ChoiceCards, Chips } from "@/components/form/Choices";
import { Select } from "@/components/form/TextField";
import { WhyWeAsk } from "@/components/question/QuestionHeading";
import { gateFor, optionsFor } from "@/lib/assessment/flow.ts";
import { fieldId, resolve, type Answers, type Question, type QuestionId } from "@/lib/assessment/questions.ts";
import { gateCopy } from "./content";
import styles from "./assessment.module.css";

export type AnswerChange = (id: QuestionId, value: string | string[] | undefined) => void;

interface QuestionFieldProps {
  question: Question;
  answers: Answers;
  error?: string;
  onChange: AnswerChange;
  /**
   * "page-heading" puts the question in the page's h1 (brief A1); "question"
   * is a standalone question; "label" sits under a panel heading.
   */
  level?: "page-heading" | "question" | "label";
  /** Fades in a follow-up that has just appeared, without moving focus (brief A2: 160ms reveal). */
  reveal?: boolean;
}

/** Renders one question from the question list with the right control, help and hard-stop notice. */
export function QuestionField({ question, answers, error, onChange, level = "question", reveal }: QuestionFieldProps) {
  const id = fieldId(question.id);
  const options = optionsFor(question, answers);
  const value = answers[question.id];
  const shared = {
    hint: question.hint ? resolve(question.hint, answers) : undefined,
    help: question.why ? <WhyWeAsk>{question.why}</WhyWeAsk> : undefined,
    error,
    optional: question.optional,
  };
  const label = resolve(question.label, answers);
  const canStop = options.some((o) => o.gate);
  const gate = gateFor(question, answers);

  return (
    <div className={styles.question} data-reveal={reveal || undefined}>
      {question.control === "cards" ? (
        <ChoiceCards
          {...shared}
          id={id}
          name={question.id}
          legend={label}
          legendStyle={level}
          options={options}
          columns={question.columns}
          value={typeof value === "string" ? value : ""}
          onValueChange={(next) => onChange(question.id, next)}
        />
      ) : question.control === "select" ? (
        <Select
          {...shared}
          id={id}
          name={question.id}
          label={label}
          labelStyle={level === "label" ? "label" : "question"}
          options={options}
          width="medium"
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(question.id, event.target.value || undefined)}
        />
      ) : (
        <Chips
          {...shared}
          id={id}
          name={question.id}
          legend={label}
          legendStyle={level === "label" ? "label" : "question"}
          options={options}
          values={Array.isArray(value) ? value : []}
          onValuesChange={(next) => onChange(question.id, next.length ? next : undefined)}
        />
      )}
      {canStop ? (
        // Present before it has content, so the reason is announced as soon as it appears (brief A3).
        <div role="status" className={styles.gateLive}>
          {gate ? (
            <Notice tone="info" title={gateCopy[gate].inline}>
              If that’s right, you can still continue to see other places to get help. If not, change your answer.
            </Notice>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

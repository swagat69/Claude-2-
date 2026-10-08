"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/button/Button";
import { ChoiceCards, type ChoiceOption } from "@/components/form/Choices";
import { ErrorSummary, type SummaryError } from "@/components/form/ErrorSummary";
import { CurrencyField, EmailField, PhoneField } from "@/components/form/SpecialFields";
import { Stepper } from "@/components/progress/Stepper";
import { validateAmount, validateEmail, validateSgPhone } from "@/lib/format";
import specimen from "../_doc/specimen.module.css";
import forms from "./forms.module.css";

const styles = { ...specimen, ...forms };

export function BusyButtonDemo() {
  const [state, setState] = useState<"idle" | "busy" | "done">("idle");
  const [presses, setPresses] = useState(0);
  const save = () => {
    setPresses((n) => n + 1);
    setState("busy");
    // Stands in for the server confirming the save.
    window.setTimeout(() => setState("done"), 1200);
  };
  return (
    <div className={styles.demoRow}>
      <Button busy={state === "busy"} onClick={save} iconEnd="arrow-right">
        Save my answers
      </Button>
      <p role="status" className={styles.demoStatus}>
        {state === "done" ? `Saved. Requests sent: ${presses}, however many times you tapped.` : ""}
      </p>
    </div>
  );
}

const stages = ["Your goals", "Your situation", "Preferences", "Review"];

export function StepperDemo() {
  const [current, setCurrent] = useState(1);
  return (
    <div className={styles.stack}>
      <Stepper stages={stages} current={current} />
      <div className={styles.demoRow}>
        <Button variant="secondary" size="compact" iconStart="arrow-left" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>
          Back
        </Button>
        <Button size="compact" iconEnd="arrow-right" disabled={current === stages.length - 1} onClick={() => setCurrent((c) => c + 1)}>
          Continue
        </Button>
      </div>
    </div>
  );
}

type ContactErrors = Partial<Record<"email" | "mobile" | "amount", string>>;

const contactRules = {
  email: (v: string) => validateEmail(v),
  mobile: (v: string) => validateSgPhone(v),
  amount: (v: string) => validateAmount(v),
} as const;

const contactIds = { email: "demo-email", mobile: "demo-mobile", amount: "demo-amount" } as const;

/**
 * Validation timing from brief §7: format problems on blur (only once
 * something is typed), missing answers on submit. Blur only ever adds or
 * updates an error; errors clear and the summary changes only on submit, so
 * nothing moves under a button while it is being pressed (brief §14).
 */
export function TextInputsDemo() {
  const [errors, setErrors] = useState<ContactErrors>({});
  const [summaryErrors, setSummaryErrors] = useState<ContactErrors>({});
  const [attempt, setAttempt] = useState(0);
  const [ok, setOk] = useState(false);

  const onBlurField = (field: keyof ContactErrors, value: string) => {
    if (!value.trim()) return;
    const message = contactRules[field](value);
    if (message) setErrors((e) => ({ ...e, [field]: message }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const next: ContactErrors = {};
    for (const field of Object.keys(contactRules) as (keyof ContactErrors)[]) {
      const message = contactRules[field](String(data.get(field) ?? ""));
      if (message) next[field] = message;
    }
    setErrors(next);
    setSummaryErrors(next);
    setAttempt((n) => n + 1);
    setOk(Object.keys(next).length === 0);
  };

  const summary: SummaryError[] = (Object.keys(contactIds) as (keyof ContactErrors)[])
    .filter((field) => summaryErrors[field])
    .map((field) => ({ fieldId: contactIds[field], message: summaryErrors[field]! }));

  return (
    <form className={styles.stack} onSubmit={onSubmit} noValidate>
      {attempt > 0 ? <ErrorSummary errors={summary} attempt={attempt} /> : null}
      <EmailField
        id={contactIds.email}
        name="email"
        label="Email address"
        hint="We’ll send a secure link to your result."
        error={errors.email}
        onBlur={(e) => onBlurField("email", e.currentTarget.value)}
      />
      <PhoneField
        id={contactIds.mobile}
        name="mobile"
        label="Mobile number"
        hint="A Singapore mobile, so we can message you on WhatsApp if you choose to."
        error={errors.mobile}
        onBlur={(e) => onBlurField("mobile", e.currentTarget.value)}
      />
      <CurrencyField
        id={contactIds.amount}
        name="amount"
        label="How much would you like to borrow?"
        hint="An estimate is fine."
        error={errors.amount}
        onBlur={(e) => onBlurField("amount", e.currentTarget.value)}
      />
      <div className={styles.demoRow}>
        <Button type="submit" iconEnd="arrow-right">
          Check my answers
        </Button>
      </div>
      <p role="status" className={styles.demoStatus}>
        {ok ? "All three answers look right." : ""}
      </p>
    </form>
  );
}

const goalOptions: ChoiceOption[] = [
  { value: "personal", label: "Personal loan", description: "For everyday costs, travel or a big purchase", icon: "wallet" },
  { value: "consolidation", label: "Debt consolidation", description: "Bring several debts into one repayment", icon: "layers" },
  { value: "renovation", label: "Home renovation", description: "Works on a home you own or rent", icon: "home" },
  { value: "business", label: "Business loan", description: "Working capital or equipment for your business", icon: "briefcase" },
  { value: "other", label: "Something else", icon: "more" },
  { value: "not-sure", label: "I’m not sure yet", notSure: true },
];

/** Brief A1, assembled from the parts above. */
export function AssessmentStepDemo() {
  const [goal, setGoal] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [done, setDone] = useState(false);
  const error = attempt > 0 && !goal ? "Select what you’d like help with" : null;

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAttempt((n) => n + 1);
    setDone(Boolean(goal));
  };

  return (
    <form className={styles.assessment} onSubmit={onSubmit} noValidate>
      <div>
        <Button variant="tertiary" size="compact" iconStart="arrow-left" className={styles.back}>
          Back
        </Button>
      </div>
      <Stepper stages={stages} current={0} />
      {error ? <ErrorSummary errors={[{ fieldId: "goal", message: error }]} attempt={attempt} /> : null}
      <ChoiceCards
        id="goal"
        name="goal"
        legend="What would you like help with?"
        legendStyle="page-heading"
        hint="Select the option closest to your goal. You can change it later."
        options={goalOptions}
        value={goal}
        onValueChange={(value) => {
          setGoal(value);
          setDone(false);
        }}
        error={error}
        columns={2}
      />
      <div>
        <Button type="submit" iconEnd="arrow-right" className={styles.continue}>
          Continue to your situation
        </Button>
      </div>
      <p role="status" className={styles.demoStatus}>
        {done ? "Step 2 would load here, with focus on its heading." : ""}
      </p>
    </form>
  );
}

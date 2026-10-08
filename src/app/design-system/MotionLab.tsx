"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import styles from "./MotionLab.module.css";

function Demo({ title, spec, children }: { title: string; spec: string; children: ReactNode }) {
  return (
    <div className={styles.demo}>
      <div className={styles.demoHead}>
        <h4 className="type-h3">{title}</h4>
        <p className="type-meta">{spec}</p>
      </div>
      <div className={styles.demoStage}>{children}</div>
    </div>
  );
}

function ChoiceDemo() {
  const options = ["Personal loan", "Debt consolidation", "Business loan"];
  const [value, setValue] = useState(options[0]);
  const name = useId();
  return (
    <fieldset className={styles.choices}>
      <legend className="visually-hidden">What would you like help with?</legend>
      {options.map((option) => (
        <label key={option} className={styles.choice}>
          <input type="radio" name={name} value={option} checked={value === option} onChange={() => setValue(option)} />
          <span className={styles.choiceLabel}>{option}</span>
          <span className={styles.choiceMark} aria-hidden="true">
            <Icon name="check" size={20} />
          </span>
        </label>
      ))}
    </fieldset>
  );
}

const stages = ["Your goals", "Your situation", "Preferences", "Review"];
// Question titles from brief §7 (A1–A4).
const stageQuestions = [
  "What would you like help with?",
  "Tell us a little about your situation.",
  "What matters most to you?",
  "Check your answers before we continue.",
];

function StepDemo() {
  const [step, setStep] = useState(0);
  const [moved, setMoved] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // Brief §7: focus returns to the step heading after a transition, never on first render.
    if (moved) headingRef.current?.focus({ preventScroll: true });
  }, [step, moved]);

  const go = (next: number) => {
    setMoved(true);
    setStep(next);
  };

  return (
    <div className={styles.step}>
      <ol className={styles.stepper} aria-label="Assessment progress">
        {stages.map((stage, i) => (
          <li
            key={stage}
            className={styles.stepperItem}
            data-state={i < step ? "complete" : i === step ? "current" : "upcoming"}
            aria-current={i === step ? "step" : undefined}
          >
            <span className={styles.stepperBar} aria-hidden="true" />
            <span className={styles.stepperLabel}>
              {i < step ? <Icon name="check" size={20} /> : null}
              {stage}
              {i < step ? <span className="visually-hidden"> (complete)</span> : null}
            </span>
          </li>
        ))}
      </ol>
      <div key={step} className={styles.stepPanel}>
        <p className="type-meta">
          Step {step + 1} of {stages.length} · {stages[step]}
        </p>
        <h5 ref={headingRef} tabIndex={-1} className={`type-h3 ${styles.stepHeading}`}>
          {stageQuestions[step]}
        </h5>
      </div>
      <div className={styles.stepActions}>
        <button type="button" className={styles.secondary} onClick={() => go(step - 1)} disabled={step === 0}>
          <Icon name="arrow-left" size={20} />
          Back
        </button>
        <button
          type="button"
          className={styles.primary}
          onClick={() => go(step + 1)}
          disabled={step === stages.length - 1}
        >
          Continue
          <Icon name="arrow-right" size={20} />
        </button>
      </div>
    </div>
  );
}

function ValidationDemo() {
  const [error, setError] = useState<string | null>(null);
  const id = useId();
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!value) setError("Enter your email address");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) setError("Enter your email in the format name@example.com");
    else setError(null);
  };
  return (
    <form className={styles.field} onSubmit={onSubmit} noValidate>
      <label htmlFor={`${id}-email`} className={styles.fieldLabel}>
        Email address
      </label>
      {error ? (
        <p id={`${id}-error`} className={styles.fieldError}>
          <Icon name="alert-circle" size={20} />
          <span>
            <span className="visually-hidden">Error: </span>
            {error}
          </span>
        </p>
      ) : null}
      <div className={styles.fieldRow}>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          className={styles.input}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={() => error && setError(null)}
        />
        <button type="submit" className={styles.secondary}>
          Check
        </button>
      </div>
    </form>
  );
}

function SavedDemo() {
  const [state, setState] = useState<"idle" | "busy" | "saved">("idle");
  const save = () => {
    setState("busy");
    // Stands in for the server confirming the save.
    window.setTimeout(() => setState("saved"), 700);
  };
  return (
    <div className={styles.saved}>
      <button type="button" className={styles.primary} onClick={save} disabled={state === "busy"} aria-busy={state === "busy"}>
        {state === "busy" ? "Saving…" : "Save my answers"}
      </button>
      <p role="status" className={styles.savedStatus}>
        {state === "saved" ? (
          <>
            <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" className={styles.savedCheck}>
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            Answers saved
          </>
        ) : null}
      </p>
    </div>
  );
}

function EntranceDemo() {
  const [run, setRun] = useState(0);
  return (
    <div className={styles.entrance}>
      <div key={run} className={styles.entranceStage}>
        <p className={`type-h2 ${styles.entranceTitle}`}>Make the right next move.</p>
        <div className={styles.entranceCards}>
          {[0, 1, 2].map((i) => (
            <span key={i} className={styles.entranceCard} style={{ "--i": i } as CSSProperties} />
          ))}
        </div>
      </div>
      <button type="button" className={styles.secondary} onClick={() => setRun((n) => n + 1)}>
        <Icon name="refresh" size={20} />
        Replay entrance
      </button>
    </div>
  );
}

export function MotionLab() {
  const [reduced, setReduced] = useState(false);
  return (
    <div className={styles.lab} data-motion={reduced ? "reduced" : undefined}>
      <div className={styles.labBar}>
        <p className="type-h3">Motion lab</p>
        <label className={styles.switch}>
          <input type="checkbox" role="switch" checked={reduced} onChange={(e) => setReduced(e.target.checked)} />
          <span className={styles.switchTrack} aria-hidden="true">
            <span />
          </span>
          Preview reduced motion
        </label>
      </div>
      <p className={`type-meta ${styles.labNote}`}>
        Every demo reads the motion tokens. The page also follows your device’s reduced-motion setting
        automatically.
      </p>
      <div className={styles.demos}>
        <Demo title="Hover and press" spec="160ms hover, lift ≤1px · 100ms press to 0.985">
          <button type="button" className={styles.primary}>
            Find my next step
            <Icon name="arrow-right" size={20} />
          </button>
        </Demo>
        <Demo title="Choice selection" spec="200ms border and tint · check pops in">
          <ChoiceDemo />
        </Demo>
        <Demo title="Step transition" spec="260ms · enters 10px · focus moves to heading">
          <StepDemo />
        </Demo>
        <Demo title="Validation" spec="170ms reveal · never shakes">
          <ValidationDemo />
        </Demo>
        <Demo title="Saved" spec="200ms check draw, only after the server confirms">
          <SavedDemo />
        </Demo>
        <Demo title="Entrance" spec="480ms title · 680ms cards at 90ms stagger">
          <EntranceDemo />
        </Demo>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { CallPreview, QuestionPreview, ResultPreview, ReviewPreview } from "./previews";
import styles from "./home.module.css";

const steps: { title: string; text: string; panel: ReactNode }[] = [
  {
    title: "One topic at a time",
    text: "Short questions with clear choices, and a note on why we ask anything personal.",
    panel: <QuestionPreview variant="goal" />,
  },
  {
    title: "Check everything before it’s sent",
    text: "A summary of your answers, with a Change link beside each one.",
    panel: <ReviewPreview />,
  },
  {
    title: "A clear result, then your choice",
    text: "Routes that may fit and why. A call is there if you want it, never in the way.",
    panel: (
      <div className={styles.resultStack}>
        <ResultPreview />
        <CallPreview />
      </div>
    ),
  },
];

/**
 * H0.6 product preview, told by ordinary scrolling (brief §15 scene 4, no
 * scroll-jacking). From 1024px the narrative scrolls past a sticky panel
 * that switches as each step crosses the middle of the screen; below that,
 * each step is followed by its own static card. Without JavaScript the
 * first panel stays, and every step's text is always readable.
 */
export function ProductPreview() {
  const [active, setActive] = useState(0);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.step));
        }
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    for (const element of stepRefs.current) if (element) observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.preview}>
      <ol className={styles.previewSteps}>
        {steps.map((step, i) => (
          <li
            key={step.title}
            ref={(element) => {
              stepRefs.current[i] = element;
            }}
            data-step={i}
            data-active={i === active || undefined}
            className={styles.previewStep}
          >
            <span className={styles.previewNum} aria-hidden="true">
              {i + 1}
            </span>
            <div className={styles.previewCopy}>
              <h3 className="type-h2">{step.title}</h3>
              <p>{step.text}</p>
            </div>
            <figure className={styles.previewInline}>
              <div aria-hidden="true" inert>
                {step.panel}
              </div>
              <figcaption className={styles.previewLabel}>Illustrative preview</figcaption>
            </figure>
          </li>
        ))}
      </ol>
      <figure className={styles.previewStage}>
        <div className={styles.stageFrame} aria-hidden="true" inert>
          {steps.map((step, i) => (
            <div key={step.title} className={styles.stagePanel} data-active={i === active || undefined}>
              {step.panel}
            </div>
          ))}
        </div>
        <figcaption className={styles.previewLabel}>Illustrative preview</figcaption>
      </figure>
    </div>
  );
}

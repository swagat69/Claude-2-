"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { StatusCard } from "@/components/status/StatusCard";
import { track } from "@/lib/assessment/analytics.ts";
import { draftStore } from "@/lib/assessment/draft.ts";
import { firstIncompleteStep, hardGate } from "@/lib/assessment/flow.ts";
import { stepInfo, type GateReason } from "@/lib/assessment/questions.ts";
import { formatSgPhone } from "@/lib/format.ts";
import { useDraft } from "@/lib/assessment/useDraft.ts";
import { StepFooter, useHeadingFocus } from "./StepFrame";
import { gateCopy } from "./content";
import styles from "./assessment.module.css";

function useRedirect(to: string | null) {
  const router = useRouter();
  useEffect(() => {
    if (to) router.replace(to);
  }, [to, router]);
}

/* -------------------------------------------------------------------------- */
/* Hard stop                                                                  */
/* -------------------------------------------------------------------------- */

interface Resource {
  name: string;
  text: string;
  href?: string;
}

const moneySense: Resource = {
  name: "MoneySense",
  text: "Free, impartial guides on borrowing and managing debt, from the Singapore government.",
  href: "https://www.moneysense.gov.sg/",
};
const creditCounselling: Resource = {
  name: "Credit Counselling Singapore",
  text: "Free, confidential help if repayments are getting hard to manage.",
  href: "https://www.ccs.org.sg/",
};
const resources: Record<GateReason, Resource[]> = {
  residency: [
    { name: "A bank or licensed lender where you live", text: "They can tell you what you’re eligible for locally." },
    moneySense,
  ],
  age: [moneySense, creditCounselling],
  "business-jurisdiction": [
    {
      name: "A bank or lender where the business is registered",
      text: "They can tell you what the business is eligible for.",
    },
    {
      name: "Enterprise Singapore",
      text: "Financing schemes for businesses that register in Singapore.",
      href: "https://www.enterprisesg.gov.sg/",
    },
  ],
};

/**
 * Hard stop (brief §8): the real reason in plain words, a way to correct a
 * mistaken answer, and somewhere useful to go next. Nothing has been sent.
 */
export function GateScreen() {
  const draft = useDraft();
  const container = useRef<HTMLDivElement>(null);
  const gate = draft ? hardGate(draft.answers) : null;
  const redirect =
    draft === undefined
      ? null
      : draft === null
        ? "/assessment"
        : draft.status === "submitted"
          ? "/assessment/continue"
          : gate
            ? null
            : stepInfo[firstIncompleteStep(draft.answers)].href;

  useRedirect(redirect);
  useHeadingFocus(container, gate !== null && !redirect);

  if (!gate || redirect) return <div className={styles.pending} aria-busy="true" />;
  const copy = gateCopy[gate.reason];

  return (
    <div ref={container} className="container">
      <div className={styles.outcome}>
        <StatusCard
          status="no-match"
          headingLevel={1}
          title={copy.title}
          actions={
            <>
              <ButtonLink href={stepInfo[gate.step].href} iconStart="edit">
                Change my answer
              </ButtonLink>
              <ButtonLink href="/contact" variant="secondary">
                Contact the team
              </ButtonLink>
            </>
          }
        >
          <p>
            {copy.body} <Placeholder note="Eligibility policy and wording, approved by product and legal" />
          </p>
          <p>If you chose that answer by mistake, change it and carry on. We haven’t sent your answers anywhere.</p>
        </StatusCard>

        <section className={styles.resources} aria-labelledby="resources-title">
          <h2 id="resources-title" className="type-h3">
            Other places to get help
          </h2>
          <ul>
            {resources[gate.reason].map((resource) => (
              <li key={resource.name}>
                {resource.href ? (
                  <a href={resource.href} rel="noopener">
                    {resource.name}
                    <Icon name="external" size={20} />
                    <span className="visually-hidden"> (external site)</span>
                  </a>
                ) : (
                  <strong>{resource.name}</strong>
                )}
                <span className={styles.stageText}>{resource.text}</span>
              </li>
            ))}
          </ul>
          <p className={styles.panelNote}>
            <Placeholder note="Approved list of alternative support organisations" />
          </p>
        </section>

        <StepFooter step="not-available" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* After submit (Part 5 designs the real handoff)                             */
/* -------------------------------------------------------------------------- */

/** A short, non-sensitive reference for messages and support (brief §19). */
const reference = (id: string) => `DFX-${id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;

export function ContinueScreen() {
  const draft = useDraft();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const redirect =
    draft === undefined
      ? null
      : draft === null
        ? "/assessment"
        : draft.status === "submitted"
          ? null
          : stepInfo[firstIncompleteStep(draft.answers)].href;

  useRedirect(redirect);
  const ready = Boolean(draft && !redirect);
  useHeadingFocus(container, ready);

  if (!draft || !ready) return <div className={styles.pending} aria-busy="true" />;
  const { channel, mobile, email } = draft.contact;

  const startNew = () => {
    track("assessment_restarted", { step_id: "continue" });
    draftStore.clear();
    router.push("/assessment");
  };

  return (
    <div ref={container} className="container">
      <div className={`${styles.outcome} ${styles.continueCard}`}>
        <p className={`type-eyebrow ${styles.eyebrow}`}>Answers saved</p>
        <h1 className="type-h1" tabIndex={-1}>
          {channel === "whatsapp" ? "Next, continue in WhatsApp" : "Next, get your secure link by email"}
        </h1>
        <p className="type-body-l">
          Your assessment is complete and saved. The next screen explains exactly what happens when you continue.
        </p>
        <dl className={styles.facts}>
          <div>
            <dt>Reference</dt>
            <dd>{reference(draft.id)}</dd>
          </div>
          <div>
            <dt>{channel === "whatsapp" ? "WhatsApp number" : "Email"}</dt>
            <dd>{channel === "whatsapp" ? `+65 ${formatSgPhone(mobile ?? "")}` : email}</dd>
          </div>
        </dl>
        <p className={styles.panelNote}>
          <Placeholder note="WhatsApp and email handoff screens (W1, E1) and processing (M1) are designed in Part 5" />
        </p>
        <div className={styles.outcomeActions}>
          <ButtonLink href="/" variant="secondary">
            Back to the homepage
          </ButtonLink>
          <Button variant="tertiary" iconStart="refresh" onClick={startNew}>
            Start a new assessment
          </Button>
        </div>
      </div>
    </div>
  );
}

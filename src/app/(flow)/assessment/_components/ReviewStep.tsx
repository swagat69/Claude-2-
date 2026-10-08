"use client";

import { useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState, type FormEvent } from "react";
import { ChoiceCards } from "@/components/form/Choices";
import { Notice } from "@/components/feedback/Notice";
import { ConsentGroup } from "@/components/form/ConsentGroup";
import { EmailField, PhoneField } from "@/components/form/SpecialFields";
import { TextField } from "@/components/form/TextField";
import { Icon, type IconName } from "@/components/icon/Icon";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { QuestionHeading } from "@/components/question/QuestionHeading";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import { track } from "@/lib/assessment/analytics.ts";
import { CONSENT_VERSION, draftStore, type ConsentRecord, type Draft } from "@/lib/assessment/draft.ts";
import { api } from "@/lib/service/api.ts";
import {
  contactErrors,
  contactFieldIds,
  contactForSubmission,
  contactFormatError,
  pathVariant,
  pruneAnswers,
  reviewGroups,
  type Channel,
  type Contact,
  type ContactField,
  type FieldError,
} from "@/lib/assessment/flow.ts";
import { StepFrame, useStepGuard } from "./StepFrame";
import { ReviewRail } from "./content";
import styles from "./assessment.module.css";

const channelOptions = [
  {
    value: "whatsapp",
    label: "WhatsApp",
    description: "We’ll open a chat with DFX in WhatsApp. Your answers stay saved here.",
    icon: "message" as IconName,
  },
  {
    value: "email",
    label: "Email",
    description: "We’ll email you a secure link to your result.",
    icon: "mail" as IconName,
  },
];

const submitLabels: Record<Channel | "none", string> = {
  none: "See my next step",
  whatsapp: "Continue with WhatsApp",
  email: "Continue with email",
};

const setContact = (field: keyof Contact, value: string) =>
  draftStore.update((draft) => ({ ...draft, contact: { ...draft.contact, [field]: value } }));

/**
 * A4: check answers, choose how to continue, see who will see what, and give
 * (or not) separate marketing permission (brief §7 A4, §19). Validation
 * summary at the top, inline errors by each field.
 */
export function ReviewStep() {
  const guard = useStepGuard("review");
  const router = useRouter();
  const [errors, setErrors] = useState<FieldError[]>([]);
  const [summary, setSummary] = useState<FieldError[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const draft = guard.state === "ready" || (guard.state === "submitted" && busy) ? guard.draft : null;
  const ready = draft !== null;

  // Seeing the review switches Continue on earlier steps to "back to review" (brief A4).
  useEffect(() => {
    if (ready) draftStore.update((d) => (d.status === "in_progress" ? { ...d, status: "review" } : d));
  }, [ready]);

  useLayoutEffect(() => () => setBusy(false), []);

  const contact = draft?.contact ?? {};
  const errorFor = (field: ContactField) => errors.find((e) => e.field === field)?.message;

  /** Format problems on blur only; never removes an error (that waits for submit, so nothing moves under the pointer). */
  const checkFormat = (field: ContactField) => {
    const current = draftStore.getSnapshot()?.contact ?? {};
    const message = contactFormatError(field, current);
    if (!message) return;
    setErrors((list) => [
      ...list.filter((e) => e.field !== field),
      { field, fieldId: contactFieldIds[field], code: "format", message },
    ]);
  };

  const chooseChannel = (value: string) => {
    const channel = value as Channel;
    setContact("channel", channel);
    track("contact_channel_selected", { channel, consent_variant: CONSENT_VERSION });
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const current = draftStore.getSnapshot();
    if (!current || busy) return;
    const found = contactErrors(current.contact);
    setAttempt((n) => n + 1);
    setErrors(found);
    setSummary(found);
    if (found.length) {
      for (const error of found) {
        track("assessment_validation_error", { step_id: "review", field_id: error.field, error_code: error.code });
      }
      return;
    }

    const form = new FormData(event.currentTarget);
    const channel = current.contact.channel as Channel;
    const marketing = {
      email: form.get("marketing_email") === "yes",
      whatsapp: form.get("marketing_whatsapp") === "yes",
    };
    const timestamp = new Date().toISOString();
    const consent: ConsentRecord[] = [
      { purpose: "service", channel, granted: true, version: CONSENT_VERSION, timestamp },
      { purpose: "marketing", channel: "email", granted: marketing.email, version: CONSENT_VERSION, timestamp },
      { purpose: "marketing", channel: "whatsapp", granted: marketing.whatsapp, version: CONSENT_VERSION, timestamp },
    ];
    setBusy(true);
    setSubmitError(false);
    const sent: Draft = {
      ...current,
      status: "submitted",
      answers: pruneAnswers(current.answers),
      contact: contactForSubmission(current.contact),
      marketing,
      consent,
      submittedAt: Date.now(),
    };
    try {
      // The assessment API accepts the answers and the consent audit (brief §20). Safe to repeat: same draft, same assessment.
      await api.submit(sent);
    } catch {
      // Never a silent failure: the answers stay here and the person can try again (brief §8).
      setBusy(false);
      setSubmitError(true);
      return;
    }
    track("assessment_submitted", {
      path_variant: pathVariant(current.answers),
      channel,
      marketing_opt_in: marketing.email || marketing.whatsapp,
    });
    draftStore.update(() => sent);
    router.push("/assessment/continue");
  };

  const groups = draft
    ? reviewGroups(draft.answers).map((group) => ({
        id: `review-${group.step}`,
        title: group.title,
        changeHref: group.href,
        rows: group.rows.map((row) => ({ label: row.label, value: row.value })),
      }))
    : [];

  return (
    <StepFrame
      step="review"
      guard={busy && draft ? { state: "ready", draft } : guard}
      wide
      rail={<ReviewRail />}
      railLabel="What happens next"
      errors={summary.map(({ fieldId, message }) => ({ fieldId, message }))}
      attempt={attempt}
      onSubmit={submit}
      submitLabel={submitLabels[contact.channel ?? "none"]}
      busy={busy}
    >
      <div className={styles.questions}>
        <QuestionHeading
          title="Check your answers before we continue."
          lead="Change anything that’s not right. Nothing is sent until you choose how to continue."
        />
        <ReviewSummary groups={groups} />

        <section className={styles.panel} aria-labelledby="contact-title">
          <h2 id="contact-title" className={`type-h2 ${styles.panelTitle}`}>
            How would you like to continue?
          </h2>
          <p className={styles.panelLead}>
            We need a way to send your result and, if you want one, arrange a call. We’ll only use it for this request
            unless you say otherwise below.
          </p>
          <ChoiceCards
            id={contactFieldIds.channel}
            name="channel"
            legend="Where should we send your update?"
            options={channelOptions}
            columns={2}
            value={contact.channel ?? ""}
            onValueChange={chooseChannel}
            error={errorFor("channel")}
          />
          {contact.channel === "whatsapp" ? (
            <div className={styles.question} data-reveal>
              <PhoneField
                id={contactFieldIds.mobile}
                name="mobile"
                label="Mobile number"
                hint="A Singapore mobile number for WhatsApp, like 9123 4567."
                value={contact.mobile ?? ""}
                onChange={(e) => setContact("mobile", e.target.value)}
                onBlur={() => checkFormat("mobile")}
                error={errorFor("mobile")}
              />
            </div>
          ) : null}
          {contact.channel === "email" ? (
            <div className={styles.question} data-reveal>
              <EmailField
                id={contactFieldIds.email}
                name="email"
                label="Email address"
                hint="We’ll send your link here."
                value={contact.email ?? ""}
                onChange={(e) => setContact("email", e.target.value)}
                onBlur={() => checkFormat("email")}
                error={errorFor("email")}
              />
            </div>
          ) : null}
          <TextField
            id={contactFieldIds.firstName}
            name="firstName"
            label="First name"
            optional
            hint="So we know what to call you."
            autoComplete="given-name"
            width="medium"
            value={contact.firstName ?? ""}
            onChange={(e) => setContact("firstName", e.target.value)}
          />
        </section>

        <SharingPreview channel={contact.channel} />

        <ConsentGroup
          className={styles.consent}
          policyVersion={CONSENT_VERSION}
          privacyHref="/privacy"
          processing={
            <>
              We use your answers and contact details to prepare your result and, if you ask for one, a call.{" "}
              <Placeholder note="Required processing notice, approved by legal for Singapore (PDPA)" />
            </>
          }
          marketing={[
            {
              name: "marketing_email",
              label: "Send me occasional tips and offers by email",
              hint: "You can stop these at any time.",
            },
            {
              name: "marketing_whatsapp",
              label: "Send me occasional tips and offers on WhatsApp",
              hint: "Reply STOP at any time.",
            },
          ]}
        />
        <div role="alert" className={styles.gateLive}>
          {submitError ? (
            <Notice tone="error" title="We couldn’t send your answers just now">
              Nothing was lost: your answers are still here. Check your connection and try again.
            </Notice>
          ) : null}
        </div>
      </div>
    </StepFrame>
  );
}

/** Explicit preview of who sees what before anything leaves the site (brief A4, §19). */
function SharingPreview({ channel }: { channel?: Channel }) {
  const rows: { icon: IconName; who: string; what: string; show: boolean }[] = [
    {
      icon: "user",
      who: "The DFX team",
      what: "Your answers and contact details, to prepare your result and any call.",
      show: true,
    },
    {
      icon: "message",
      who: "WhatsApp (Meta)",
      what: "Your mobile number and a short reference code. Never your answers.",
      show: channel !== "email",
    },
    {
      icon: "mail",
      who: "Our email provider",
      what: "Your email address and a secure link. Never your answers.",
      show: channel !== "whatsapp",
    },
    {
      icon: "shield",
      who: "Lenders",
      what: "Nothing yet. We’ll ask you before sharing anything with a lender.",
      show: true,
    },
  ];
  return (
    <section className={styles.panel} aria-labelledby="sharing-title">
      <h2 id="sharing-title" className={`type-h3 ${styles.panelTitle}`}>
        Who sees what
      </h2>
      <p className={styles.panelLead}>
        Before anything leaves this site, here’s who receives what.{" "}
        <Placeholder note="Confirmed data flows: messaging provider, email provider, CRM, and whether and when lenders receive details" />
      </p>
      <dl className={styles.sharing}>
        {rows
          .filter((row) => row.show)
          .map((row) => (
            <div key={row.who} className={styles.sharingRow}>
              <dt>
                <Icon name={row.icon} size={20} />
                {row.who}
              </dt>
              <dd>{row.what}</dd>
            </div>
          ))}
      </dl>
    </section>
  );
}

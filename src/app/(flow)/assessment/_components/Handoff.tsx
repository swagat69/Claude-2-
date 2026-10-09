"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { EmailField } from "@/components/form/SpecialFields";
import { Icon } from "@/components/icon/Icon";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { track } from "@/lib/assessment/analytics.ts";
import { draftStore } from "@/lib/assessment/draft.ts";
import { firstIncompleteStep, type Channel } from "@/lib/assessment/flow.ts";
import { stepInfo } from "@/lib/assessment/questions.ts";
import { useDraft } from "@/lib/assessment/useDraft.ts";
import { formatSgPhone, suggestEmail, validateEmail } from "@/lib/format.ts";
import {
  api,
  reference,
  LINK_TTL_MS,
  RESEND_COOLDOWN_MS,
  ServiceError,
  WHATSAPP_BUSINESS,
  type EmailStatus,
  type ServerRecord,
} from "@/lib/service/api.ts";
import { useNow, useRecord } from "@/lib/service/hooks.ts";
import { useHeadingFocus } from "@/lib/useHeadingFocus";
import { PrototypeActions, PrototypeMessage, PrototypePanel, SettingChoice } from "../../_prototype/PrototypePanel";
import styles from "./handoff.module.css";

const LINK_MINUTES = Math.round(LINK_TTL_MS / 60_000);

/**
 * Part 5: the handoff to WhatsApp or email (brief §9 W1, E1). The website
 * never claims a message was sent because a link was opened or an email was
 * queued, and the assessment stays saved whatever happens in the other app.
 */
export function Handoff() {
  const draft = useDraft();
  const router = useRouter();
  const record = useRecord(draft?.status === "submitted" ? draft.id : null);
  const container = useRef<HTMLDivElement>(null);

  const redirect =
    draft === undefined || draft === null
      ? null
      : draft.status !== "submitted"
        ? stepInfo[firstIncompleteStep(draft.answers)].href
        : null;

  useEffect(() => {
    if (redirect) router.replace(redirect);
  }, [redirect, router]);

  const channel = record?.channel;
  useHeadingFocus(container, Boolean(record), channel);

  // Viewing the handoff moves the assessment to "awaiting contact" (brief §20).
  useEffect(() => {
    if (!record || !channel) return;
    track("handoff_viewed", { channel });
    if (record.status === "submitted") api.setChannel(record.id, channel);
    // Once per channel shown.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, channel]);

  if (draft === undefined || redirect || record === undefined)
    return <div className={styles.pending} aria-busy="true" />;

  if (draft === null || record === null) {
    return (
      <div ref={container} className="container">
        <div className={styles.page}>
          <EmptyState
            icon="mail"
            headingLevel={1}
            title="Open the link we sent you"
            actions={
              <>
                <ButtonLink href="/resume" iconEnd="arrow-right">
                  Get a new link
                </ButtonLink>
                <ButtonLink href="/assessment" variant="tertiary">
                  Start a new assessment
                </ButtonLink>
              </>
            }
          >
            <p>
              Your answers were sent from another tab or an earlier visit. The link in your WhatsApp chat or email takes
              you to your result.
            </p>
          </EmptyState>
        </div>
      </div>
    );
  }

  const switchTo = (to: Channel) => {
    track("fallback_selected", { from_channel: record.channel, to_channel: to });
    api.setChannel(record.id, to);
    draftStore.update((d) => ({ ...d, contact: { ...d.contact, channel: to } }));
  };

  return (
    <div ref={container} className="container">
      <div className={styles.page}>
        <p className={styles.sent}>
          <Icon name="check-circle" size={20} />
          Your answers are saved · Reference <strong>{reference(record.id)}</strong>
        </p>
        {record.status === "verified" || record.result ? <OpenedElsewhere /> : null}
        {record.channel === "whatsapp" ? (
          <WhatsAppHandoff record={record} onSwitch={() => switchTo("email")} />
        ) : (
          <EmailHandoff record={record} onSwitch={() => switchTo("whatsapp")} />
        )}
        <HandoffPrototype record={record} />
      </div>
    </div>
  );
}

function OpenedElsewhere() {
  return (
    <Notice tone="success" title="Your link has been opened">
      Your result is in the tab or app where you opened the link. You can close this one.
    </Notice>
  );
}

/* -------------------------------------------------------------------------- */
/* W1: WhatsApp                                                               */
/* -------------------------------------------------------------------------- */

/** The prefilled message: a short reference only, never answers (brief §19 WhatsApp guardrails). */
const messageFor = (record: ServerRecord) =>
  `Hi DFX, I’d like my loan assessment result. Reference: ${reference(record.id)}`;

function WhatsAppHandoff({ record, onSwitch }: { record: ServerRecord; onSwitch: () => void }) {
  const message = messageFor(record);
  const href = WHATSAPP_BUSINESS.number
    ? `https://wa.me/${WHATSAPP_BUSINESS.number}?text=${encodeURIComponent(message)}`
    : null;
  const opened = Boolean(record.whatsappOpenedAt);
  const [copied, setCopied] = useState<"idle" | "copied" | "failed">("idle");

  const open = () => {
    track("handoff_attempted", { channel: "whatsapp", route_origin: opened ? "retry" : "handoff" });
    api.openWhatsApp(record.id);
    if (href) window.open(href, "_blank", "noopener");
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied("copied");
    } catch {
      setCopied("failed");
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="handoff-title">
      <h1 id="handoff-title" className={`type-h1 ${styles.title}`} tabIndex={-1}>
        Continue in WhatsApp
      </h1>
      <p className={`type-body-l ${styles.lead}`}>
        We’ll open a chat with {WHATSAPP_BUSINESS.name}. Your assessment stays saved here.
      </p>

      <div className={styles.account}>
        <span className={styles.appIcon} aria-hidden="true">
          <Icon name="message" />
        </span>
        <div>
          <p className={styles.accountName}>
            {WHATSAPP_BUSINESS.name}{" "}
            <Placeholder note="DFX’s WhatsApp Business display name and number, which only DFX can provide" />
          </p>
          <p className={styles.muted}>DFX’s official WhatsApp account</p>
        </div>
      </div>

      <div className={styles.preview}>
        <p className={styles.previewLabel}>The message you’ll send</p>
        <p className={styles.bubble}>{message}</p>
        <p className={styles.muted}>
          Only this reference is shared, never your answers. Nothing is sent until you press send in WhatsApp.
        </p>
      </div>

      <div className={styles.actions}>
        <Button onClick={open} iconEnd="external" className={styles.primary}>
          {opened ? "Open WhatsApp again" : "Open WhatsApp"}
        </Button>
        <Button variant="tertiary" onClick={onSwitch}>
          Prefer email instead?
        </Button>
      </div>

      <div role="status" className={styles.live}>
        {opened ? (
          <div className={styles.status}>
            <p className={styles.statusTitle}>
              <Icon name="clock" size={20} />
              Waiting for your message in WhatsApp
            </p>
            <p>
              Once you send it, we’ll reply in the chat with a secure link to your result. The link works once, for{" "}
              {LINK_MINUTES} minutes.
            </p>
          </div>
        ) : null}
      </div>

      {opened ? (
        <details className={styles.help}>
          <summary>
            WhatsApp didn’t open?
            <Icon name="chevron-down" size={20} />
          </summary>
          <div className={styles.helpBody}>
            <p>Install WhatsApp or open WhatsApp Web, then try again. Or copy the message and send it yourself:</p>
            <p className={styles.bubble}>{message}</p>
            <div className={styles.actions}>
              <Button variant="secondary" size="compact" iconStart="document" onClick={copy}>
                Copy message
              </Button>
              <Button variant="tertiary" size="compact" onClick={onSwitch}>
                Get a link by email instead
              </Button>
            </div>
            <p role="status" className={styles.live}>
              {copied === "copied"
                ? "Message copied."
                : copied === "failed"
                  ? "Couldn’t copy. Select the message above instead."
                  : ""}
            </p>
          </div>
        </details>
      ) : null}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* E1: email                                                                  */
/* -------------------------------------------------------------------------- */

const statusCopy: Record<
  EmailStatus,
  { title: string; text: (address: string) => string; tone: "info" | "success" | "error" }
> = {
  queued: {
    title: "Sending your link",
    text: (a) => `We’ve asked our email service to send it to ${a}.`,
    tone: "info",
  },
  sent: {
    title: "Link sent",
    text: (a) => `Our email service has sent it to ${a}. It usually arrives within a few minutes.`,
    tone: "info",
  },
  delivered: {
    title: "Link delivered",
    text: (a) => `${a}’s email provider has accepted it. Check your inbox, and your spam folder if it isn’t there.`,
    tone: "success",
  },
  bounced: {
    title: "We couldn’t deliver your link",
    text: (a) => `The email to ${a} came back. Check the address and send it again.`,
    tone: "error",
  },
};

function EmailHandoff({ record, onSwitch }: { record: ServerRecord; onSwitch: () => void }) {
  const [address, setAddress] = useState(record.email?.address ?? record.contact.email ?? "");
  const [editing, setEditing] = useState(!record.email);
  const [error, setError] = useState<string | null>(null);
  const [problem, setProblem] = useState<"cooldown" | "rate-limited" | null>(null);
  const [busy, setBusy] = useState(false);
  const lastSend = record.email?.sends.at(-1);
  // Ticks while an email is in flight or the resend wait is running.
  const now = useNow(1000, Boolean(record.email));
  const liveStatus = now === null ? null : api.emailStatus(record, now);
  const cooldownLeft =
    lastSend && now !== null ? Math.max(0, Math.ceil((lastSend + RESEND_COOLDOWN_MS - now) / 1000)) : 0;
  const suggestion = suggestEmail(address);
  const reported = useRef<EmailStatus | null>(null);

  useEffect(() => {
    if (liveStatus && liveStatus !== reported.current && liveStatus !== "queued") {
      reported.current = liveStatus;
      track("email_delivery_status", { status: liveStatus });
    }
  }, [liveStatus]);

  const send = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    if (busy) return;
    const message = validateEmail(address);
    setError(message);
    if (message) return;
    setBusy(true);
    setProblem(null);
    try {
      await api.requestEmailLink(record.id, address.trim());
      track("email_link_requested", { attempt: (record.email?.sends.length ?? 0) + 1 });
      setEditing(false);
    } catch (e) {
      if (e instanceof ServiceError && (e.code === "cooldown" || e.code === "rate-limited")) setProblem(e.code);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={styles.panel} aria-labelledby="handoff-title">
      <h1 id="handoff-title" className={`type-h1 ${styles.title}`} tabIndex={-1}>
        Get a secure link by email
      </h1>
      <p className={`type-body-l ${styles.lead}`}>We’ll send a link to return to your results.</p>

      {editing ? (
        <form className={styles.form} noValidate onSubmit={send}>
          <EmailField
            id="handoff-email"
            name="email"
            label="Email address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => address.trim() && setError(validateEmail(address))}
            error={error}
            hint={`One email with a link to your result. The link works once, for ${LINK_MINUTES} minutes.`}
          />
          {suggestion && !error ? (
            <p className={styles.suggestion}>
              Did you mean <strong>{suggestion}</strong>?{" "}
              <button type="button" className={styles.linkButton} onClick={() => setAddress(suggestion)}>
                Use this address
              </button>
            </p>
          ) : null}
          <div className={styles.actions}>
            <Button type="submit" busy={busy} iconEnd="arrow-right" className={styles.primary}>
              Send my link
            </Button>
            <Button variant="tertiary" onClick={onSwitch}>
              Use WhatsApp instead
            </Button>
          </div>
        </form>
      ) : (
        <div className={styles.sentTo}>
          <p>
            Sending to <strong>{record.email?.address}</strong>
          </p>
          <button type="button" className={styles.linkButton} onClick={() => setEditing(true)}>
            Change<span className="visually-hidden"> email address</span>
          </button>
        </div>
      )}

      <div role="status" className={styles.live}>
        {liveStatus && record.email ? (
          <Notice tone={statusCopy[liveStatus].tone} title={statusCopy[liveStatus].title}>
            {statusCopy[liveStatus].text(record.email.address)}
            {liveStatus === "bounced" && suggestEmail(record.email.address) ? (
              <> Did you mean {suggestEmail(record.email.address)}?</>
            ) : null}
          </Notice>
        ) : null}
        {problem === "rate-limited" ? (
          <Notice tone="warning" title="That’s the most links we can send for now">
            Wait 15 minutes, use WhatsApp instead, or <Link href="/contact">contact the team</Link>.
          </Notice>
        ) : null}
      </div>

      {!editing && record.email ? (
        <div className={styles.actions}>
          {cooldownLeft > 0 ? (
            <p className={styles.muted}>You can send another link in {cooldownLeft} seconds.</p>
          ) : (
            <Button variant="secondary" busy={busy} iconStart="refresh" onClick={() => send()}>
              Send it again
            </Button>
          )}
          {liveStatus === "bounced" ? (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              Change the address
            </Button>
          ) : null}
          <Button variant="tertiary" onClick={onSwitch}>
            Use WhatsApp instead
          </Button>
        </div>
      ) : null}

      <p className={styles.muted}>
        <Icon name="lock" size={20} />
        The link works once. If it expires, you can ask for a new one; we never show whether an email address has an
        assessment.
      </p>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Prototype: the other app                                                   */
/* -------------------------------------------------------------------------- */

function HandoffPrototype({ record }: { record: ServerRecord }) {
  const messages = api.outbox().filter((m) => m.assessmentId === record.id);
  const linkMessages = messages.filter((m) => m.channel === record.channel);
  const latest = linkMessages.at(-1);
  return (
    <PrototypePanel title={record.channel === "whatsapp" ? "What happens in WhatsApp" : "What arrives by email"}>
      {record.channel === "whatsapp" ? (
        <>
          {record.whatsappOpenedAt ? (
            <PrototypeMessage from="You" meta="in WhatsApp" mine>
              <p>{messageFor(record)}</p>
            </PrototypeMessage>
          ) : (
            <p>Press “Open WhatsApp” first, as the person would.</p>
          )}
          {record.whatsappOpenedAt && !latest ? (
            <PrototypeActions>
              <Button variant="secondary" size="compact" onClick={() => api.simulateWhatsAppReply(record.id)}>
                Send the message (simulated)
              </Button>
            </PrototypeActions>
          ) : null}
          {latest ? (
            <PrototypeMessage from={WHATSAPP_BUSINESS.name} meta="automatic reply">
              <p>Thanks! Here’s your secure link. It works once, for {LINK_MINUTES} minutes:</p>
              <p>
                <Link href={`/resume?token=${latest.token}`}>See my result</Link>
              </p>
            </PrototypeMessage>
          ) : null}
        </>
      ) : (
        <>
          <SettingChoice
            setting="email"
            label="Next email will be"
            options={[
              { value: "deliver", label: "Delivered" },
              { value: "bounce", label: "Bounced back" },
            ]}
          />
          {latest && record.email?.outcome !== "bounce" ? (
            <PrototypeMessage from="DFX <hello@dfx.example>" meta={`to ${latest.to}`}>
              <p>
                <strong>Your DFX result link</strong>
              </p>
              <p>
                Hi{record.contact.firstName ? ` ${record.contact.firstName}` : ""}, here’s your secure link. It works
                once, for {LINK_MINUTES} minutes.
              </p>
              <p>
                <Link href={`/resume?token=${latest.token}`}>See my result</Link>
              </p>
            </PrototypeMessage>
          ) : (
            <p>No email yet. Send a link to see it arrive here.</p>
          )}
        </>
      )}
      <SettingChoice
        setting="link"
        label="When the link is opened"
        options={[
          { value: "ok", label: "It works" },
          { value: "expired", label: "It has expired" },
        ]}
      />
      {record.contact.mobile ? (
        <p className={styles.muted}>WhatsApp number on file: +65 {formatSgPhone(record.contact.mobile)}</p>
      ) : null}
    </PrototypePanel>
  );
}

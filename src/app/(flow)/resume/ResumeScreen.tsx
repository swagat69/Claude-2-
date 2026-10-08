"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/button/Button";
import { Notice } from "@/components/feedback/Notice";
import { EmailField } from "@/components/form/SpecialFields";
import { Icon } from "@/components/icon/Icon";
import { sinceBucket, track } from "@/lib/assessment/analytics.ts";
import { validateEmail } from "@/lib/format.ts";
import { api, ServiceError, type ApiError } from "@/lib/service/api.ts";
import { useRecord } from "@/lib/service/hooks.ts";
import { sessionStore } from "@/lib/service/session.ts";
import { useHeadingFocus } from "@/lib/useHeadingFocus";
import { PrototypeMessage, PrototypePanel } from "../_prototype/PrototypePanel";
import styles from "../assessment/_components/handoff.module.css";

type Outcome = { state: "checking" } | { state: "failed"; reason: ApiError | "missing" };

/** One attempt per token, even if React runs the effect twice. */
const attempts = new Map<string, ReturnType<typeof api.resume>>();

export function ResumeFromUrl() {
  const params = useSearchParams();
  const token = params.get("token");
  return <ResumeScreen key={token ?? ""} token={token} />;
}

/** Static shell while the link is read. */
export function ResumePending() {
  return (
    <div className="container">
      <div className={styles.page}>
        <p className={styles.sent}>
          <Icon name="lock" size={20} />
          Checking your link…
        </p>
      </div>
    </div>
  );
}

/**
 * Opening a link from WhatsApp or email (brief §9 "What the handoff must
 * preserve"). A good link opens the result; an expired, used or broken one
 * explains itself and offers a new link without revealing whether an email
 * address has an assessment (brief §8).
 */
export function ResumeScreen({ token }: { token: string | null }) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<Outcome>(
    token ? { state: "checking" } : { state: "failed", reason: "missing" },
  );
  const container = useRef<HTMLDivElement>(null);
  useHeadingFocus(container, outcome.state === "failed", outcome.state);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const attempt = attempts.get(token) ?? api.resume(token);
    attempts.set(token, attempt);
    attempt.then(
      ({ id, channel, sentAt }) => {
        if (cancelled) return;
        sessionStore.set({ id, channel, verifiedAt: Date.now(), sentAt });
        track("handoff_resumed", { channel, time_since_handoff_bucket: sinceBucket(sentAt ? Date.now() - sentAt : 0) });
        router.replace("/results");
      },
      (error: unknown) => {
        if (cancelled) return;
        const reason = error instanceof ServiceError ? error.code : "invalid";
        // Opening the same link again in the tab that already used it just shows the result.
        const session = sessionStore.get();
        if (reason === "used" && session) {
          router.replace("/results");
          return;
        }
        track("resume_failed", { reason_code: reason });
        setOutcome({ state: "failed", reason });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [token, router]);

  if (outcome.state === "checking") {
    return (
      <div className="container">
        <div className={styles.page}>
          <p role="status" className={styles.sent}>
            <Icon name="lock" size={20} />
            Checking your link…
          </p>
        </div>
      </div>
    );
  }

  const copy = {
    expired: {
      title: "This link has expired",
      text: "Links work once, for 24 hours, to keep your result private. Ask for a new one below.",
    },
    used: {
      title: "This link has already been used",
      text: "Each link works once, to keep your result private. Ask for a new one below.",
    },
    missing: {
      title: "Open the link we sent you",
      text: "Your result opens from the link in your WhatsApp chat or email. If you can’t find it, ask for a new one.",
    },
  }[outcome.reason as "expired" | "used" | "missing"] ?? {
    title: "This link doesn’t work",
    text: "It may have been copied only in part. Open it again from the message, or ask for a new one below.",
  };

  return (
    <div ref={container} className="container">
      <div className={styles.page}>
        <section className={styles.panel} aria-labelledby="resume-title">
          <h1 id="resume-title" className={`type-h1 ${styles.title}`} tabIndex={-1}>
            {copy.title}
          </h1>
          <p className={`type-body-l ${styles.lead}`}>{copy.text}</p>
          <NewLinkForm reason={outcome.reason} />
          <p className={styles.muted}>
            <Icon name="message" size={20} />
            Used WhatsApp? Message us again with your reference, and we’ll reply with a new link.
          </p>
        </section>
      </div>
    </div>
  );
}

function NewLinkForm({ reason }: { reason: ApiError | "missing" }) {
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<"idle" | "busy" | "sent" | "limited">("idle");
  const [sentTo, setSentTo] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "busy") return;
    const message = validateEmail(address);
    setError(message);
    if (message) return;
    setState("busy");
    try {
      await api.requestNewLink(address);
      track("new_link_requested", { reason_code: reason });
      setSentTo(address.trim());
      setState("sent");
    } catch {
      setState("limited");
    }
  };

  return (
    <>
      <form className={styles.form} noValidate onSubmit={submit}>
        <EmailField
          id="resume-email"
          name="email"
          label="Email address"
          hint="The one you gave with your answers."
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          error={error}
        />
        <div className={styles.actions}>
          <Button type="submit" busy={state === "busy"} iconEnd="arrow-right" className={styles.primary}>
            Send me a new link
          </Button>
          <Link href="/assessment" className={styles.linkButton}>
            Start a new assessment
          </Link>
        </div>
      </form>
      <div role="status" className={styles.live}>
        {state === "sent" ? (
          <Notice tone="info" title="Check your email">
            If there’s an assessment for {sentTo}, we’ve sent a new link. It can take a few minutes; check your spam
            folder too.
          </Notice>
        ) : null}
        {state === "limited" ? (
          <Notice tone="warning" title="That’s the most links we can send for now">
            Wait 15 minutes and try again, or <Link href="/contact">contact the team</Link>.
          </Notice>
        ) : null}
      </div>
      {state === "sent" ? <Inbox address={sentTo} /> : null}
    </>
  );
}

/** PROTOTYPE: the email that would arrive, if the address has an assessment. */
function Inbox({ address }: { address: string }) {
  useRecord(null); // re-render when the mock server changes
  const latest = api
    .outbox()
    .filter((m) => m.channel === "email" && m.to.toLowerCase() === address.toLowerCase())
    .at(-1);
  return (
    <PrototypePanel title="What arrives by email">
      {latest ? (
        <PrototypeMessage from="DFX <hello@dfx.example>" meta={`to ${latest.to}`}>
          <p>
            <strong>Your new DFX result link</strong>
          </p>
          <p>
            <Link href={`/resume?token=${latest.token}`}>See my result</Link>
          </p>
        </PrototypeMessage>
      ) : (
        <p>Nothing arrives: there’s no assessment for this address. The page above says the same thing either way.</p>
      )}
    </PrototypePanel>
  );
}

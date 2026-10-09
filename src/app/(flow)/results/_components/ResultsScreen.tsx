"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type RefObject } from "react";
import { AdvisorPanel } from "@/components/advisor/AdvisorPanel";
import { Button, ButtonLink } from "@/components/button/Button";
import { EmptyState } from "@/components/feedback/EmptyState";
import { Notice } from "@/components/feedback/Notice";
import { Checkbox } from "@/components/form/Choices";
import { Icon } from "@/components/icon/Icon";
import { business } from "@/config/business";
import { help } from "@/config/help";
import { RouteCard } from "@/components/result/RouteCard";
import { ReviewSummary } from "@/components/review/ReviewSummary";
import { StatusCard } from "@/components/status/StatusCard";
import { pathVariant, reviewGroups } from "@/lib/assessment/flow.ts";
import { track } from "@/lib/assessment/analytics.ts";
import { draftStore } from "@/lib/assessment/draft.ts";
import { api, reference, type ServerRecord } from "@/lib/service/api.ts";
import { FACTS_AS_OF, reasonCopy, type ResultKind } from "@/lib/service/engine.ts";
import { useNow, useRecord, useSession } from "@/lib/service/hooks.ts";
import { SINGAPORE, formatDay, formatTime } from "@/lib/time.ts";
import { useHeadingFocus } from "@/lib/useHeadingFocus";
import { PrototypeActions, PrototypePanel, SettingChoice } from "../../_prototype/PrototypePanel";
import styles from "./results.module.css";

type View = "pending" | "processing" | "failed" | ResultKind;

const statusFor: Record<ResultKind, string> = { fit: "result_ready", review: "human_review", "no-match": "no_match" };

export const callDetails = {
  who: business.call.who,
  /** The same, mid-sentence. */
  whoInSentence: business.call.whoInSentence,
  duration: `About ${business.call.minutes} minutes, free`,
  format: `Phone, or video on ${business.call.videoTool}`,
  agenda: ["Check what you need", "Walk through the routes that may fit", "Agree next steps, if any"],
};

/** Shared by the results, booking and confirmation pages: who is signed in through a link, and their assessment. */
export function useVerifiedRecord() {
  const session = useSession();
  const record = useRecord(session?.id);
  return { session, record };
}

export function NoSession() {
  return (
    <div className="container">
      <div className={styles.narrow}>
        <EmptyState
          icon="lock"
          headingLevel={1}
          title="Open your result from your link"
          actions={
            <>
              <ButtonLink href="/resume" iconEnd="arrow-right">
                Get a new link
              </ButtonLink>
              <ButtonLink href="/assessment" variant="tertiary">
                Start an assessment
              </ButtonLink>
            </>
          }
        >
          <p>
            To keep your result private, it opens from the secure link we sent to your WhatsApp chat or email, in the
            same browser tab.
          </p>
        </EmptyState>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="container">
      <div className={styles.narrow}>
        <EmptyState
          icon="alert-circle"
          headingLevel={1}
          title="We can’t find this result"
          actions={
            <ButtonLink href="/assessment" iconEnd="arrow-right">
              Start a new assessment
            </ButtonLink>
          }
        >
          <p>It may have been removed. You can start again; it takes a few minutes.</p>
        </EmptyState>
      </div>
    </div>
  );
}

/**
 * M1 and R1–R4 (brief §9, §10) on one URL: the real processing state, then
 * a result that says what it is. A service error is never shown as "no
 * match", and nothing carries a score or a rank.
 */
export function ResultsScreen() {
  const { session, record } = useVerifiedRecord();
  const container = useRef<HTMLDivElement>(null);
  const processing = record?.status === "processing";
  const now = useNow(400, processing);
  const elapsed = record?.processing && now !== null ? now - record.processing.startedAt : 0;

  const view: View = !record
    ? "pending"
    : record.status === "verified"
      ? "pending"
      : processing
        ? elapsed < 1000
          ? "pending"
          : "processing"
        : record.status === "failed"
          ? "failed"
          : (record.result?.kind ?? "pending");

  // A verified assessment starts its check; a running one settles as time passes (brief M1).
  useEffect(() => {
    if (!record) return;
    if (record.status === "verified") {
      track("processing_started", { path_variant: pathVariant(record.answers) });
      api.startProcessing(record.id);
    }
  }, [record]);

  useEffect(() => {
    if (record && processing) api.refresh(record.id);
  }, [record, processing, now]);

  // Announce and record each real outcome once.
  const reported = useRef<string | null>(null);
  useEffect(() => {
    if (!record || view === "pending" || view === "processing") return;
    const key = `${record.id}:${view}:${record.updatedAt}`;
    if (reported.current?.startsWith(`${record.id}:${view}`)) return;
    reported.current = key;
    if (view === "failed") track("result_fetch_failed", { step_id: "results" });
    else {
      track("processing_completed", { result_status: statusFor[view] });
      track("result_displayed", {
        result_status: statusFor[view],
        route_count: record.result?.routes.length ?? 0,
        engine_version: record.result?.engineVersion,
      });
    }
  }, [record, view]);

  useHeadingFocus(container, view !== "pending", view);

  if (session === undefined || (session && record === undefined))
    return <div className={styles.pending} aria-busy="true" />;
  if (!session) return <NoSession />;
  if (!record) return <NotFound />;

  return (
    <div ref={container} className="container">
      {view === "pending" ? (
        <div className={styles.pending}>
          <p role="status" className="visually-hidden">
            Checking your answers
          </p>
        </div>
      ) : view === "processing" ? (
        <Processing record={record} now={now ?? record.processing?.startedAt ?? 0} />
      ) : view === "failed" ? (
        <Failed record={record} />
      ) : view === "fit" ? (
        <Fit record={record} />
      ) : view === "review" ? (
        <Review record={record} />
      ) : (
        <NoMatch record={record} />
      )}
      <ResultsPrototype record={record} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* M1: processing                                                             */
/* -------------------------------------------------------------------------- */

function Processing({ record, now }: { record: ServerRecord; now: number }) {
  const steps = api.processingSteps(record, now);
  const current = steps.find((s) => s.state === "current")?.label ?? "Preparing your result";
  return (
    <div className={styles.narrow}>
      <StatusCard status="processing" headingLevel={1} title="We’re checking the information you shared." steps={steps}>
        <p>
          This usually takes a few seconds. If a specialist needs to look, we’ll tell you here and on the channel you
          chose, {business.reviewTime}.
        </p>
      </StatusCard>
      <p role="status" className="visually-hidden">
        {current}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* R4: error                                                                  */
/* -------------------------------------------------------------------------- */

function Failed({ record }: { record: ServerRecord }) {
  const retry = () => {
    track("retry_clicked", { step_id: "results" });
    api.startProcessing(record.id);
  };
  return (
    <div className={styles.narrow}>
      <StatusCard
        status="unavailable"
        headingLevel={1}
        title="We couldn’t load your result just now."
        actions={
          <>
            <Button iconStart="refresh" onClick={retry}>
              Try again
            </Button>
            <ButtonLink href="/contact" variant="tertiary">
              Get help
            </ButtonLink>
          </>
        }
      >
        <p>Your answers are saved. This is a problem on our side, not with your answers.</p>
        <p>We tried a few times before showing this. If it keeps happening, the team can help.</p>
      </StatusCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* R1: routes that may fit                                                    */
/* -------------------------------------------------------------------------- */

function Fit({ record }: { record: ServerRecord }) {
  const routes = record.result?.routes ?? [];
  const [declined, setDeclined] = useState(false);
  const booked = record.booking?.status === "confirmed" ? record.booking : null;
  const firstRoute = useRef<HTMLDivElement>(null);
  const side = useRef<HTMLDivElement>(null);
  const showBar = useStickyCall(firstRoute, side, !declined && !booked);
  const count = routes.length === 1 ? "one route" : `${routes.length === 2 ? "two" : routes.length} routes`;

  return (
    <div className={styles.resultGrid} data-bar={showBar || undefined}>
      <div className={styles.resultMain}>
        <StatusCard status="fit" headingLevel={1} title="Here are the options worth exploring.">
          <p>
            Based on your answers, {count} may fit. Nothing is approved until a lender decides, and they may run their
            own checks.
          </p>
          {record.result?.note ? <p>{record.result.note}</p> : null}
        </StatusCard>

        <section className={styles.routes} aria-labelledby="routes-title">
          <h2 id="routes-title" className="type-h2">
            Routes that may fit
          </h2>
          <p className={styles.muted}>
            In no particular order. We suggest kinds of loan; the lender you’re introduced to sets the offer.
          </p>
          {routes.map((route, i) => (
            <div key={route.id} ref={i === 0 ? firstRoute : undefined}>
              <RouteCard
                title={route.title}
                reasons={route.reasons}
                facts={route.facts}
                factsAsOf={FACTS_AS_OF}
                action={
                  <ButtonLink
                    href="/results/book"
                    variant={i === 0 ? "primary" : "secondary"}
                    iconEnd="arrow-right"
                    onClick={() =>
                      track("call_cta_selected", { result_status: "result_ready", cta_location: "route-card" })
                    }
                  >
                    Discuss this option
                  </ButtonLink>
                }
                details={<p>{route.summary}</p>}
                smallPrint={route.smallPrint}
                onDetailsToggle={(open) =>
                  open && track("result_card_opened", { route_id_safe: route.id, position: i + 1 })
                }
              />
            </div>
          ))}
        </section>

        <AnswersSent record={record} />
      </div>

      <div ref={side} className={styles.resultSide}>
        {booked ? (
          <BookedSummary start={booked.start} />
        ) : declined ? (
          <div className={styles.sideCard}>
            <p className={styles.sideTitle}>No call needed</p>
            <p>Your results stay here. If you change your mind, you can still talk to us.</p>
            <ButtonLink href="/results/book" variant="secondary" size="compact" iconEnd="arrow-right">
              Choose a time
            </ButtonLink>
          </div>
        ) : (
          <AdvisorPanel
            who={callDetails.who}
            title="Want to walk through your options?"
            body="In a short call, we’ll review your needs and answer your questions. There’s no obligation."
            duration={callDetails.duration}
            format={callDetails.format}
            agenda={callDetails.agenda}
            action={
              <ButtonLink
                href="/results/book"
                variant="accent"
                iconEnd="arrow-right"
                onClick={() => track("call_cta_selected", { result_status: "result_ready", cta_location: "panel" })}
              >
                Choose a time
              </ButtonLink>
            }
            decline={
              <Button
                variant="tertiary"
                onClick={() => {
                  setDeclined(true);
                  track("call_declined", { result_status: "result_ready" });
                }}
              >
                No thanks, keep my results
              </Button>
            }
          />
        )}
      </div>

      {showBar ? (
        <div className={styles.callBar}>
          <ButtonLink
            href="/results/book"
            fullWidth
            iconEnd="arrow-right"
            onClick={() => track("call_cta_selected", { result_status: "result_ready", cta_location: "sticky" })}
          >
            Choose a time to talk
          </ButtonLink>
        </div>
      ) : null}
    </div>
  );
}

/**
 * Phones only: a call button that sticks to the bottom once the first route
 * has been read, and steps aside when the call panel itself is on screen
 * (brief R1: "sticky only after content viewed", never covering content).
 */
function useStickyCall(first: RefObject<HTMLElement | null>, panel: RefObject<HTMLElement | null>, allowed: boolean) {
  const [seen, setSeen] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(max-width: 1023.98px)");
    const update = () => setNarrow(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  // Read: the person has scrolled and the whole first route has been on screen.
  useEffect(() => {
    if (seen) return;
    const onScroll = () => {
      const box = first.current?.getBoundingClientRect();
      if (box && window.scrollY > 0 && box.bottom <= window.innerHeight) setSeen(true);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [first, seen]);

  useEffect(() => {
    if (!panel.current) return;
    const observer = new IntersectionObserver(([entry]) => setPanelVisible(entry.isIntersecting));
    observer.observe(panel.current);
    return () => observer.disconnect();
  }, [panel]);

  return allowed && narrow && seen && !panelVisible;
}

function BookedSummary({ start }: { start: string }) {
  return (
    <div className={styles.sideCard}>
      <p className={styles.sideTitle}>
        <Icon name="check-circle" size={20} />
        Your call is booked
      </p>
      <p>
        {formatDay(start, SINGAPORE)}, {formatTime(start, SINGAPORE)} Singapore time
      </p>
      <ButtonLink href="/results/booked" variant="secondary" size="compact" iconEnd="arrow-right">
        See call details
      </ButtonLink>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* R2: a person needs to look                                                 */
/* -------------------------------------------------------------------------- */

function Review({ record }: { record: ServerRecord }) {
  const copy = reasonCopy[record.result?.reason ?? ""] ?? reasonCopy["more-detail-needed"];
  const [later, setLater] = useState(false);
  const booked = record.booking?.status === "confirmed" ? record.booking : null;
  return (
    <div className={styles.narrow}>
      <StatusCard
        status="review"
        headingLevel={1}
        title="We need one more detail to recommend the best next step."
        actions={
          booked ? (
            <ButtonLink href="/results/booked" iconEnd="arrow-right">
              See your booked call
            </ButtonLink>
          ) : (
            <>
              <ButtonLink
                href="/results/book"
                iconEnd="arrow-right"
                onClick={() => track("call_cta_selected", { result_status: "human_review", cta_location: "review" })}
              >
                Talk it through with our team
              </ButtonLink>
              <Button variant="tertiary" onClick={() => setLater(true)}>
                Continue later
              </Button>
            </>
          )
        }
      >
        <dl className={styles.knownList}>
          <div>
            <dt>What we know</dt>
            <dd>{copy.known}</dd>
          </div>
          {copy.missing ? (
            <div>
              <dt>What’s missing</dt>
              <dd>{copy.missing}</dd>
            </div>
          ) : null}
          <div>
            <dt>Why a call helps</dt>
            <dd>
              {callDetails.who} can ask the right follow-up questions and suggest a route in one short call (
              {callDetails.duration.toLowerCase()}). There’s no obligation.
            </dd>
          </div>
        </dl>
      </StatusCard>
      <div role="status" className={styles.live}>
        {later ? (
          <Notice tone="info" title="Your result is saved">
            It stays available for {business.retentionDays} days. Open your link again whenever you’re ready, or ask for
            a new one.
          </Notice>
        ) : null}
      </div>
      <AnswersSent record={record} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* R3: no match                                                               */
/* -------------------------------------------------------------------------- */

const otherHelp = [help.moneySense, help.creditCounselling, help.creditBureau];

function NoMatch({ record }: { record: ServerRecord }) {
  const router = useRouter();
  const copy = reasonCopy[record.result?.reason ?? ""] ?? reasonCopy["amount-out-of-range"];
  const [notify, setNotify] = useState(Boolean(record.notifyWhenAvailable));
  const [saved, setSaved] = useState(false);
  const channelWord = record.channel === "whatsapp" ? "on WhatsApp" : "by email";

  // Correcting answers starts a new check with everything filled in (brief R3).
  const revise = () => {
    track("revise_answers", { result_status: "no_match" });
    draftStore.start({ answers: record.answers, source: "revise" });
    draftStore.update((d) => ({ ...d, status: "review", contact: record.contact }));
    router.push("/assessment/review");
  };

  return (
    <div className={styles.narrow}>
      <StatusCard
        status="no-match"
        headingLevel={1}
        title="We don’t have a suitable option right now."
        actions={
          <>
            <Button variant="secondary" iconStart="edit" onClick={revise}>
              Check and change my answers
            </Button>
            <a href="#other-help" className={styles.textLink}>
              See other ways to get help
            </a>
          </>
        }
      >
        <p>{copy.known}</p>
        <p>If something was entered wrongly, you can change it and we’ll check again.</p>
      </StatusCard>

      <section id="other-help" className={styles.section} aria-labelledby="other-help-title">
        <h2 id="other-help-title" className="type-h3">
          Other ways to get help
        </h2>
        <ul className={styles.resources}>
          {otherHelp.map((item) => (
            <li key={item.name}>
              <a
                href={item.href}
                rel="noopener"
                onClick={() => track("alt_help_clicked", { resource: item.name.toLowerCase().replace(/\s+/g, "-") })}
              >
                {item.name}
                <Icon name="external" size={20} />
                <span className="visually-hidden"> (external site)</span>
              </a>
              <span className={styles.muted}>{item.text}</span>
            </li>
          ))}
          <li>
            <Link href="/contact">Contact the DFX team</Link>
            <span className={styles.muted}>If you think this result is wrong, tell us why.</span>
          </li>
        </ul>
      </section>

      <section className={styles.section} aria-labelledby="notify-title">
        <h2 id="notify-title" className="type-h3">
          If things change
        </h2>
        <Checkbox
          id="notify"
          name="notify"
          label={`Tell me ${channelWord} if a suitable option becomes available`}
          hint="A separate permission. We’ll only contact you about this, and you can stop at any time."
          checked={notify}
          onChange={(e) => {
            setNotify(e.target.checked);
            setSaved(false);
          }}
        />
        <div>
          <Button
            variant="secondary"
            size="compact"
            onClick={() => {
              api.setNotify(record.id, notify);
              track("notify_opt_in", { opted_in: notify });
              setSaved(true);
            }}
          >
            Save my choice
          </Button>
        </div>
        <p role="status" className={styles.live}>
          {saved
            ? notify
              ? "Saved. We’ll only contact you if a suitable option comes up."
              : "Saved. We won’t contact you about this."
            : ""}
        </p>
      </section>

      <AnswersSent record={record} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Shared                                                                     */
/* -------------------------------------------------------------------------- */

function AnswersSent({ record }: { record: ServerRecord }) {
  const groups = reviewGroups(record.answers).map((group) => ({
    id: `sent-${group.step}`,
    title: group.title,
    rows: group.rows.map((row) => ({ label: row.label, value: row.value })),
  }));
  return (
    <details className={styles.answers}>
      <summary>
        Answers you sent
        <Icon name="chevron-down" size={20} />
      </summary>
      <div className={styles.answersBody}>
        <ReviewSummary groups={groups} />
        <p className={styles.muted}>
          Reference {reference(record.id)}. To change your answers,{" "}
          <Link href="/assessment">start a new assessment</Link>.
        </p>
      </div>
    </details>
  );
}

function ResultsPrototype({ record }: { record: ServerRecord }) {
  return (
    <div className={styles.narrow}>
      <PrototypePanel title="Try another result">
        <SettingChoice
          setting="outcome"
          label="The check returns"
          options={[
            { value: "auto", label: "From the answers" },
            { value: "fit", label: "Routes found" },
            { value: "review", label: "A person needs to look" },
            { value: "no-match", label: "No match" },
            { value: "error", label: "An error, then success" },
          ]}
        />
        <SettingChoice
          setting="speed"
          label="Checking takes"
          options={[
            { value: "normal", label: "A few seconds" },
            { value: "fast", label: "No time" },
          ]}
        />
        <PrototypeActions>
          <Button variant="secondary" size="compact" iconStart="refresh" onClick={() => api.rerun(record.id)}>
            Check again with these settings
          </Button>
        </PrototypeActions>
      </PrototypePanel>
    </div>
  );
}

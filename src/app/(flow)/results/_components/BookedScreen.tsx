"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { Dialog } from "@/components/overlay/Dialog";
import { business } from "@/config/business";
import { track } from "@/lib/assessment/analytics.ts";
import { formatSgPhone } from "@/lib/format.ts";
import { calendarFile } from "@/lib/ics.ts";
import { api, reference } from "@/lib/service/api.ts";
import { CALL_MINUTES } from "@/lib/service/slots.ts";
import { SINGAPORE, formatDay, formatTime, timeZoneLabel } from "@/lib/time.ts";
import { useHeadingFocus } from "@/lib/useHeadingFocus";
import { NoSession, NotFound, callDetails, useVerifiedRecord } from "./ResultsScreen";
import styles from "./results.module.css";

const noSubscription = () => () => {};
const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

const longDay = (iso: string, timeZone: string) =>
  new Intl.DateTimeFormat("en-SG", { timeZone, weekday: "long", day: "numeric", month: "long" }).format(new Date(iso));

/**
 * C2 (brief §10): shown only after the scheduler confirmed. Date, time and
 * zone, how the call happens, who it's with, what to prepare, a calendar
 * file, and ways to change or cancel.
 */
export function BookedScreen() {
  const { session, record } = useVerifiedRecord();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const keep = useRef<HTMLButtonElement>(null);
  const device = useSyncExternalStore(noSubscription, deviceZone, () => SINGAPORE);
  const [confirming, setConfirming] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const booking = record?.booking;

  useEffect(() => {
    if (record && !booking) router.replace("/results");
  }, [record, booking, router]);

  useHeadingFocus(container, Boolean(booking), booking?.status);

  if (session === undefined || (session && record === undefined))
    return <div className={styles.pending} aria-busy="true" />;
  if (!session) return <NoSession />;
  if (!record) return <NotFound />;
  if (!booking) return <div className={styles.pending} aria-busy="true" />;

  const cancel = async () => {
    setCancelling(true);
    await api.cancelBooking(record.id);
    track("booking_cancelled", { booking_source: "results" });
    setCancelling(false);
    setConfirming(false);
  };

  const addToCalendar = () => {
    const file = calendarFile({
      uid: `${booking.id}@dfx`,
      start: booking.start,
      minutes: CALL_MINUTES,
      title: "Call with DFX",
      description: `Your call with ${callDetails.whoInSentence} about your loan options. Reference ${reference(record.id)}.`,
    });
    const url = URL.createObjectURL(new Blob([file], { type: "text/calendar" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dfx-call.ics";
    link.click();
    URL.revokeObjectURL(url);
    track("calendar_added", { booking_source: "results" });
  };

  if (booking.status === "cancelled") {
    return (
      <div ref={container} className="container">
        <div className={styles.narrow}>
          <div className={styles.confirmCard}>
            <h1 className="type-h1" tabIndex={-1}>
              Your call is cancelled.
            </h1>
            <p className="type-body-l">Your results are still here, and you can book another time whenever you like.</p>
            <div className={styles.actionsRow}>
              <ButtonLink href="/results/book" iconEnd="arrow-right">
                Choose another time
              </ButtonLink>
              <ButtonLink href="/results" variant="tertiary">
                Back to my results
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sameZone = device === SINGAPORE;
  const how =
    booking.format === "phone"
      ? `We’ll call +65 ${formatSgPhone(booking.phone ?? record.contact.mobile ?? "")}.`
      : `We’ll send a ${business.call.videoTool} link ${record.channel === "whatsapp" ? "on WhatsApp" : `to ${record.contact.email}`} before the call.`;

  return (
    <div ref={container} className="container">
      <div className={styles.narrow}>
        <div className={styles.confirmCard}>
          <p className={styles.confirmed}>
            <Icon name="check-circle" size={20} />
            Confirmed
          </p>
          <h1 className="type-h1" tabIndex={-1}>
            Your call is booked.
          </h1>
          <p className="type-body-l">You’ll speak with {callDetails.whoInSentence}. Here’s what to expect.</p>

          <dl className={styles.details}>
            <div>
              <dt>When</dt>
              <dd>
                <strong>
                  {longDay(booking.start, SINGAPORE)}, {formatTime(booking.start, SINGAPORE)}
                </strong>
                <span className={styles.muted}>{timeZoneLabel(SINGAPORE, new Date(booking.start))}</span>
                {!sameZone ? (
                  <span className={styles.muted}>
                    Your time: {formatDay(booking.start, device)}, {formatTime(booking.start, device)} ·{" "}
                    {timeZoneLabel(device, new Date(booking.start))}
                  </span>
                ) : null}
              </dd>
            </div>
            <div>
              <dt>How</dt>
              <dd>{how}</dd>
            </div>
            <div>
              <dt>Who</dt>
              <dd>{callDetails.who}</dd>
            </div>
            <div>
              <dt>Length</dt>
              <dd>{callDetails.duration}</dd>
            </div>
            <div>
              <dt>Reference</dt>
              <dd>{reference(record.id)}</dd>
            </div>
          </dl>

          <div className={styles.prepare}>
            <h2 className="type-h3">What to have ready</h2>
            <ul>
              <li>Rough figures for any loans or cards you’re repaying now</li>
              <li>Any questions about the routes on your results page</li>
              <li>Your reference, {reference(record.id)}</li>
            </ul>
          </div>

          <p className={styles.muted}>
            <Icon name="mail" size={20} />
            We’ve also sent these details, with a calendar invite,{" "}
            {record.channel === "whatsapp" ? "on WhatsApp" : `to ${record.contact.email}`}. We’ll remind you the day
            before.
          </p>

          <div className={styles.actionsRow}>
            <Button iconStart="calendar" onClick={addToCalendar}>
              Add to my calendar
            </Button>
            <ButtonLink href="/results/book" variant="secondary">
              Change time
            </ButtonLink>
            <Button variant="tertiary" onClick={() => setConfirming(true)}>
              Cancel the call
            </Button>
          </div>
          <ButtonLink href="/results" variant="tertiary" iconStart="arrow-left">
            Back to my results
          </ButtonLink>
        </div>
      </div>

      <Dialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title="Cancel your call?"
        description={`${longDay(booking.start, SINGAPORE)}, ${formatTime(booking.start, SINGAPORE)} Singapore time. Your results stay available.`}
        size="small"
        initialFocus={keep}
        footer={
          <>
            <Button ref={keep} variant="secondary" onClick={() => setConfirming(false)}>
              Keep my call
            </Button>
            <Button variant="destructive" busy={cancelling} onClick={cancel}>
              Cancel the call
            </Button>
          </>
        }
      />
    </div>
  );
}

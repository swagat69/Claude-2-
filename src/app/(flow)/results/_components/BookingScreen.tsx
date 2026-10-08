"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useSyncExternalStore, type FormEvent } from "react";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { Button } from "@/components/button/Button";
import { Notice } from "@/components/feedback/Notice";
import { ChoiceCards } from "@/components/form/Choices";
import { ErrorSummary, type SummaryError } from "@/components/form/ErrorSummary";
import { PhoneField } from "@/components/form/SpecialFields";
import { Icon } from "@/components/icon/Icon";
import { BackLink } from "@/components/nav/SiteHeader";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { track } from "@/lib/assessment/analytics.ts";
import { formatSgPhone, validateSgPhone } from "@/lib/format.ts";
import { api, ServiceError, type CallFormat } from "@/lib/service/api.ts";
import { SINGAPORE, formatDay, formatTime, localDateKey } from "@/lib/time.ts";
import { useHeadingFocus } from "@/lib/useHeadingFocus";
import { PrototypePanel, SettingChoice } from "../../_prototype/PrototypePanel";
import { NoSession, NotFound, callDetails, useVerifiedRecord } from "./ResultsScreen";
import styles from "./results.module.css";

const noSubscription = () => () => {};
const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

type Field = "format" | "phone" | "slot";
const fieldIds: Record<Field, string> = { format: "booking-format", phone: "booking-phone", slot: "booking-slot" };

/**
 * C1 (brief §10): an honest invitation with the agenda and length up front,
 * Singapore time always labelled, and nothing booked until the scheduler
 * confirms the time is still free.
 */
export function BookingScreen() {
  const { session, record } = useVerifiedRecord();
  const router = useRouter();
  const container = useRef<HTMLDivElement>(null);
  const device = useSyncExternalStore(noSubscription, deviceZone, () => SINGAPORE);
  const [format, setFormat] = useState<CallFormat | "">("");
  const [phone, setPhone] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [summary, setSummary] = useState<SummaryError[]>([]);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);

  const kind = record?.result?.kind;
  const allowed = kind === "fit" || kind === "review";
  const existing = record?.booking?.status === "confirmed" ? record.booking : null;
  const ready = Boolean(record && allowed);

  // No booking route for "no match" (brief R3: no unrelated sales funnel) or before a result.
  useEffect(() => {
    if (record && !allowed) router.replace("/results");
  }, [record, allowed, router]);

  useEffect(() => {
    if (!record || !allowed) return;
    api.startBooking(record.id);
    track("booking_opened", { booking_source: "results", rescheduling: Boolean(existing) });
    // Once per visit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.id, allowed]);

  useHeadingFocus(container, ready);

  if (session === undefined || (session && record === undefined))
    return <div className={styles.pending} aria-busy="true" />;
  if (!session) return <NoSession />;
  if (!record) return <NotFound />;
  if (!allowed) return <div className={styles.pending} aria-busy="true" />;

  const mobile = phone ?? record.contact.mobile ?? "";
  const slots = api.slots();

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    const found: Partial<Record<Field, string>> = {};
    if (!format) found.format = "Choose how you’d like to talk";
    if (format === "phone") {
      const message = validateSgPhone(mobile);
      if (message) found.phone = message;
    }
    if (!slot) found.slot = "Choose a time for your call";
    setErrors(found);
    setSummary(
      Object.entries(found).map(([field, message]) => ({ fieldId: fieldIds[field as Field], message: message! })),
    );
    setAttempt((n) => n + 1);
    if (Object.keys(found).length || !format || !slot) return;

    setBusy(true);
    try {
      await api.book(record.id, slot, format, format === "phone" ? mobile : undefined);
      track("booking_confirmed", {
        booking_source: "results",
        timezone_bucket: device === SINGAPORE ? "sg" : "other",
        format,
      });
      router.push("/results/booked");
    } catch (error) {
      setBusy(false);
      if (error instanceof ServiceError && error.code === "taken") {
        track("booking_failed", { reason_code: "taken" });
        setSlot(null);
        const message =
          "That time has just been taken by someone else. Choose another time; your other choices are kept.";
        setErrors({ slot: message });
        setSummary([{ fieldId: fieldIds.slot, message }]);
        setAttempt((n) => n + 1);
      }
    }
  };

  const contactWord = record.channel === "whatsapp" ? "on WhatsApp" : "by email";

  return (
    <div ref={container} className="container">
      <div className={styles.bookingGrid}>
        <div className={styles.bookingMain}>
          <BackLink href="/results">Back to your results</BackLink>
          <header className={styles.pageHead}>
            <h1 className="type-h1" tabIndex={-1}>
              Choose a time to talk
            </h1>
            <p className={`type-body-l ${styles.muted}`}>
              In a short call, we’ll review your needs and answer your questions. There’s no obligation.{" "}
              <Placeholder note="Confirm the call is free and who it is with" />
            </p>
          </header>

          {existing ? (
            <Notice tone="info" title="You already have a call booked">
              {formatDay(existing.start, SINGAPORE)}, {formatTime(existing.start, SINGAPORE)} Singapore time. Choose a
              new time below; your current booking stays until the new one is confirmed.
            </Notice>
          ) : null}

          <form className={styles.bookingForm} noValidate onSubmit={submit}>
            <ErrorSummary errors={summary} attempt={attempt} />

            <ChoiceCards
              id={fieldIds.format}
              name="format"
              legend="How would you like to talk?"
              legendStyle="question"
              columns={2}
              value={format}
              onValueChange={(value) => setFormat(value as CallFormat)}
              error={errors.format}
              options={[
                {
                  value: "phone",
                  label: "Phone call",
                  description: record.contact.mobile
                    ? `We’ll call +65 ${formatSgPhone(record.contact.mobile)}.`
                    : "We’ll call your mobile.",
                  icon: "phone",
                },
                {
                  value: "video",
                  label: "Video call",
                  description: `We’ll send a video link ${contactWord} before the call.`,
                  icon: "user",
                },
              ]}
            />

            {format === "phone" ? (
              <PhoneField
                id={fieldIds.phone}
                name="phone"
                label="Mobile number for the call"
                value={mobile}
                onChange={(e) => setPhone(e.target.value)}
                onBlur={() =>
                  mobile.trim() && setErrors((e) => ({ ...e, phone: validateSgPhone(mobile) ?? undefined }))
                }
                error={errors.phone}
              />
            ) : null}

            <section className={styles.when} aria-labelledby="when-title">
              <h2 id="when-title" className="type-h3">
                When?
              </h2>
              <div id={fieldIds.slot} tabIndex={-1} className={styles.slotTarget}>
                <SlotPicker
                  slots={slots}
                  value={slot}
                  onChange={(start) => {
                    setSlot(start);
                    const first = slots.find((s) => s.available)?.start;
                    const offset = first
                      ? Math.round(
                          (Date.parse(localDateKey(start, SINGAPORE)) - Date.parse(localDateKey(first, SINGAPORE))) /
                            86_400_000,
                        )
                      : 0;
                    track("slot_selected", { day_offset: offset });
                  }}
                  error={errors.slot}
                />
              </div>
            </section>

            <p className={styles.muted}>
              <Icon name="info" size={20} />
              Choosing a time doesn’t book it. We check it’s still free when you confirm.
            </p>
            <div className={styles.actionsRow}>
              <Button type="submit" busy={busy} iconEnd="arrow-right" className={styles.primary}>
                Confirm this time
              </Button>
              <Link href="/results" className={styles.textLink}>
                No thanks, back to my results
              </Link>
            </div>
          </form>
        </div>

        <aside className={styles.bookingRail} aria-label="About the call">
          <div className={styles.sideCard}>
            <p className={styles.sideTitle}>About the call</p>
            <ul className={styles.callFacts}>
              <li>
                <Icon name="user" size={20} />
                {callDetails.who}
              </li>
              <li>
                <Icon name="clock" size={20} />
                {callDetails.duration}
              </li>
              <li>
                <Icon name="phone" size={20} />
                {callDetails.format}
              </li>
            </ul>
            <p className={styles.sideLabel}>In the call</p>
            <ol className={styles.agenda}>
              {callDetails.agenda.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          </div>
        </aside>
      </div>

      <div className={styles.narrow}>
        <PrototypePanel title="Try a booking conflict">
          <SettingChoice
            setting="booking"
            label="When you confirm"
            options={[
              { value: "ok", label: "The time is still free" },
              { value: "conflict", label: "Someone has just taken it" },
            ]}
          />
        </PrototypePanel>
      </div>
    </div>
  );
}

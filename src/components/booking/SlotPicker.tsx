"use client";

import { useId, useMemo, useState, useSyncExternalStore } from "react";
import { Icon } from "@/components/icon/Icon";
import { SINGAPORE, formatTime, groupSlotsByDay, timeZoneLabel, type Slot } from "@/lib/time";
import styles from "./SlotPicker.module.css";

const noSubscription = () => () => {};
const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

interface SlotPickerProps {
  slots: Slot[];
  /** Form field name for the chosen slot (its ISO start). */
  name?: string;
  value?: string | null;
  onChange?: (start: string) => void;
  error?: string | null;
}

/**
 * Day and time choice for a call (brief §10 C1, family 13). Shows Singapore
 * time with the zone always labelled, and offers the device's own zone when
 * it differs. Nothing is preselected, and choosing a time is not booking it:
 * the booking only exists once the scheduler confirms (brief C2).
 */
export function SlotPicker({ slots, name = "slot", value, onChange, error }: SlotPickerProps) {
  const id = useId();
  const device = useSyncExternalStore(noSubscription, deviceZone, () => SINGAPORE);
  const [timeZone, setTimeZone] = useState(SINGAPORE);
  const [internal, setInternal] = useState<string | null>(null);
  const selected = value !== undefined ? value : internal;

  const days = useMemo(() => groupSlotsByDay(slots, timeZone), [slots, timeZone]);
  const [chosenDay, setChosenDay] = useState<string | null>(null);
  const dayKey =
    days.find((d) => d.key === chosenDay)?.key ??
    days.find((d) => d.slots.some((s) => s.start === selected))?.key ??
    days.find((d) => d.slots.some((s) => s.available))?.key ??
    days[0]?.key;
  const day = days.find((d) => d.key === dayKey);

  const reference = new Date(selected ?? slots[0]?.start ?? "2026-01-01T00:00:00Z");
  const zoneLabel = timeZoneLabel(timeZone, reference);
  const selectedSlot = slots.find((s) => s.start === selected);

  const choose = (start: string) => {
    setInternal(start);
    onChange?.(start);
  };

  return (
    <div className={styles.picker} data-invalid={error ? true : undefined}>
      <div className={styles.zone}>
        <Icon name="globe" size={20} />
        <p>
          Times in <strong>{zoneLabel}</strong>
        </p>
        {device !== SINGAPORE ? (
          <label className={styles.zoneSelect}>
            <span className="visually-hidden">Show times in</span>
            <select
              value={timeZone}
              onChange={(e) => {
                setTimeZone(e.target.value);
                setChosenDay(null);
              }}
            >
              <option value={SINGAPORE}>Singapore time</option>
              <option value={device}>My time zone ({device.replace(/_/g, " ")})</option>
            </select>
          </label>
        ) : null}
      </div>

      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          <Icon name="alert-circle" size={20} />
          <span>
            <span className="visually-hidden">Error: </span>
            {error}
          </span>
        </p>
      ) : null}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Day</legend>
        <div className={styles.days}>
          {days.map((d) => {
            const open = d.slots.filter((s) => s.available).length;
            return (
              <label key={d.key} className={styles.day} data-full={open === 0 || undefined}>
                <input
                  type="radio"
                  name={`${name}-day`}
                  value={d.key}
                  checked={d.key === dayKey}
                  onChange={() => setChosenDay(d.key)}
                  className={styles.native}
                />
                <span className={styles.dayLabel}>
                  {/* "Mon, 12 Oct" → weekday and date on their own lines. */}
                  <span>{d.label.split(", ")[0]},</span> <span>{d.label.split(", ")[1]}</span>
                </span>
                <span className={styles.dayCount}>{open === 0 ? "Full" : `${open} ${open === 1 ? "time" : "times"}`}</span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {day ? (
        <fieldset className={styles.group} aria-describedby={error ? `${id}-error` : undefined}>
          <legend className={styles.legend}>Time on {day.label}</legend>
          <div className={styles.times}>
            {day.slots.map((slot) => (
              <label key={slot.start} className={styles.time} data-unavailable={!slot.available || undefined}>
                <input
                  type="radio"
                  name={name}
                  value={slot.start}
                  disabled={!slot.available}
                  checked={selected === slot.start}
                  onChange={() => choose(slot.start)}
                  className={styles.native}
                />
                <span className={styles.timeLabel}>{formatTime(slot.start, timeZone)}</span>
                {slot.available ? (
                  <Icon name="check" size={20} className={styles.timeCheck} />
                ) : (
                  <span className={styles.unavailable}>Unavailable</span>
                )}
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p className={styles.summary} role="status">
        {selectedSlot
          ? `You’ve chosen ${days.find((d) => d.slots.includes(selectedSlot))?.label ?? ""} at ${formatTime(selectedSlot.start, timeZone)}, ${zoneLabel}. It isn’t booked until you confirm.`
          : ""}
      </p>
    </div>
  );
}

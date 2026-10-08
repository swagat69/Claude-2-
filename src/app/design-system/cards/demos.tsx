"use client";

import { useState } from "react";
import { SlotPicker } from "@/components/booking/SlotPicker";
import { Button } from "@/components/button/Button";
import specimen from "../_doc/specimen.module.css";
import { sampleSlots } from "./sample-slots";

/** Choosing is not booking: the real flow confirms with the scheduler first (brief C2). */
export function BookingDemo() {
  const [slot, setSlot] = useState<string | null>(null);
  const [attempted, setAttempted] = useState(false);
  const [requested, setRequested] = useState(false);
  const error = attempted && !slot ? "Choose a time for your call" : null;

  return (
    <div className={specimen.stack}>
      <SlotPicker
        slots={sampleSlots}
        value={slot}
        onChange={(start) => {
          setSlot(start);
          setRequested(false);
        }}
        error={error}
      />
      <div className={specimen.demoRow}>
        <Button
          iconEnd="arrow-right"
          onClick={() => {
            setAttempted(true);
            setRequested(Boolean(slot));
          }}
        >
          Confirm this time
        </Button>
      </div>
      <p role="status" className={specimen.demoStatus}>
        {requested ? "Demo: the real flow now checks the slot with the scheduler, and only then says it’s booked." : ""}
      </p>
    </div>
  );
}

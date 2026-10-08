/**
 * The assessment lifecycle (brief §20): a small, deterministic state machine
 * so "submitted", "messaged", "result ready" and "call booked" never get
 * mixed up. Only the transitions listed here are allowed.
 */

export const STATUSES = [
  "submitted",
  "awaiting_contact",
  "verified",
  "processing",
  "result_ready",
  "human_review",
  "no_match",
  "failed",
  "booking_started",
  "booking_confirmed",
  "expired",
  "closed",
] as const;

export type Status = (typeof STATUSES)[number];

/** Brief §20 "Next allowed transitions", for the states the website drives. */
const allowed: Record<Status, readonly Status[]> = {
  submitted: ["awaiting_contact", "processing", "closed"],
  awaiting_contact: ["awaiting_contact", "verified", "expired"],
  verified: ["processing", "result_ready", "human_review", "no_match"],
  processing: ["result_ready", "human_review", "no_match", "failed"],
  failed: ["processing", "expired"],
  result_ready: ["booking_started", "closed"],
  human_review: ["booking_started", "result_ready", "closed"],
  no_match: ["closed"],
  booking_started: ["booking_confirmed", "result_ready", "human_review"],
  booking_confirmed: ["booking_started", "result_ready", "human_review"],
  expired: [],
  closed: [],
};

export function canTransition(from: Status, to: Status): boolean {
  return allowed[from].includes(to);
}

export class TransitionError extends Error {
  readonly from: Status;
  readonly to: Status;
  constructor(from: Status, to: Status) {
    super(`Cannot move an assessment from ${from} to ${to}`);
    this.from = from;
    this.to = to;
  }
}

export function transition(from: Status, to: Status): Status {
  if (!canTransition(from, to)) throw new TransitionError(from, to);
  return to;
}

/** States that show a result page (with or without a call invitation). */
export const RESULT_STATUSES: readonly Status[] = [
  "result_ready",
  "human_review",
  "no_match",
  "booking_started",
  "booking_confirmed",
];

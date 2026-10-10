"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon/Icon";
import { draftStore } from "@/lib/assessment/draft.ts";
import { track } from "@/lib/assessment/analytics.ts";
import { goalOptions } from "@/lib/assessment/questions.ts";
import styles from "./home.module.css";

export function HeroGoals() {
  const router = useRouter();
  return <ul className={styles.goalList} aria-label="Loan purposes">{goalOptions.map(goal => <li key={goal.value}>
    <Link href={`/assessment/goal?goal=${goal.value}&from=hero`} aria-label={goal.label} onClick={event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      // Preserve saved work: the existing start screen offers resume or an explicit restart.
      if (draftStore.getSnapshot()) { router.push(`/assessment?goal=${goal.value}&from=hero`); return; }
      draftStore.start({ answers: { goal: goal.value }, source: "hero" });
      track("assessment_started", { source: "hero", goal_preset: goal.value });
      router.push(`/assessment/goal?goal=${goal.value}&from=hero`);
    }}><span><strong>{goal.label}</strong><span className={styles.goalDescription}>{goal.description}</span></span><Icon name="arrow-right" size={20} /></Link>
  </li>)}</ul>;
}

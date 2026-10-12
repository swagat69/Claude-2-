import type { Metadata } from "next";
import { Suspense } from "react";
import { QuestionStep } from "../_components/QuestionStep";

export const metadata: Metadata = { title: "Your goals · Step 1 of 4" };

async function Content({ searchParams }: PageProps<"/assessment/goal">) {
  const { goal } = await searchParams;
  return <QuestionStep step="goal" initialGoal={typeof goal === "string" ? goal : undefined} />;
}

export default function Page(props: PageProps<"/assessment/goal">) {
  return <Suspense fallback={<div className="container" aria-busy="true">Loading…</div>}><Content {...props} /></Suspense>;
}

import type { Metadata } from "next";
import { QuestionStep } from "../_components/QuestionStep";

export const metadata: Metadata = { title: "Your goals · Step 1 of 4" };

export default function Page() {
  return <QuestionStep step="goal" />;
}

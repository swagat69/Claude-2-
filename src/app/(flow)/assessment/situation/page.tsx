import type { Metadata } from "next";
import { QuestionStep } from "../_components/QuestionStep";

export const metadata: Metadata = { title: "Your situation · Step 2 of 4" };

export default function Page() {
  return <QuestionStep step="situation" />;
}

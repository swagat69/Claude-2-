import type { Metadata } from "next";
import { ReviewStep } from "../_components/ReviewStep";

export const metadata: Metadata = { title: "Check your answers · Step 4 of 4" };

export default function Page() {
  return <ReviewStep />;
}

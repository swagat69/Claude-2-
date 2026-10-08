import type { Metadata } from "next";
import { PlaceholderPage } from "../_shared/PlaceholderPage";

export const metadata: Metadata = {
  title: "Privacy notice",
  description: "How DFX uses your information.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PlaceholderPage eyebrow="Legal" title="Privacy notice" note="Approved privacy notice (PDPA), including data retention and any sharing with lenders">
      <p>How DFX collects, uses and protects your information, and how to access or delete it.</p>
    </PlaceholderPage>
  );
}

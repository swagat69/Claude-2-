import type { Metadata } from "next";
import { PlaceholderPage } from "../_shared/PlaceholderPage";

export const metadata: Metadata = {
  title: "Accessibility",
  description: "Accessibility at DFX.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PlaceholderPage eyebrow="Help" title="Accessibility" note="Approved accessibility statement and contact">
      <p>DFX is designed to meet WCAG 2.2 AA. Tell us if anything gets in your way, and how you’d like us to reply.</p>
    </PlaceholderPage>
  );
}

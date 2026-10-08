import type { Metadata } from "next";
import { PlaceholderPage } from "../_shared/PlaceholderPage";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Contact the DFX team.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <PlaceholderPage eyebrow="Help" title="Contact us" note="Real support channels, team location and service hours">
      <p>Ways to reach the DFX team, and when we’re available.</p>
    </PlaceholderPage>
  );
}

import type { Metadata } from "next";
import { GateScreen } from "../_components/OutcomeScreens";

export const metadata: Metadata = { title: "We can’t help with this right now" };

export default function Page() {
  return <GateScreen />;
}

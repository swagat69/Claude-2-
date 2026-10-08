import type { Metadata } from "next";
import { ContinueScreen } from "../_components/OutcomeScreens";

export const metadata: Metadata = { title: "Your next step" };

export default function Page() {
  return <ContinueScreen />;
}

import type { Metadata } from "next";
import { ResultsScreen } from "./_components/ResultsScreen";

export const metadata: Metadata = { title: "Your result" };

export default function Page() {
  return <ResultsScreen />;
}

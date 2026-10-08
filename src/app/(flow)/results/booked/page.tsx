import type { Metadata } from "next";
import { BookedScreen } from "../_components/BookedScreen";

export const metadata: Metadata = { title: "Your call" };

export default function Page() {
  return <BookedScreen />;
}

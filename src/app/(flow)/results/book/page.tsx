import type { Metadata } from "next";
import { BookingScreen } from "../_components/BookingScreen";

export const metadata: Metadata = { title: "Choose a time to talk" };

export default function Page() {
  return <BookingScreen />;
}

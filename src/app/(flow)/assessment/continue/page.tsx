import type { Metadata } from "next";
import { Handoff } from "../_components/Handoff";

export const metadata: Metadata = { title: "Get your result" };

export default function Page() {
  return <Handoff />;
}

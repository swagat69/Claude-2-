import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingScreen } from "../_components/BookingScreen";

export const metadata: Metadata = { title: "Choose a time to talk" };

async function Content({ searchParams }: PageProps<"/results/book">) {
  const { route } = await searchParams;
  return <BookingScreen routeId={typeof route === "string" ? route : undefined} />;
}

export default function Page(props: PageProps<"/results/book">) {
  return <Suspense fallback={<div className="container" aria-busy="true">Loading…</div>}><Content {...props} /></Suspense>;
}

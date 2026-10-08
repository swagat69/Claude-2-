import type { Metadata } from "next";
import { ButtonLink } from "@/components/button/Button";
import { EmptyState } from "@/components/feedback/EmptyState";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="container" style={{ paddingBlock: "var(--space-20)" }}>
      <EmptyState
        icon="route"
        title="We can’t find that page"
        headingLevel={1}
        actions={
          <>
            <ButtonLink href="/">Go to the homepage</ButtonLink>
            <ButtonLink href="/assessment" variant="tertiary">
              Start the assessment
            </ButtonLink>
          </>
        }
      >
        <p>The link may be old or mistyped.</p>
      </EmptyState>
    </main>
  );
}

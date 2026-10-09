import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { business } from "@/config/business";
import { InfoPage, InfoSection } from "../_shared/InfoPage";

export const metadata: Metadata = {
  title: "Terms of use",
  description: "The terms that apply when you use the DFX website, assessment and calls.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Legal"
      title="Terms of use"
      lead="The terms that apply when you use the DFX website, the assessment and our calls. They’re short, and written to be read."
      updated={`${business.policyDate} (version ${business.policyVersion})`}
      note="To be reviewed by a Singapore lawyer before launch"
    >
      <InfoSection title="What DFX is">
        <p>
          <Placeholder note="DFX’s registered company name and UEN">DFX</Placeholder> is a loan-matching service, not a
          lender. We suggest kinds of loan that may fit your answers, and, if you agree, introduce you to{" "}
          {business.lenders}. They decide on approval, rates and terms.
        </p>
        <p>
          A result is information to help you decide what to explore. It isn’t an offer, an approval or financial
          advice.
        </p>
      </InfoSection>

      <InfoSection title="Who can use it">
        <p>
          You need to be 21 or over and living in Singapore. For a business, it needs to be registered in Singapore with
          a UEN, and you need to be allowed to act for it.
        </p>
      </InfoSection>

      <InfoSection title="Your answers">
        <p>
          Answer as accurately as you can. Ranges are fine. Only give someone else’s details with their permission. If
          your situation changes, your result may no longer apply: you can start again at any time.
        </p>
      </InfoSection>

      <InfoSection title="What it costs">
        <p>
          {business.feeLine} We’ll tell you about any fee before we introduce you to a lender. Calls with us are free.
        </p>
      </InfoSection>

      <InfoSection title="Calls">
        <p>
          You can cancel or move a call at any time from the confirmation message. A call is never required to see your
          result, and you’re never obliged to apply.
        </p>
      </InfoSection>

      <InfoSection title="Using the site fairly">
        <p>
          Don’t try to break or overload the site, collect information from it automatically, or use it for anyone else
          without their permission.
        </p>
      </InfoSection>

      <InfoSection title="Our responsibility">
        <p>
          We take care to keep the information here accurate and up to date, but typical terms change and every lender
          has its own criteria. We aren’t responsible for a lender’s decision or the terms it offers. Nothing in these
          terms limits any responsibility that the law doesn’t allow us to limit.
        </p>
      </InfoSection>

      <InfoSection title="Other websites">
        <p>
          We link to independent services, such as MoneySense and Credit Counselling Singapore. We don’t control them,
          and their own terms apply.
        </p>
      </InfoSection>

      <InfoSection title="Changes and the law">
        <p>
          If we change these terms, we update the date above. They’re governed by the law of Singapore. How we use your
          information is in our <Link href="/privacy">privacy notice</Link>.
        </p>
      </InfoSection>
    </InfoPage>
  );
}

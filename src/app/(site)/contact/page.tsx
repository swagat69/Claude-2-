import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/placeholder/Placeholder";
import { business } from "@/config/business";
import { help } from "@/config/help";
import { InfoPage, InfoSection } from "../_shared/InfoPage";

export const metadata: Metadata = {
  title: "Contact us",
  description: "Reach the DFX team on WhatsApp or by email, Monday to Friday, 9am to 6pm Singapore time.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return (
    <InfoPage
      eyebrow="Help"
      title="Contact us"
      lead={`${business.support.team}, on ${business.support.channels}. We reply ${business.support.replyTime}.`}
    >
      <InfoSection title="Hours">
        <p>{business.support.hours}. Messages sent outside these hours are answered the next working day.</p>
      </InfoSection>

      <InfoSection title="WhatsApp">
        <p>
          <Placeholder note="DFX’s WhatsApp Business number, which only DFX can provide">WhatsApp number</Placeholder>
        </p>
        <p>If you’ve already started, reply in the same chat, so we can see your answers.</p>
      </InfoSection>

      <InfoSection title="Email">
        <p>
          <Placeholder note="DFX’s support email address, once the domain is chosen">Support email</Placeholder>
        </p>
        <p>If you’ve already started, reply to the email we sent, so we can see your answers.</p>
      </InfoSection>

      <InfoSection title="Your information">
        <p>
          To see, correct or delete what we hold about you, write to our Data Protection Officer:{" "}
          <Placeholder note="DFX’s Data Protection Officer email address">privacy email</Placeholder>. We reply within
          30 days. More in our <Link href="/privacy">privacy notice</Link>.
        </p>
      </InfoSection>

      <InfoSection title="Something went wrong">
        <p>
          Tell us first, and we’ll put it right where we can. A complaint about a bank or financial institution goes to
          that lender first; if it isn’t resolved, the{" "}
          <a href="https://www.fidrec.com.sg/" rel="noopener">
            Financial Industry Disputes Resolution Centre
          </a>{" "}
          can help, for free.
        </p>
      </InfoSection>

      <InfoSection title="If repayments are hard">
        <p>
          <a href={help.creditCounselling.href} rel="noopener">
            {help.creditCounselling.name}
          </a>{" "}
          offers {help.creditCounselling.text.charAt(0).toLowerCase() + help.creditCounselling.text.slice(1)}
        </p>
      </InfoSection>
    </InfoPage>
  );
}

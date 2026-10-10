import type { Metadata } from "next";
import Link from "next/link";
import { business } from "@/config/business";
import { help } from "@/config/help";
import { InfoPage, InfoSection } from "../_shared/InfoPage";
import styles from "../_shared/InfoPage.module.css";

export const metadata: Metadata = { title: "Contact us", description: "DFX support, contact information and independent repayment help.", robots: { index: false, follow: true } };
export default function Page() {
  const phone = business.whatsappNumber?.replace(/\D/g, "");
  return <InfoPage eyebrow="Help" title="Contact us" lead="Questions about your assessment, your information, or a possible loan route? Start here.">
    <InfoSection title="Contact the team"><div className={styles.contactLines}>
      {business.supportEmail ? <a href={`mailto:${business.supportEmail}`}>{business.supportEmail}</a> : <p>Email support is not available in this prototype yet.</p>}
      {phone ? <a href={`https://wa.me/${phone}`}>WhatsApp +{phone}</a> : <p>WhatsApp support is not available in this prototype yet.</p>}
    </div><p>{business.support.hours}. Planned response time: {business.support.replyTime}.</p></InfoSection>
    <InfoSection title="An existing assessment"><p>If you have an existing DFX email or WhatsApp conversation, reply there and include your assessment reference. Do not include bank passwords or card details.</p><p><Link href="/resume">Return to your result</Link></p></InfoSection>
    <InfoSection title="Your information"><p>For access, correction or deletion requests, use the privacy contact.</p>{business.privacyEmail ? <a href={`mailto:${business.privacyEmail}`}>{business.privacyEmail}</a> : <p>The privacy contact has not been published. This service is not ready for real data requests.</p>}<p><Link href="/privacy">Read the privacy notice</Link></p></InfoSection>
    <InfoSection title="Something went wrong"><p>For a DFX issue, use the support contact above when available. For an issue with a lender, contact that lender directly.</p></InfoSection>
    <InfoSection title="If repayments are hard"><p><a href={help.creditCounselling.href}>{help.creditCounselling.name}</a> provides information and support with managing debt. You do not need to complete this assessment to access it.</p></InfoSection>
  </InfoPage>;
}

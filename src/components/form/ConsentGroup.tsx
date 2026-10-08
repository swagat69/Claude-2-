import Link from "next/link";
import { useId, type ReactNode } from "react";
import { Checkbox } from "./Choices";
import styles from "./ConsentGroup.module.css";

export interface MarketingConsent {
  name: string;
  label: ReactNode;
  hint?: ReactNode;
}

interface ConsentGroupProps {
  /** Recorded with the submission so the audit trail shows exactly which wording was agreed (brief §19). */
  policyVersion: string;
  privacyHref: string;
  /** What the required processing covers, in plain words. */
  processing: ReactNode;
  /** Optional marketing permissions, one per channel. Always unchecked by default. */
  marketing?: MarketingConsent[];
  className?: string;
}

/**
 * Required processing is a notice, not a pre-ticked box; each marketing
 * permission is a separate, optional, unchecked checkbox (brief §13 family
 * 19, §17). Continuing the request never depends on marketing consent.
 */
export function ConsentGroup({ policyVersion, privacyHref, processing, marketing = [], className }: ConsentGroupProps) {
  const titleId = useId();
  return (
    <section className={[styles.consent, className].filter(Boolean).join(" ")} aria-labelledby={titleId}>
      <h2 id={titleId} className="type-h3">
        How we use your information
      </h2>
      <p className={styles.notice}>
        {processing}{" "}
        <Link href={privacyHref}>Read our privacy notice</Link>.
      </p>
      <input type="hidden" name="consent_policy_version" value={policyVersion} />
      {marketing.length ? (
        <fieldset className={styles.marketing}>
          <legend className={styles.legend}>
            Updates from DFX <span className={styles.optional}>(optional)</span>
          </legend>
          {marketing.map((item) => (
            <Checkbox key={item.name} name={item.name} value="yes" label={item.label} hint={item.hint} defaultChecked={false} />
          ))}
        </fieldset>
      ) : null}
    </section>
  );
}

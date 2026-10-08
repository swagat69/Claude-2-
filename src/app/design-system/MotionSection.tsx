import { duration, easing, motionDistance, stagger } from "@/design/tokens";
import { MotionLab } from "./MotionLab";
import styles from "./ds.module.css";

function EasingCurve({ name, value }: { name: string; value: string }) {
  const [x1, y1, x2, y2] = (value.match(/-?[\d.]+/g) ?? []).map(Number);
  const p = (x: number, y: number) => `${4 + x * 92},${96 - y * 92}`;
  return (
    <figure className={styles.curve}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <path d={`M${p(0, 0)} L${p(1, 1)}`} className={styles.curveDiagonal} />
        <path d={`M${p(0, 0)} L${p(x1, y1)} M${p(1, 1)} L${p(x2, y2)}`} className={styles.curveHandle} />
        <path d={`M${p(0, 0)} C${p(x1, y1)} ${p(x2, y2)} ${p(1, 1)}`} className={styles.curveLine} />
      </svg>
      <figcaption>
        <strong>{name}</strong>
        <code>{value}</code>
      </figcaption>
    </figure>
  );
}

export function Motion() {
  return (
    <>
      <MotionLab />

      <div className={styles.sub}>
        <h3 className="type-h2">Durations</h3>
        <p className={styles.subIntro}>
          Middle of each range in brief §14. Under reduced motion, spatial movement drops to zero and
          durations shorten to an opacity change or an instant swap.
        </p>
      </div>
      <div className={styles.motionTable} role="table" aria-label="Motion durations">
        <div role="row" className={styles.motionHead}>
          <span role="columnheader">Token</span>
          <span role="columnheader">Default</span>
          <span role="columnheader">Reduced</span>
          <span role="columnheader">Used for</span>
        </div>
        {Object.entries(duration).map(([name, token]) => (
          <div role="row" key={name} className={styles.motionRow}>
            <span role="cell">
              <code>duration-{name}</code>
            </span>
            <span role="cell">
              {token.value}ms <span className={styles.muted}>({token.range})</span>
            </span>
            <span role="cell">{token.reduced === 0 ? "Instant" : `${token.reduced}ms`}</span>
            <span role="cell" className={styles.muted}>
              {token.usage}
            </span>
          </div>
        ))}
      </div>

      <div className={styles.sub}>
        <h3 className="type-h2">Easing</h3>
      </div>
      <div className={styles.curves}>
        {Object.entries(easing).map(([name, { value }]) => (
          <EasingCurve key={name} name={name} value={value} />
        ))}
      </div>

      <div className={styles.sub}>
        <h3 className="type-h2">Distance and stagger</h3>
      </div>
      <dl className={styles.distanceList}>
        {Object.entries(motionDistance).map(([name, { value, usage }]) => (
          <div key={name}>
            <dt>
              <code>distance-{name}</code> {value}
            </dt>
            <dd className={styles.muted}>{usage}</dd>
          </div>
        ))}
        {Object.entries(stagger).map(([name, { value, usage }]) => (
          <div key={name}>
            <dt>
              <code>stagger-{name}</code> {value}ms
            </dt>
            <dd className={styles.muted}>{usage}</dd>
          </div>
        ))}
      </dl>

      <ul className={styles.motionRules}>
        <li>Animate opacity and transform only for frequent interactions.</li>
        <li>Never auto-scroll the assessment while someone is typing.</li>
        <li>No fake “matching” delay once a result exists, no count-up numbers.</li>
        <li>No looping pulse, marquee, scroll-jacking or shaking error fields.</li>
      </ul>
    </>
  );
}

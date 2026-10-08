import type { CSSProperties, ReactNode } from "react";
import { Icon, iconNames } from "@/components/icon/Icon";
import { contrastRatio } from "@/design/contrast";
import {
  briefPalette,
  category,
  contrastFailures,
  contrastMinimum,
  contrastPairs,
  derivedPalette,
  glowSpec,
  grid,
  layout,
  palette,
  radius,
  semantic,
  shadow,
  space,
  typeScale,
  type ContrastPair,
  type PaletteName,
  type TypeStep,
} from "@/design/tokens";
import styles from "./ds.module.css";

const hex = (name: PaletteName) => palette[name].value;
const ratio = (pair: ContrastPair) => contrastRatio(hex(pair.fg), hex(pair.bg));

export function Section({
  id,
  index,
  title,
  intro,
  children,
}: {
  id: string;
  index: number;
  title: string;
  intro: ReactNode;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.section} aria-labelledby={`${id}-title`}>
      <header className={styles.sectionHead}>
        <p className={`type-eyebrow ${styles.sectionNum}`}>{String(index).padStart(2, "0")}</p>
        <h2 id={`${id}-title`} className={`type-h1 ${styles.sectionTitle}`}>
          {title}
        </h2>
        <p className={`type-body-l ${styles.sectionIntro}`}>{intro}</p>
      </header>
      {children}
    </section>
  );
}

function Sub({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className={styles.sub}>
      <h3 className="type-h2">{title}</h3>
      {children ? <p className={styles.subIntro}>{children}</p> : null}
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function ArtDirection() {
  const dos = [
    "Warm paper canvas with near-black ink type in a restrained editorial weight.",
    "1px keylines define surfaces; shadows only where elevation means something.",
    "Glow lives behind non-interactive art and a few highlight cards.",
    "Ticket cuts for category chips, timeline milestones and result tabs.",
    "At most two strong hues per functional viewport; forms use one action colour.",
    "One real support photograph beats a gallery of generated people.",
  ];
  const donts = [
    "Glow or blur behind inputs, consent, legal text or results.",
    "Ticket shapes on every CTA or text field.",
    "Fake figures, scores, rates or gauges anywhere on the homepage.",
    "Neon gradients, floating trophies or infinite icon grids.",
    "Colour as the only signal for selected, error or complete.",
  ];
  return (
    <>
      <div className={styles.balance} role="img" aria-label="Visual balance: 70% quiet neutral interface, 20% soft spatial colour, 10% high-chroma accents">
        <div className={styles.balanceNeutral}>
          <span>70%</span>
        </div>
        <div className={styles.balanceGlow}>
          <span>20%</span>
        </div>
        <div className={styles.balanceAccent} />
      </div>
      <dl className={styles.balanceKey}>
        <div>
          <dt>70% quiet neutral interface</dt>
          <dd>Paper, white cards, ink type and thin rules (images 2–3).</dd>
        </div>
        <div>
          <dt>20% soft spatial colour</dt>
          <dd>Blush, green and amber blooms with very smooth falloff.</dd>
        </div>
        <div>
          <dt>10% high-chroma accents</dt>
          <dd>Ticket-tile hues from image 4, used for categories and signals.</dd>
        </div>
      </dl>
      <div className={styles.rules}>
        <div className={styles.ruleCol}>
          <h3 className="type-h3">Do</h3>
          <ul>
            {dos.map((rule) => (
              <li key={rule}>
                <span className={styles.ruleDo}>
                  <Icon name="check" size={20} />
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.ruleCol}>
          <h3 className="type-h3">Don’t</h3>
          <ul>
            {donts.map((rule) => (
              <li key={rule}>
                <span className={styles.ruleDont}>
                  <Icon name="close" size={20} />
                </span>
                {rule}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

/** Foreground shown on each brief swatch: the colour the brief says to pair it with. */
const swatchForeground: Record<keyof typeof briefPalette, PaletteName> = {
  ink: "white",
  paper: "ink",
  forest: "lime",
  lime: "ink",
  green: "ink",
  orange: "ink",
  blue: "white",
  red: "white",
  sage: "ink",
  peach: "ink",
  line: "ink",
  white: "ink",
};

export function Colour() {
  return (
    <>
      <Sub title="Brief palette">
        The twelve colours proposed in brief §11, unchanged. The “Aa” on each chip uses the text colour that
        fill allows.
      </Sub>
      <ul className={styles.swatchGrid}>
        {(Object.keys(briefPalette) as (keyof typeof briefPalette)[]).map((name) => {
          const entry = briefPalette[name];
          const fg = swatchForeground[name];
          return (
            <li key={name} className={styles.swatch}>
              <div className={styles.swatchChip} style={{ background: entry.value, color: hex(fg) }}>
                <span className={styles.swatchAa} aria-hidden="true">
                  Aa
                </span>
                <span className={styles.swatchRatio}>{contrastRatio(hex(fg), entry.value).toFixed(1)}:1</span>
              </div>
              <div className={styles.swatchBody}>
                <p className={styles.swatchName}>
                  <span className="type-h3">{name[0].toUpperCase() + name.slice(1)}</span>
                  <code>{entry.value}</code>
                </p>
                <p className={styles.swatchRole}>{entry.role}</p>
                <p className={`type-meta ${styles.muted}`}>{entry.guidance}</p>
              </div>
            </li>
          );
        })}
      </ul>

      <Sub title="Derived for states and accessibility">
        The brief leaves hover, pressed, field-border and feedback-text colours open. These fill the gaps, and
        each is checked in the contrast audit.
      </Sub>
      <ul className={styles.derivedList}>
        {(Object.keys(derivedPalette) as (keyof typeof derivedPalette)[]).map((name) => {
          const entry = derivedPalette[name];
          return (
            <li key={name} className={styles.derivedRow}>
              <span className={styles.dot} style={{ background: entry.value }} aria-hidden="true" />
              <span className={styles.derivedName}>
                <strong>{name}</strong>
                <code>{entry.value}</code>
              </span>
              <span className={styles.derivedRole}>
                {entry.role}
                <span className={`type-meta ${styles.muted}`}>{entry.guidance}</span>
              </span>
            </li>
          );
        })}
      </ul>

      <Sub title="Semantic tokens">
        Components never reference a palette colour directly. They use these role names, so a palette change
        updates every screen consistently.
      </Sub>
      <div className={styles.tokenGroups}>
        {Object.entries(semantic).map(([group, values]) => (
          <div key={group} className={styles.tokenGroup}>
            <h4 className={`type-eyebrow ${styles.muted}`}>{group}</h4>
            <ul>
              {Object.entries(values).map(([name, value]) => (
                <li key={name} className={styles.tokenRow}>
                  <span className={styles.tokenSwatch} style={{ background: `var(--color-${group}-${name})` }} aria-hidden="true" />
                  <code className={styles.tokenVar}>--color-{group}-{name}</code>
                  <span className={styles.tokenAlias}>{value}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Sub title="Category colour (ticket tiles)">
        From image 4. Each fill is locked to one foreground so tile text always passes. The notched “ticket”
        cut is reserved for categories, milestones and result tabs.
      </Sub>
      <ul className={styles.tickets}>
        {(Object.keys(category) as (keyof typeof category)[]).map((name) => {
          const { bg, fg } = category[name];
          return (
            <li
              key={name}
              className={`${styles.ticket} ${styles.notched}`}
              style={{ background: `var(--category-${name}-bg)`, color: `var(--category-${name}-fg)` } as CSSProperties}
            >
              <span className={styles.ticketName}>{name[0].toUpperCase() + name.slice(1)}</span>
              <span className={styles.ticketFoot}>
                <Icon name="route" size={32} />
                <span className={styles.ticketPill}>{contrastRatio(hex(fg), hex(bg)).toFixed(1)}:1</span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */

const kindLabel = { text: "Text", "large-text": "Large text", "non-text": "UI / border" } as const;

function ContrastRow({ pair, pass }: { pair: ContrastPair; pass: boolean }) {
  const value = ratio(pair);
  return (
    <li className={styles.contrastRow}>
      <span
        className={styles.contrastSample}
        style={
          pair.kind === "non-text"
            ? { background: hex(pair.bg), boxShadow: `inset 0 0 0 3px ${hex(pair.fg)}` }
            : { background: hex(pair.bg), color: hex(pair.fg) }
        }
        aria-hidden="true"
      >
        {pair.kind === "non-text" ? "" : "Aa"}
      </span>
      <span className={styles.contrastPair}>
        <strong>
          {pair.fg} on {pair.bg}
        </strong>
        <span className={styles.muted}>{pair.usage}</span>
      </span>
      <span className={styles.contrastValue}>
        <strong>{value.toFixed(2)}:1</strong>
        <span className={styles.muted}>
          {kindLabel[pair.kind]} · min {contrastMinimum[pair.kind]}
        </span>
      </span>
      <span className={pass ? styles.badgePass : styles.badgeFail}>
        <Icon name={pass ? "check" : "close"} size={20} />
        {pass ? "Pass" : "Fail"}
      </span>
    </li>
  );
}

export function Contrast() {
  return (
    <>
      <Sub title={`Allowed combinations (${contrastPairs.length})`}>
        WCAG 2.2 AA: 4.5:1 for text, 3:1 for borders, focus rings and meaningful icons. These ratios are
        calculated from the tokens, and <code>npm test</code> fails if any allowed pair drops below its minimum.
      </Sub>
      <ul className={styles.contrastList}>
        {contrastPairs.map((pair) => (
          <ContrastRow key={`${pair.fg}-${pair.bg}-${pair.kind}`} pair={pair} pass />
        ))}
      </ul>
      <Sub title="Don’t use">These look plausible in a mock-up but fail, so the system does not allow them.</Sub>
      <ul className={styles.contrastList}>
        {contrastFailures.map((pair) => (
          <ContrastRow key={`${pair.fg}-${pair.bg}-${pair.kind}`} pair={pair} pass={false} />
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Atmosphere() {
  return (
    <div className={styles.atmo}>
      <div className={styles.atmoStage} aria-hidden="true">
        <span className={`${styles.bloom} ${styles.bloomBlush}`} />
        <span className={`${styles.bloom} ${styles.bloomGreen}`} />
        <span className={`${styles.bloom} ${styles.bloomAmber}`} />
        <span className={styles.grain} />
        <div className={styles.glass}>
          <p className="type-eyebrow">Glass panel</p>
          <p className="type-h3">94% warm white, 1px keyline</p>
          <p className={`type-meta ${styles.muted}`}>Solid white when transparency is reduced.</p>
        </div>
        <div className={styles.statusTile}>
          <p className="type-eyebrow">Status tile</p>
          <p className="type-h3">Two-stop gradient</p>
          <p className="type-meta">Only for a real status.</p>
        </div>
      </div>
      <dl className={styles.specList}>
        <div>
          <dt>Ambient bloom</dt>
          <dd>
            Radial gradient, {glowSpec["radius-min"]}–{glowSpec["radius-max"]} radius, {glowSpec["blur-min"]}–
            {glowSpec["blur-max"]} blur, opacity {glowSpec["opacity-soft"]}–{glowSpec["opacity-strong"]}.
          </dd>
          <dd className={styles.never}>Never behind body copy, form fields, results or consent.</dd>
        </div>
        <div>
          <dt>Glass panel</dt>
          <dd>Warm white at 92–97%, 1px keyline, {glowSpec["glass-blur"]} backdrop blur on decorative overlays only.</dd>
          <dd className={styles.never}>Solid on most phones and under reduced transparency.</dd>
        </div>
        <div>
          <dt>Colour-status tile</dt>
          <dd>12–22px radius, simple two-stop gradient, optional grain.</dd>
          <dd className={styles.never}>Never for a score or status that has no real data behind it.</dd>
        </div>
        <div>
          <dt>Grain</dt>
          <dd>2–3% noise on hero illustration only.</dd>
          <dd className={styles.never}>Never over small text or charts.</dd>
        </div>
      </dl>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const typeSamples: Record<keyof typeof typeScale, string> = {
  "display-xl": "Make the right next move, with clarity.",
  "display-l": "See which loan routes fit you.",
  h1: "What would you like help with?",
  h2: "Your current situation",
  h3: "Suggested route",
  "body-l": "Answer a few questions, see which route fits your needs, and speak with the team only if it makes sense.",
  body: "We ask this to check which lenders accept your type of employment.",
  meta: "Step 2 of 4 · Your situation",
  eyebrow: "How it works",
};

export function Typography() {
  return (
    <>
      <div className={styles.families}>
        <div className={styles.family}>
          <p className={styles.familyGlyph} style={{ fontFamily: "var(--font-family-display)" }} aria-hidden="true">
            Aa
          </p>
          <p className="type-h3">Plus Jakarta Sans</p>
          <p className={`type-meta ${styles.muted}`}>
            Display XL and Display L only. Warm and confident for big headlines. Variable 200–800. SIL Open Font
            License.
          </p>
        </div>
        <div className={styles.family}>
          <p className={styles.familyGlyph} style={{ fontFamily: "var(--font-family-ui)" }} aria-hidden="true">
            Aa
          </p>
          <p className="type-h3">Inter</p>
          <p className={`type-meta ${styles.muted}`}>
            Headings, UI, forms and body. Built for screens, with tabular figures so amounts line up. Variable
            100–900. SIL Open Font License.
          </p>
        </div>
      </div>
      <p className={`type-meta ${styles.muted} ${styles.note}`}>
        Sizes scale fluidly from the 390px frame to the 1440px frame and stop at both ends. Resize the window to
        see it. Chinese and Tamil text falls back to the device’s Simplified Chinese and Tamil fonts: 陈美玲 ·
        தமிழ்.
      </p>
      <ul className={styles.typeList}>
        {(Object.entries(typeScale) as [keyof typeof typeScale, TypeStep][]).map(([name, step]) => (
          <li key={name} className={styles.typeRow}>
            <div className={styles.typeMeta}>
              <p>
                <strong>{name}</strong>
              </p>
              <p className={styles.muted}>
                Desktop {step.desktop.size}/{step.desktop.leading} · Mobile {step.mobile.size}/{step.mobile.leading}
              </p>
              <p className={styles.muted}>
                Weight {step.weight} · {step.tracking}
              </p>
              <p className={styles.muted}>{step.usage}</p>
            </div>
            <p className={`type-${name} ${styles.typeSample}`}>{typeSamples[name]}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Space() {
  const sizes = [
    { label: "Primary button", detail: "52px", height: 52, width: 180 },
    { label: "Compact button", detail: "44px mobile practical minimum", height: 44, width: 140 },
    { label: "Input", detail: "52–56px, 16px text", height: 56, width: 220 },
    { label: "Choice row", detail: "56px minimum on mobile", height: 56, width: 260 },
  ];
  return (
    <>
      <Sub title="Space scale">4px base. The token name is the multiple of 4, so space-6 is 24px.</Sub>
      <ul className={styles.spaceList}>
        {Object.entries(space).map(([name, px]) => (
          <li key={name} className={styles.spaceRow}>
            <code>space-{name}</code>
            <span className={styles.muted}>{px}px</span>
            <span className={styles.spaceBar} style={{ width: px }} aria-hidden="true" />
          </li>
        ))}
      </ul>
      <Sub title="Control sizes">Touch targets aim well above WCAG’s 24px minimum (brief §12, §18).</Sub>
      <ul className={styles.sizeList}>
        {sizes.map((s) => (
          <li key={s.label} className={styles.sizeItem}>
            <span className={styles.sizeBox} style={{ height: s.height, width: s.width }} aria-hidden="true">
              {s.height}
            </span>
            <span>
              <strong>{s.label}</strong>
              <span className={`type-meta ${styles.muted}`}> {s.detail}</span>
            </span>
          </li>
        ))}
        <li className={styles.sizeItem}>
          <span className={styles.targetBox} aria-hidden="true">
            <span />
          </span>
          <span>
            <strong>Target</strong>
            <span className={`type-meta ${styles.muted}`}> 44px practical goal around a 24px WCAG minimum</span>
          </span>
        </li>
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Shape() {
  return (
    <>
      <Sub title="Radius">One corner language across the product.</Sub>
      <ul className={styles.radiusGrid}>
        {Object.entries(radius).map(([name, { value, usage }]) => (
          <li key={name} className={styles.radiusItem}>
            <span className={styles.radiusBox} style={{ borderRadius: `${value}px` }} aria-hidden="true" />
            <strong>
              {name} <span className={styles.muted}>{value === 999 ? "999px" : `${value}px`}</span>
            </strong>
            <span className={`type-meta ${styles.muted}`}>{usage}</span>
          </li>
        ))}
      </ul>
      <Sub title="Elevation">Keylines first. Shadows only when something genuinely sits above the page.</Sub>
      <ul className={styles.elevGrid}>
        {(["none", "raised", "overlay"] as const).map((name) => (
          <li
            key={name}
            className={styles.elevCard}
            style={{ boxShadow: shadow[name].value, borderColor: name === "none" ? undefined : "transparent" }}
          >
            <strong>{name === "none" ? "Keyline (default)" : name[0].toUpperCase() + name.slice(1)}</strong>
            <span className={`type-meta ${styles.muted}`}>{shadow[name].usage}</span>
            <code className={styles.elevCode}>{name === "none" ? "1px solid var(--color-border-subtle)" : shadow[name].value}</code>
          </li>
        ))}
      </ul>
      <Sub title="Focus">
        A 2px ring with a 2px gap on every interactive element. Blue on light surfaces, lime on forest.
      </Sub>
      <div className={styles.focusRow}>
        <span className={styles.focusLight}>Continue to your situation</span>
        <span className={styles.focusDark}>
          <span>Find my next step</span>
        </span>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Grid() {
  const steps = Object.entries(grid);
  return (
    <>
      <div className={styles.gridDemo}>
        <p className={styles.gridLabel} aria-live="off">
          <span data-bp="small">Small mobile · 4 columns · 16px margins · 12px gutters</span>
          <span data-bp="mobile">Mobile · 4 columns · 20px margins · 12px gutters</span>
          <span data-bp="large">Large mobile · 4 columns · 24px margins · 12px gutters</span>
          <span data-bp="tablet">Tablet · 8 columns · 32px margins · 16px gutters</span>
          <span data-bp="laptop">Laptop · 12 columns · 48px margins · 24px gutters</span>
          <span data-bp="desktop">Desktop · 12 columns · 64px margins · 24px gutters</span>
        </p>
        <div className={styles.gridCols} aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <p className={`type-meta ${styles.muted}`}>Live: these columns use the same grid tokens as the page.</p>
      </div>
      <div className={styles.bpTable} role="table" aria-label="Grid by breakpoint">
        <div role="row" className={styles.bpHead}>
          <span role="columnheader">Frame</span>
          <span role="columnheader">Width</span>
          <span role="columnheader">Columns</span>
          <span role="columnheader">Margin</span>
          <span role="columnheader">Gutter</span>
        </div>
        {steps.map(([name, step]) => (
          <div role="row" key={name} className={styles.bpRow}>
            <span role="cell">
              <strong>{name}</strong>
            </span>
            <span role="cell">{step.range}</span>
            <span role="cell">{step.columns}</span>
            <span role="cell">{step.margin}px</span>
            <span role="cell">{step.gutter}px</span>
          </div>
        ))}
      </div>
      <Sub title="Measures">Content widths that keep reading and form-filling comfortable.</Sub>
      <ul className={styles.measureList}>
        {Object.entries(layout).map(([name, { value, usage }]) => (
          <li key={name} className={styles.measureRow}>
            <span className={styles.measureLabel}>
              <strong>{name}</strong> <span className={styles.muted}>{value}px</span>
              <span className={`type-meta ${styles.muted}`}>{usage}</span>
            </span>
            <span className={styles.measureTrack} aria-hidden="true">
              <span style={{ width: `${(value / layout["container-wide"].value) * 100}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function Icons() {
  return (
    <>
      <div className={styles.iconSizes}>
        {([20, 24, 32] as const).map((size) => (
          <span key={size} className={styles.iconSize}>
            <Icon name="calendar" size={size} />
            <span className="type-meta">{size}px</span>
          </span>
        ))}
        <span className={`type-meta ${styles.muted}`}>1.8px stroke at every size · round caps and joins</span>
      </div>
      <ul className={styles.iconGrid}>
        {iconNames.map((name) => (
          <li key={name} className={styles.iconCell}>
            <Icon name={name} />
            <code>{name}</code>
          </li>
        ))}
      </ul>
      <p className={`type-meta ${styles.muted} ${styles.note}`}>
        Non-standard icons always sit next to a text label. No white icon on lime as the only cue. The WhatsApp
        mark itself will come from WhatsApp’s official brand assets in Part 5.
      </p>
    </>
  );
}

/* -------------------------------------------------------------------------- */

export function TokenFiles() {
  return (
    <div className={styles.files}>
      <div className={styles.fileCard}>
        <Icon name="document" />
        <h3 className="type-h3">For Figma</h3>
        <p>
          <a href="/tokens/dfx.tokens.json" download>
            dfx.tokens.json
          </a>{" "}
          is in the W3C Design Tokens (DTCG) format, with semantic colours aliased to the palette. Import it with
          Tokens Studio or a DTCG Variables importer to get matching Figma variables.
        </p>
      </div>
      <div className={styles.fileCard}>
        <Icon name="route" />
        <h3 className="type-h3">For engineering</h3>
        <p>
          <code>src/styles/tokens.css</code> holds the custom properties and type classes. Both files are
          generated from <code>src/design/tokens.ts</code>; edit that, then run <code>npm run tokens</code>.
        </p>
        <pre className={styles.code}>
          <code>{`.primary {
  height: var(--size-button-height);
  border-radius: var(--radius-button);
  background: var(--color-action-primary-bg);
  color: var(--color-action-primary-fg);
  transition: background var(--motion-duration-hover)
    var(--motion-easing-out);
}`}</code>
        </pre>
      </div>
    </div>
  );
}

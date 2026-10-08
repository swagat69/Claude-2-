/**
 * DFX design tokens: the single source of truth for the foundations in the
 * design brief (§11 colour, §12 type / space / radius / elevation, §14 motion,
 * §16 layout).
 *
 * `npm run tokens` generates two files from this module:
 *   - src/styles/tokens.css           CSS custom properties for engineering
 *   - public/tokens/dfx.tokens.json   W3C DTCG tokens for Figma Variables import
 * Never edit the generated files by hand; `npm test` fails when they drift.
 *
 * Naming contract (brief §13): token paths are dot-separated, e.g.
 * `color.semantic.text.primary`. The CSS name joins the path with "-" and
 * drops the `color.semantic` / `color.` prefixes:
 *   color.palette.ink              -> --palette-ink
 *   color.semantic.text.primary    -> --color-text-primary
 *   color.category.green.bg        -> --category-green-bg
 *   space.6                        -> --space-6
 *   motion.duration.enter          -> --motion-duration-enter
 */

export type TokenSource = "brief" | "derived";

export interface PaletteEntry {
  value: string;
  source: TokenSource;
  role: string;
  guidance: string;
}

/* -------------------------------------------------------------------------- */
/* Colour: primitives                                                         */
/* -------------------------------------------------------------------------- */

/** The brief's proposed palette (§11), unchanged. */
export const briefPalette = {
  ink: {
    value: "#192022",
    source: "brief",
    role: "Primary text, icons, key outlines",
    guidance: "On warm paper and light accent fills.",
  },
  paper: {
    value: "#F7F6F2",
    source: "brief",
    role: "Page background and calm negative space",
    guidance: "Ink foreground; keeps pure white cards distinguishable.",
  },
  forest: {
    value: "#16372C",
    source: "brief",
    role: "Premium dark cards, brand text, primary CTA",
    guidance: "White or lime text.",
  },
  lime: {
    value: "#D5F65C",
    source: "brief",
    role: "Highlight, progress complete, selected indicator",
    guidance: "Ink text; never white. Invisible on paper (1.1:1), so always pair with an ink outline or icon.",
  },
  green: {
    value: "#22A64B",
    source: "brief",
    role: "Optimistic category tiles and success signal",
    guidance: "Ink text only; white text fails AA (3.2:1).",
  },
  orange: {
    value: "#FA6B33",
    source: "brief",
    role: "Playful “how it works” and interest cards",
    guidance: "Ink text; a warm accent, never an error.",
  },
  blue: {
    value: "#415EC8",
    source: "brief",
    role: "Secondary category, information, focus ring",
    guidance: "White text (5.7:1).",
  },
  red: {
    value: "#D72839",
    source: "brief",
    role: "Negative / error meaning when truly necessary",
    guidance: "White text; always with icon, heading and explanation.",
  },
  sage: {
    value: "#889B62",
    source: "brief",
    role: "Subtle cards, chips, low-intensity accents",
    guidance: "Ink text.",
  },
  peach: {
    value: "#EAC6B5",
    source: "brief",
    role: "Warm human stories, soft category area",
    guidance: "Ink text.",
  },
  line: {
    value: "#DDE1DA",
    source: "brief",
    role: "Dividers and card keylines on light surfaces",
    guidance: "Decorative only (1.3:1). Not for input borders or body text.",
  },
  white: {
    value: "#FFFFFF",
    source: "brief",
    role: "Input and card surfaces",
    guidance: "Ink text.",
  },
} as const satisfies Record<string, PaletteEntry>;

/**
 * Values the brief does not specify but the components need: interaction
 * states, accessible text/border variants and feedback tints. Each one is
 * checked in `contrastPairs` below.
 */
export const derivedPalette = {
  "ink-muted": {
    value: "#5A625E",
    source: "derived",
    role: "Secondary text, hints, meta",
    guidance: "5.8:1 on paper, 6.3:1 on white.",
  },
  "field-border": {
    value: "#7F8782",
    source: "derived",
    role: "Input and unselected choice borders",
    guidance: "Meets the 3:1 non-text minimum on paper and white, which line does not.",
  },
  "paper-sunken": {
    value: "#EFEEE8",
    source: "derived",
    role: "Recessed panels, hover fill on light controls",
    guidance: "Ink or ink-muted text.",
  },
  "forest-hover": {
    value: "#1F4A3B",
    source: "derived",
    role: "Primary action hover",
    guidance: "White text 10:1.",
  },
  "forest-pressed": {
    value: "#0E261E",
    source: "derived",
    role: "Primary action pressed",
    guidance: "White text 16:1.",
  },
  "forest-muted": {
    value: "#B8C2BC",
    source: "derived",
    role: "Secondary text on forest",
    guidance: "7.1:1 on forest.",
  },
  "lime-tint": {
    value: "#EEFBC4",
    source: "derived",
    role: "Selected choice surface",
    guidance: "Ink text; selection is also shown by ink border and check.",
  },
  "success-text": {
    value: "#1B7A3A",
    source: "derived",
    role: "Success text and icons",
    guidance: "Darker than green so it passes 4.5:1 as text.",
  },
  "success-tint": {
    value: "#E7F5EA",
    source: "derived",
    role: "Success notice surface",
    guidance: "Pair with success-text.",
  },
  "error-text": {
    value: "#B4231F",
    source: "derived",
    role: "Error text and icons",
    guidance: "6.6:1 on white; keeps AA on the error tint.",
  },
  "error-tint": {
    value: "#FCECEA",
    source: "derived",
    role: "Error notice surface",
    guidance: "Pair with error-text.",
  },
  "warning-text": {
    value: "#9A4A00",
    source: "derived",
    role: "Warning text and icons",
    guidance: "Orange fails as text; this amber-brown passes.",
  },
  "warning-tint": {
    value: "#FFF1E0",
    source: "derived",
    role: "Warning notice surface",
    guidance: "Pair with warning-text.",
  },
  "info-tint": {
    value: "#ECF0FB",
    source: "derived",
    role: "Information notice surface",
    guidance: "Pair with blue text.",
  },
} as const satisfies Record<string, PaletteEntry>;

export const palette = { ...briefPalette, ...derivedPalette };
export type PaletteName = keyof typeof palette;

/* -------------------------------------------------------------------------- */
/* Colour: semantic aliases                                                   */
/* -------------------------------------------------------------------------- */

/** A palette name (aliased) or a raw CSS colour value. */
type ColorValue = PaletteName | `rgba(${string})`;

export const semantic = {
  text: {
    primary: "ink",
    secondary: "ink-muted",
    inverse: "white",
    "inverse-secondary": "forest-muted",
    "on-accent": "ink",
    link: "forest",
    success: "success-text",
    error: "error-text",
    warning: "warning-text",
    info: "blue",
  },
  surface: {
    base: "paper",
    raised: "white",
    sunken: "paper-sunken",
    inverse: "forest",
    accent: "lime",
    selected: "lime-tint",
    glass: "rgba(252, 251, 248, 0.94)",
  },
  border: {
    subtle: "line",
    field: "field-border",
    strong: "ink",
    inverse: "rgba(255, 255, 255, 0.18)",
  },
  action: {
    "primary-bg": "forest",
    "primary-bg-hover": "forest-hover",
    "primary-bg-pressed": "forest-pressed",
    "primary-fg": "white",
    "secondary-bg": "white",
    "secondary-bg-hover": "paper-sunken",
    "secondary-fg": "ink",
    "secondary-border": "field-border",
    "accent-bg": "lime",
    "accent-fg": "ink",
    "selected-bg": "lime-tint",
    "selected-border": "ink",
    "selected-indicator": "lime",
    "disabled-bg": "paper-sunken",
    "disabled-fg": "ink-muted",
  },
  focus: {
    ring: "blue",
    "ring-inverse": "lime",
  },
  feedback: {
    "success-fg": "success-text",
    "success-bg": "success-tint",
    "success-border": "green",
    "error-fg": "error-text",
    "error-bg": "error-tint",
    "error-border": "red",
    "warning-fg": "warning-text",
    "warning-bg": "warning-tint",
    "warning-border": "orange",
    "info-fg": "blue",
    "info-bg": "info-tint",
    "info-border": "blue",
  },
} as const satisfies Record<string, Record<string, ColorValue>>;

/**
 * Category "ticket" tiles (brief H0.5, image 4). Each tile fill has a fixed
 * foreground so text contrast is guaranteed per fill.
 */
export const category = {
  green: { bg: "green", fg: "ink" },
  orange: { bg: "orange", fg: "ink" },
  lime: { bg: "lime", fg: "ink" },
  sage: { bg: "sage", fg: "ink" },
  peach: { bg: "peach", fg: "ink" },
  blue: { bg: "blue", fg: "white" },
  red: { bg: "red", fg: "white" },
  forest: { bg: "forest", fg: "lime" },
  ink: { bg: "ink", fg: "white" },
} as const satisfies Record<string, { bg: PaletteName; fg: PaletteName }>;

/**
 * Atmospheric glow (brief §11): blush, green and amber blooms behind
 * non-interactive art only. Never behind inputs, legal text or results.
 * Saturated on purpose: at 18–36% opacity over paper they land on soft
 * pastels (blush ≈ #F5C4D7, green ≈ #B9E3C3, amber ≈ #FAD5B1).
 */
export const glow = {
  blush: "#F06BA8",
  green: "#4CC26F",
  amber: "#FF9A3D",
  lime: "#D5F65C",
} as const;

export const glowSpec = {
  "opacity-soft": "0.18",
  "opacity-strong": "0.36",
  "radius-min": "320px",
  "radius-max": "520px",
  "blur-min": "40px",
  "blur-max": "85px",
  "glass-blur": "16px",
  "noise-opacity": "0.025",
} as const;

/* -------------------------------------------------------------------------- */
/* Contrast audit                                                             */
/* -------------------------------------------------------------------------- */

export type ContrastKind = "text" | "large-text" | "non-text";

export interface ContrastPair {
  fg: PaletteName;
  bg: PaletteName;
  kind: ContrastKind;
  usage: string;
}

/** WCAG 2.2 AA minimums (brief §18). */
export const contrastMinimum: Record<ContrastKind, number> = {
  text: 4.5,
  "large-text": 3,
  "non-text": 3,
};

/** Every foreground/background combination the system allows. `npm test` enforces each one. */
export const contrastPairs: ContrastPair[] = [
  { fg: "ink", bg: "paper", kind: "text", usage: "Body text on page" },
  { fg: "ink", bg: "white", kind: "text", usage: "Body text on cards and inputs" },
  { fg: "ink-muted", bg: "paper", kind: "text", usage: "Secondary text on page" },
  { fg: "ink-muted", bg: "white", kind: "text", usage: "Hints and meta on cards" },
  { fg: "ink-muted", bg: "paper-sunken", kind: "text", usage: "Meta on recessed panel" },
  { fg: "ink-muted", bg: "lime-tint", kind: "text", usage: "Hint inside selected choice" },
  { fg: "ink", bg: "lime-tint", kind: "text", usage: "Selected choice label" },
  { fg: "forest", bg: "paper", kind: "text", usage: "Links and brand text" },
  { fg: "white", bg: "forest", kind: "text", usage: "Primary button label" },
  { fg: "white", bg: "forest-hover", kind: "text", usage: "Primary button hover" },
  { fg: "white", bg: "forest-pressed", kind: "text", usage: "Primary button pressed" },
  { fg: "lime", bg: "forest", kind: "text", usage: "Highlight text on dark card" },
  { fg: "forest-muted", bg: "forest", kind: "text", usage: "Secondary text on dark card" },
  { fg: "ink", bg: "lime", kind: "text", usage: "Accent button / highlight chip" },
  { fg: "ink", bg: "green", kind: "text", usage: "Green category tile" },
  { fg: "ink", bg: "orange", kind: "text", usage: "Orange category tile" },
  { fg: "ink", bg: "sage", kind: "text", usage: "Sage category tile" },
  { fg: "ink", bg: "peach", kind: "text", usage: "Peach category tile" },
  { fg: "white", bg: "blue", kind: "text", usage: "Blue category tile" },
  { fg: "white", bg: "red", kind: "text", usage: "Red tile / destructive button" },
  { fg: "white", bg: "ink", kind: "text", usage: "Ink category tile" },
  { fg: "blue", bg: "paper", kind: "text", usage: "Info text on page" },
  { fg: "blue", bg: "info-tint", kind: "text", usage: "Info notice" },
  { fg: "success-text", bg: "white", kind: "text", usage: "Success text on card" },
  { fg: "success-text", bg: "success-tint", kind: "text", usage: "Success notice" },
  { fg: "error-text", bg: "white", kind: "text", usage: "Inline field error" },
  { fg: "error-text", bg: "paper", kind: "text", usage: "Error text on page" },
  { fg: "error-text", bg: "error-tint", kind: "text", usage: "Error summary" },
  { fg: "warning-text", bg: "white", kind: "text", usage: "Warning text on card" },
  { fg: "warning-text", bg: "warning-tint", kind: "text", usage: "Warning notice" },
  { fg: "field-border", bg: "white", kind: "non-text", usage: "Input border on card" },
  { fg: "field-border", bg: "paper", kind: "non-text", usage: "Input border on page" },
  { fg: "blue", bg: "paper", kind: "non-text", usage: "Focus ring on page" },
  { fg: "blue", bg: "white", kind: "non-text", usage: "Focus ring on card" },
  { fg: "lime", bg: "forest", kind: "non-text", usage: "Focus ring on dark surface" },
  { fg: "ink", bg: "lime-tint", kind: "non-text", usage: "Selected choice border" },
  { fg: "red", bg: "white", kind: "non-text", usage: "Error field border" },
];

/** Combinations that look plausible but fail. Shown as “don’t” examples. */
export const contrastFailures: ContrastPair[] = [
  { fg: "white", bg: "green", kind: "text", usage: "White text on green tile" },
  { fg: "white", bg: "orange", kind: "text", usage: "White text on orange tile" },
  { fg: "white", bg: "lime", kind: "text", usage: "White text or icon on lime" },
  { fg: "lime", bg: "paper", kind: "non-text", usage: "Lime alone as a selected/complete marker" },
  { fg: "line", bg: "white", kind: "non-text", usage: "Line colour as an input border" },
  { fg: "green", bg: "paper", kind: "text", usage: "Green as success text" },
];

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

export interface TypeStep {
  /** Desktop (1440) and mobile (390) values from brief §12. Size is fluid between them. */
  desktop: { size: number; leading: number };
  mobile: { size: number; leading: number };
  family: "display" | "ui";
  weight: number;
  tracking: string;
  transform?: "uppercase";
  usage: string;
}

/**
 * Inter and Plus Jakarta Sans cover Latin only. Chinese and Tamil text (names
 * typed into forms, future translations) falls back to the device's own
 * Simplified Chinese and Tamil fonts, listed before system-ui so Singapore
 * users get Simplified, not Traditional or Japanese, glyph forms.
 */
const systemFallback = [
  '"PingFang SC"',
  '"Hiragino Sans GB"',
  '"Microsoft YaHei"',
  '"Noto Sans SC"',
  '"Tamil Sangam MN"',
  '"Nirmala UI"',
  '"Noto Sans Tamil"',
  "ui-sans-serif",
  "system-ui",
  "sans-serif",
].join(", ");

export const fontFamily = {
  display: `var(--font-plus-jakarta), ${systemFallback}`,
  ui: `var(--font-inter), ${systemFallback}`,
} as const;

export const typeScale = {
  "display-xl": {
    desktop: { size: 72, leading: 0.98 },
    mobile: { size: 42, leading: 1.03 },
    family: "display",
    weight: 720,
    tracking: "-0.03em",
    usage: "Homepage hero headline only",
  },
  "display-l": {
    desktop: { size: 56, leading: 1.02 },
    mobile: { size: 36, leading: 1.06 },
    family: "display",
    weight: 680,
    tracking: "-0.025em",
    usage: "Major section headline",
  },
  h1: {
    desktop: { size: 38, leading: 1.12 },
    mobile: { size: 28, leading: 1.15 },
    family: "ui",
    weight: 650,
    tracking: "-0.022em",
    usage: "Assessment step and results title",
  },
  h2: {
    desktop: { size: 28, leading: 1.2 },
    mobile: { size: 24, leading: 1.24 },
    family: "ui",
    weight: 620,
    tracking: "-0.016em",
    usage: "Section and group header",
  },
  h3: {
    desktop: { size: 20, leading: 1.25 },
    mobile: { size: 18, leading: 1.3 },
    family: "ui",
    weight: 600,
    tracking: "-0.01em",
    usage: "Card titles",
  },
  "body-l": {
    desktop: { size: 18, leading: 1.5 },
    mobile: { size: 17, leading: 1.5 },
    family: "ui",
    weight: 400,
    tracking: "-0.005em",
    usage: "Explanatory and supporting copy",
  },
  body: {
    desktop: { size: 16, leading: 1.5 },
    mobile: { size: 16, leading: 1.5 },
    family: "ui",
    weight: 400,
    tracking: "0em",
    usage: "Labels, inputs and default text (16px avoids iOS zoom)",
  },
  meta: {
    desktop: { size: 13, leading: 1.35 },
    mobile: { size: 13, leading: 1.35 },
    family: "ui",
    weight: 500,
    tracking: "0.005em",
    usage: "Status and help. Never legal-critical information",
  },
  eyebrow: {
    desktop: { size: 12, leading: 1.25 },
    mobile: { size: 11, leading: 1.25 },
    family: "ui",
    weight: 650,
    tracking: "0.1em",
    transform: "uppercase",
    usage: "Short section labels",
  },
} as const satisfies Record<string, TypeStep>;

/* -------------------------------------------------------------------------- */
/* Space, size, radius, elevation                                             */
/* -------------------------------------------------------------------------- */

/** 4px base. Key = multiple of 4 (space.6 = 24px). */
export const space = {
  "1": 4,
  "2": 8,
  "3": 12,
  "4": 16,
  "5": 20,
  "6": 24,
  "8": 32,
  "10": 40,
  "12": 48,
  "16": 64,
  "20": 80,
  "24": 96,
} as const;

export const radius = {
  mini: { value: 8, usage: "Chips, badges, small tags" },
  field: { value: 12, usage: "Inputs, selects, choice rows" },
  button: { value: 16, usage: "All buttons, including the hero CTA" },
  tile: { value: 20, usage: "Category ticket tiles (H0.5)" },
  card: { value: 22, usage: "Cards, panels, result cards" },
  hero: { value: 32, usage: "Hero art and large feature surfaces" },
  pill: { value: 999, usage: "Stepper dots, pill toggles" },
} as const;

export const size = {
  "button-height": 52,
  "button-height-compact": 44,
  "input-height": 52,
  "input-height-lg": 56,
  "target-min": 44,
  "choice-row-min": 56,
  "header-height": 78,
  "header-height-compact": 64,
  "icon-sm": 20,
  "icon-md": 24,
  "icon-lg": 32,
  "icon-stroke": 1.8,
} as const;

export const shadow = {
  raised: { value: "0 6px 24px rgba(20, 25, 20, 0.06)", usage: "Raised card, only where elevation means something" },
  overlay: { value: "0 24px 64px rgba(20, 25, 20, 0.14)", usage: "Modal, sheet and handoff panel" },
  none: { value: "none", usage: "Default: use a 1px keyline instead of a shadow" },
} as const;

export const border = {
  hairline: "1px",
  emphasis: "2px",
  "focus-width": "2px",
  "focus-offset": "2px",
} as const;

/* -------------------------------------------------------------------------- */
/* Layout                                                                     */
/* -------------------------------------------------------------------------- */

/** Reference frames from brief §16. CSS can't read custom properties in media queries, so components use these numbers literally. */
export const breakpoints = {
  "small-mobile": 320,
  mobile: 360,
  "large-mobile": 480,
  tablet: 768,
  laptop: 1024,
  desktop: 1440,
  ultrawide: 1920,
} as const;

export interface GridStep {
  /** Media query that switches to this grid; null for the mobile base. Queries never overlap. */
  query: string | null;
  range: string;
  columns: number;
  margin: number;
  gutter: number;
}

export const grid = {
  "small-mobile": { query: "(max-width: 359px)", range: "320–359px", columns: 4, margin: 16, gutter: 12 },
  mobile: { query: null, range: "360–479px", columns: 4, margin: 20, gutter: 12 },
  "large-mobile": { query: "(min-width: 480px)", range: "480–767px", columns: 4, margin: 24, gutter: 12 },
  tablet: { query: "(min-width: 768px)", range: "768–1023px", columns: 8, margin: 32, gutter: 16 },
  laptop: { query: "(min-width: 1024px)", range: "1024–1439px", columns: 12, margin: 48, gutter: 24 },
  desktop: { query: "(min-width: 1440px)", range: "≥1440px", columns: 12, margin: 64, gutter: 24 },
} as const satisfies Record<string, GridStep>;

/** Fluid type interpolates between these viewport widths (brief's mobile 390 and desktop 1440 frames). */
export const fluidRange = { min: 390, max: 1440 } as const;

/** Width at which type switches from mobile to desktop line-heights. */
export const desktopTypeQuery = "(min-width: 1024px)";

export const layout = {
  "container-max": { value: 1280, usage: "Main content width" },
  "container-wide": { value: 1440, usage: "Outer art on ultra-wide screens" },
  "reading-measure": { value: 680, usage: "FAQ, policy and long explanations" },
  "form-measure": { value: 720, usage: "Assessment input column" },
  "help-rail": { value: 300, usage: "“What to expect” / support rail" },
  "result-detail": { value: 760, usage: "Results main column" },
  "result-cta": { value: 330, usage: "Results call panel" },
} as const;

export const zIndex = {
  base: 0,
  raised: 10,
  "sticky-cta": 90,
  header: 100,
  overlay: 200,
  toast: 300,
} as const;

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

export interface DurationToken {
  /** Default duration in ms (middle of the brief's range). */
  value: number;
  /** Duration under prefers-reduced-motion; spatial movement is also removed. */
  reduced: number;
  range: string;
  usage: string;
}

export const duration = {
  press: { value: 100, reduced: 100, range: "90–120ms", usage: "Button press scale" },
  hover: { value: 160, reduced: 160, range: "140–180ms", usage: "Button / card hover (colour only when reduced)" },
  validation: { value: 170, reduced: 0, range: "140–200ms", usage: "Error region reveal" },
  reveal: { value: 160, reduced: 0, range: "160ms", usage: "Conditional field reveal" },
  select: { value: 200, reduced: 0, range: "180–230ms", usage: "Choice card selection" },
  success: { value: 200, reduced: 0, range: "160–220ms", usage: "Saved / check draw" },
  "cta-emphasis": { value: 210, reduced: 0, range: "180–240ms", usage: "Call CTA gains emphasis" },
  header: { value: 220, reduced: 0, range: "220ms", usage: "Header compress 78 → 64px" },
  step: { value: 260, reduced: 150, range: "220–300ms", usage: "Assessment step transition" },
  progress: { value: 300, reduced: 0, range: "240–340ms", usage: "Stepper activation" },
  results: { value: 400, reduced: 150, range: "320–480ms", usage: "Results sections appear" },
  enter: { value: 480, reduced: 150, range: "420–560ms", usage: "Page / hero title entrance" },
  "enter-slow": { value: 680, reduced: 150, range: "560–800ms", usage: "Hero card stack entrance" },
} as const satisfies Record<string, DurationToken>;

export const stagger = {
  hero: { value: 90, reduced: 0, usage: "Hero cards (80–110ms)" },
  results: { value: 50, reduced: 0, usage: "Result sections" },
  reveal: { value: 90, reduced: 0, usage: "Scroll reveal groups (max)" },
} as const;

export const easing = {
  standard: { value: "cubic-bezier(0.2, 0.8, 0.2, 1)", usage: "Entrances and spatial moves (brief §14)" },
  out: { value: "cubic-bezier(0, 0, 0.2, 1)", usage: "Hover, press, select, validation" },
  "in-out": { value: "cubic-bezier(0.4, 0, 0.2, 1)", usage: "Crossfades and progress fills" },
} as const;

/** Spatial amounts; all become 0 / 1 under reduced motion. */
export const motionDistance = {
  enter: { value: "16px", reduced: "0px", usage: "Title translateY (≤24px)" },
  card: { value: "20px", reduced: "0px", usage: "Hero card translateY" },
  step: { value: "10px", reduced: "0px", usage: "Step content enters 8–12px" },
  reveal: { value: "12px", reduced: "0px", usage: "Scroll reveal rise" },
  lift: { value: "-1px", reduced: "0px", usage: "Button hover lift (max)" },
  "icon-lift": { value: "-2px", reduced: "0px", usage: "Tile icon hover lift" },
  parallax: { value: "16px", reduced: "0px", usage: "Hero orb parallax (desktop, 10–18px)" },
} as const;

export const motionScale = {
  press: { value: "0.985", reduced: "1", usage: "Button press" },
  "card-enter": { value: "0.98", reduced: "1", usage: "Hero card entrance" },
} as const;

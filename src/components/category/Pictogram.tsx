import type { ReactNode } from "react";

/**
 * Filled geometric pictograms for the colour tiles (brief §12 icon system:
 * "occasional filled pictograms for high-chroma tiles"; image 4). Drawn in
 * the tile's text colour, with tints by opacity and cut-outs in the tile's
 * own colour (--tile-bg), so every theme keeps its checked contrast.
 * Decorative: the tile's title says what it is.
 */
const cut = "var(--tile-bg)";
const line = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 4,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const pictograms = {
  personal: (
    <>
      <rect x="15" y="9" width="34" height="22" rx="4" opacity="0.45" transform="rotate(-10 32 20)" />
      <rect x="6" y="20" width="52" height="36" rx="9" />
      <rect x="37" y="31" width="21" height="14" rx="7" fill={cut} />
      <circle cx="45" cy="38" r="3" />
    </>
  ),
  consolidation: (
    <>
      <circle cx="11" cy="13" r="6.5" opacity="0.45" />
      <circle cx="11" cy="32" r="6.5" opacity="0.7" />
      <circle cx="11" cy="51" r="6.5" opacity="0.45" />
      <path d="M18 13c10 0 10 19 20 19M18 51c10 0 10-19 20-19M18 32h20" {...line} strokeWidth={3} />
      <circle cx="48" cy="32" r="13" />
    </>
  ),
  renovation: (
    <>
      <rect x="41" y="9" width="9" height="16" rx="1.5" opacity="0.45" />
      <path d="M6 30.5L32 9l26 21.5V54a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4z" />
      <rect x="25.5" y="37" width="13" height="21" rx="2" fill={cut} />
      <rect x="12" y="34" width="8" height="8" rx="1.5" fill={cut} />
      <rect x="44" y="34" width="8" height="8" rx="1.5" fill={cut} />
    </>
  ),
  business: (
    <>
      <path d="M23 21v-5a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v5" {...line} />
      <rect x="6" y="20" width="52" height="36" rx="8" />
      <rect x="6" y="34" width="52" height="4" fill={cut} />
      <rect x="27" y="30" width="10" height="12" rx="2.5" />
    </>
  ),
  education: (
    <>
      <path d="M16 31v11c0 5 7 10 16 10s16-5 16-10V31l-16 8z" opacity="0.55" />
      <path d="M32 8l30 14-30 14L2 22z" />
      <path d="M53 26v15" {...line} strokeWidth={3} />
      <circle cx="53" cy="45" r="4" />
    </>
  ),
  "not-sure": (
    <>
      <circle cx="32" cy="32" r="26" />
      <circle cx="32" cy="32" r="20" fill={cut} />
      <g transform="rotate(40 32 32)">
        <path d="M32 15l6 17H26z" />
        <path d="M26 32h12l-6 17z" opacity="0.45" />
      </g>
      <circle cx="32" cy="32" r="2.5" fill={cut} />
    </>
  ),
  routes: (
    <>
      <path d="M15 48h24a8 8 0 0 0 0-16H25a8 8 0 0 1 0-16h24" {...line} />
      <circle cx="13" cy="48" r="7" />
      <circle cx="51" cy="16" r="7" opacity="0.55" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type PictogramName = keyof typeof pictograms;

export function Pictogram({ name, size = 64, className }: { name: PictogramName; size?: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {pictograms[name]}
    </svg>
  );
}

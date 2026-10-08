import type { SVGProps } from "react";

/**
 * One outline icon family (brief §12): 24px grid, 1.8px stroke, round caps.
 * Dots are zero-length strokes ("h.01") so they inherit stroke width and colour.
 */
const paths = {
  "arrow-right": ["M5 12h14", "M13 6l6 6-6 6"],
  "arrow-left": ["M19 12H5", "M11 6l-6 6 6 6"],
  "chevron-down": ["M6 9l6 6 6-6"],
  "chevron-right": ["M9 6l6 6-6 6"],
  check: ["M5 12.5l4.5 4.5L19 7.5"],
  close: ["M6 6l12 12", "M18 6L6 18"],
  plus: ["M12 5v14", "M5 12h14"],
  minus: ["M5 12h14"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  info: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 11v5.5", "M12 7.6h.01"],
  help: [
    "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z",
    "M9.6 9.4a2.5 2.5 0 1 1 3.5 2.4c-.66.3-1.1.9-1.1 1.6v.5",
    "M12 16.9h.01",
  ],
  "check-circle": ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M8.2 12.3l2.6 2.6 5-5.2"],
  "alert-circle": ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7.5V13", "M12 16.4h.01"],
  "alert-triangle": ["M10.3 4.3a2 2 0 0 1 3.4 0l7.6 13.2A2 2 0 0 1 19.6 20.5H4.4a2 2 0 0 1-1.7-3l7.6-13.2z", "M12 9.5v4.2", "M12 16.8h.01"],
  lock: ["M6.5 10.5h11a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19v-7a1.5 1.5 0 0 1 1.5-1.5z", "M8 10.5V8a4 4 0 0 1 8 0v2.5"],
  shield: ["M12 3l7 3v5.5c0 4.4-3 8.1-7 9.5-4-1.4-7-5.1-7-9.5V6l7-3z", "M9 12l2 2 4-4"],
  mail: ["M5.5 5.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z", "M4 7.5l8 5.5 8-5.5"],
  message: ["M20 11.5a8 8 0 0 1-11.8 7.05L4 20l1.45-4.2A8 8 0 1 1 20 11.5z"],
  phone: [
    "M6.6 3.5h2.7l1.5 4.4-2 1.5a11 11 0 0 0 5.8 5.8l1.5-2 4.4 1.5v2.7a2 2 0 0 1-2.1 2A16.5 16.5 0 0 1 4.6 5.6a2 2 0 0 1 2-2.1z",
  ],
  calendar: ["M6 5h12a2.5 2.5 0 0 1 2.5 2.5V18a2.5 2.5 0 0 1-2.5 2.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5z", "M3.5 10h17", "M8 3v4", "M16 3v4"],
  clock: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M12 7.5V12l3 2"],
  user: ["M12 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z", "M5 20a7 7 0 0 1 14 0"],
  edit: ["M4 20h4L19 9l-4-4L4 16v4z", "M13.5 6.5l4 4"],
  external: ["M14 4h6v6", "M20 4l-9 9", "M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10"],
  refresh: ["M20 12a8 8 0 1 1-2.34-5.66", "M20 4v4.5h-4.5"],
  globe: ["M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z", "M3 12h18", "M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"],
  document: ["M7 3.5h7l4.5 4.5v12.5H7A1.5 1.5 0 0 1 5.5 19V5A1.5 1.5 0 0 1 7 3.5z", "M14 3.5V8h4.5", "M9 13h6", "M9 16.5h4"],
  route: ["M6 20.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z", "M18 8.2a2.2 2.2 0 1 0 0-4.4 2.2 2.2 0 0 0 0 4.4z", "M8.2 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.8"],
} as const satisfies Record<string, readonly string[]>;

export type IconName = keyof typeof paths;
export const iconNames = Object.keys(paths) as IconName[];

interface IconProps extends Omit<SVGProps<SVGSVGElement>, "children"> {
  name: IconName;
  /** 20, 24 or 32 (brief §12). */
  size?: 20 | 24 | 32;
  /** Accessible name. Omit for decorative icons next to a visible label. */
  label?: string;
}

export function Icon({ name, size = 24, label, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}

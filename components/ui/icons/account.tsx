import type { IconProps } from "./types";

/* Розділи кабінету, яких не було в попередньому наборі — tabler wallet
   і chart-bar на сітці 24, обведення 2. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function WalletIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base}
      strokeWidth={strokeWidth ?? 2}
      className={className}
      aria-hidden
    >
      <path d="M19 7V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-1" />
      <path d="M20 11h-4a2 2 0 0 0 0 4h4z" />
    </svg>
  );
}

export function ChartIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base}
      strokeWidth={strokeWidth ?? 2}
      className={className}
      aria-hidden
    >
      <path d="M4 19h16" />
      <path d="M7 19v-5" />
      <path d="M12 19v-9" />
      <path d="M17 19v-13" />
    </svg>
  );
}

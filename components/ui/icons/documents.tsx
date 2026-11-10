import type { IconProps } from "./types";

/* Документи замовлення — tabler printer і file-spreadsheet. Ці дві взяті
   прямо з набору, а не з Figma, тому лежать на сітці 24 без translate. */

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function PrinterIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base}
      strokeWidth={strokeWidth ?? 2}
      className={className}
      aria-hidden
    >
      <path d="M17 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h2" />
      <path d="M17 9V5a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v4" />
      <path d="M7 15a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function FileSpreadsheetIcon({ className, strokeWidth }: IconProps) {
  return (
    <svg
      {...base}
      strokeWidth={strokeWidth ?? 2}
      className={className}
      aria-hidden
    >
      <path d="M14 3v4a1 1 0 0 0 1 1h4" />
      <path d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z" />
      <path d="M8 11h8v7H8z" />
      <path d="M8 14.5h8" />
      <path d="M12 11v7" />
    </svg>
  );
}

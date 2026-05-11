/* eslint-disable react/no-unknown-property */
import type { ReactNode } from 'react';

export interface SigilDef {
  id: string;
  name: string;
  paths: ReactNode;
}

/** 12 hand-crafted rune-style glyphs on a 24x24 viewBox. Stroke-only so they
 * inherit `currentColor` and read as carved sigils on the parchment cards. */
export const SIGILS: SigilDef[] = [
  {
    id: 'eye',
    name: 'Watching Eye',
    paths: (
      <>
        <path d="M2 12 Q12 4 22 12 Q12 20 2 12 Z" />
        <circle cx="12" cy="12" r="3" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'sword',
    name: 'Bared Sword',
    paths: (
      <>
        <path d="M12 2 L12 17" />
        <path d="M8 7 L16 7" />
        <path d="M10 17 L14 17 L12 22 Z" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'shield',
    name: 'Heater Shield',
    paths: (
      <>
        <path d="M12 2 L20 5 V11 Q20 17 12 22 Q4 17 4 11 V5 Z" />
        <path d="M12 8 L12 18" />
        <path d="M7 11 L17 11" />
      </>
    ),
  },
  {
    id: 'flame',
    name: 'Pyre',
    paths: (
      <path d="M12 2 Q14 7 13 11 Q12 14 14 16 Q15 18 13 20 Q11 22 9 20 Q7 18 9 16 Q11 14 10 11 Q9 7 12 2 Z" />
    ),
  },
  {
    id: 'raven',
    name: 'Raven',
    paths: (
      <>
        <path d="M4 12 Q7 6 13 7 L19 5 L18 9 Q21 11 19 15 Q17 19 11 19 Q7 19 4 17 Z" />
        <circle cx="15" cy="10" r="0.9" fill="currentColor" />
      </>
    ),
  },
  {
    id: 'crown',
    name: 'Crown',
    paths: (
      <>
        <path d="M3 18 L4 8 L9 13 L12 5 L15 13 L20 8 L21 18 Z" />
        <path d="M3 20 L21 20" />
      </>
    ),
  },
  {
    id: 'skull',
    name: 'Skull',
    paths: (
      <>
        <path d="M5 11 Q5 4 12 4 Q19 4 19 11 V14 L17 16 V19 L7 19 V16 L5 14 Z" />
        <circle cx="9" cy="12" r="1.5" fill="currentColor" />
        <circle cx="15" cy="12" r="1.5" fill="currentColor" />
        <path d="M11 17 L13 17" />
      </>
    ),
  },
  {
    id: 'star',
    name: 'Eight-Pointed Star',
    paths: (
      <>
        <path d="M12 2 L13 11 L22 12 L13 13 L12 22 L11 13 L2 12 L11 11 Z" />
        <path d="M5 5 L19 19 M19 5 L5 19" opacity="0.6" />
      </>
    ),
  },
  {
    id: 'moon',
    name: 'Crescent Moon',
    paths: (
      <path d="M17 4 A10 10 0 1 0 17 20 A8 8 0 1 1 17 4 Z" />
    ),
  },
  {
    id: 'mountain',
    name: 'Twin Peaks',
    paths: (
      <>
        <path d="M2 20 L8 9 L12 14 L16 7 L22 20 Z" />
        <path d="M6 14 L9 16 L11 14" opacity="0.5" />
      </>
    ),
  },
  {
    id: 'rune',
    name: 'Bound Rune',
    paths: (
      <>
        <path d="M6 4 L6 20 M18 4 L18 20 M6 12 L18 12" />
        <path d="M6 4 L18 4 M6 20 L18 20" opacity="0.5" />
      </>
    ),
  },
  {
    id: 'coin',
    name: 'Sovereign',
    paths: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M9 9 Q12 6 15 9 Q15 12 12 12 Q9 12 9 15 Q12 18 15 15" />
      </>
    ),
  },
];

export const DEFAULT_SIGIL_ID = 'eye';

export function getSigilDef(id: string | null | undefined): SigilDef {
  return SIGILS.find((s) => s.id === id) ?? SIGILS[0];
}

export function Sigil({
  id,
  size = 24,
  className,
  title,
}: {
  id: string | null | undefined;
  size?: number;
  className?: string;
  title?: string;
}) {
  const def = getSigilDef(id);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-label={title ?? def.name}
      role="img"
    >
      {def.paths}
    </svg>
  );
}

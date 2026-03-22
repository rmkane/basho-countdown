/**
 * Reference copy for the home page sidebar — keep aligned with `urlTheme.ts` parsing.
 */

export type SidebarColorParam = {
  key: string
  description: string
  /** Merged into the URL when “Try it” is clicked */
  tryParams: Record<string, string>
}

export const sidebarColorParams: SidebarColorParam[] = [
  { key: 'primary', description: 'Body text, names, countdown line', tryParams: { primary: 'FF6B6B' } },
  { key: 'secondary', description: 'Venues, dates, “until …” subtitle', tryParams: { secondary: '4ECDC4' } },
  {
    key: 'accent',
    description: 'Accent for buttons, focus, sidebar code keys, and card “Current/Next basho” titles unless cardTitle* is set',
    tryParams: { accent: 'FFE66D' },
  },
  { key: 'background', description: 'Page background', tryParams: { background: '1A1A2E' } },
  { key: 'surface', description: 'Card background', tryParams: { surface: '16213E' } },
  { key: 'border', description: 'Card borders', tryParams: { border: '0F3460' } },
  {
    key: 'accentSoft',
    description: 'Reserved for custom CSS (`--basho-color-accent-soft`)',
    tryParams: { accentSoft: '40FFE66D' },
  },
  { key: 'codeForeground', description: 'Code samples if you add any', tryParams: { codeForeground: '95E1D3' } },
  {
    key: 'cardTitleCurrent',
    description: '“Current basho” kicker — overrides accent for this line only',
    tryParams: { cardTitleCurrent: 'FFA07A' },
  },
  {
    key: 'cardTitleNext',
    description: '“Next basho” kicker — overrides accent (or cardTitleCurrent) for this line only',
    tryParams: { cardTitleNext: '87CEEB' },
  },
]

export type SidebarStringParam = {
  key: string
  description: string
  example?: string
  tryParams: Record<string, string>
  /** Second “Try it” (e.g. `font` shorthand) */
  tryAlt?: { label: string; tryParams: Record<string, string> }
}

export const sidebarStringParams: SidebarStringParam[] = [
  {
    key: 'cardShadow',
    description: 'Card `box-shadow` (URL-encode spaces)',
    example: '0+4px+24px+rgba(0%2C0%2C0%2C0.45)',
    tryParams: { cardShadow: '0 8px 32px rgba(255, 107, 107, 0.25)' },
  },
  { key: 'radius', description: 'Card corner radius', example: '12px', tryParams: { radius: '20px' } },
  {
    key: 'fontFamily',
    description: 'Full CSS font stack',
    example: '%22Times+New+Roman%22%2C+serif',
    tryParams: { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
    tryAlt: { label: 'font=', tryParams: { font: 'Georgia, serif' } },
  },
]

export type SidebarWidgetParam = {
  keys: string[]
  description: string
  example?: string
  tryParams: Record<string, string>
  tryRemoveKeys?: string[]
}

export const sidebarWidgetParams: SidebarWidgetParam[] = [
  {
    keys: ['countdownTotalDaysOnly', 'daysOnly'],
    description: 'Countdown uses total days only (≥1 day). Truthy: 1, true, yes',
    example: 'daysOnly=1',
    tryParams: { daysOnly: '1' },
  },
  {
    keys: ['alwaysShowNext'],
    description: 'Hide current-basho card when in tournament',
    example: 'alwaysShowNext=1',
    tryParams: { alwaysShowNext: '1' },
  },
  {
    keys: ['badge'],
    description: 'Image under public/ (filename only). Empty or 0 removes badge when set',
    example: 'badge=lil-origami-color.svg',
    tryParams: { badge: 'lil-origami-color.svg' },
    tryRemoveKeys: ['nobadge', 'noBadge'],
  },
  {
    keys: ['nobadge', 'noBadge'],
    description: 'No badge on countdown cards only (header image unchanged)',
    example: 'nobadge=1',
    tryParams: { nobadge: '1' },
    tryRemoveKeys: ['badge'],
  },
  {
    keys: ['badgeHeight'],
    description: 'Badge size',
    example: 'badgeHeight=3.35rem',
    tryParams: { badgeHeight: '4.25rem' },
  },
  {
    keys: ['badgeAlt'],
    description: 'Badge alt text',
    example: 'badgeAlt=Lil+Origami',
    tryParams: { badgeAlt: 'Origami rikishi' },
  },
]

export const sidebarFontNote =
  'Shorthand: use font=… instead of fontFamily if you prefer (ignored when fontFamily is set).'

/** Keys removed from the URL when a row’s **Clear** is used (per-section reset). */
export function clearKeysForColorRow(row: SidebarColorParam): string[] {
  return [row.key]
}

export function clearKeysForStringRow(row: SidebarStringParam): string[] {
  const keys = new Set<string>([row.key])
  if (row.tryAlt) {
    for (const k of Object.keys(row.tryAlt.tryParams)) keys.add(k)
  }
  return [...keys]
}

export function clearKeysForWidgetRow(row: SidebarWidgetParam): string[] {
  return [...row.keys, ...(row.tryRemoveKeys ?? [])]
}

import { CUSTOM_WIDGET_BASE } from './customWidgetDefaults'
import { mergeBashoTheme, type BashoTheme, type BashoThemeOverrides } from './theme'

const THEME_KEYS = [
  'primary',
  'secondary',
  'accent',
  'cardTitleCurrent',
  'cardTitleNext',
  'background',
  'surface',
  'border',
  'accentSoft',
  'codeForeground',
  'cardShadow',
  'radius',
  'fontFamily',
] as const

const COLOR_KEYS = new Set<string>([
  'primary',
  'secondary',
  'accent',
  'cardTitleCurrent',
  'cardTitleNext',
  'background',
  'surface',
  'border',
  'accentSoft',
  'codeForeground',
])

function normalizeColor(raw: string): string | undefined {
  const t = decodeURIComponent(raw).trim()
  const body = (t.startsWith('#') ? t.slice(1) : t).replace(/[^a-fA-F0-9]/g, '')
  if (body.length !== 3 && body.length !== 6 && body.length !== 8) return undefined
  return `#${body}`
}

/** Parse `?primary=CEFE1B&background=000` style params into theme overrides. */
export function themeOverridesFromSearchParams(params: URLSearchParams): BashoThemeOverrides {
  const o: BashoThemeOverrides = {}
  for (const key of THEME_KEYS) {
    const v = params.get(key)
    if (v == null || v === '') continue
    if (COLOR_KEYS.has(key)) {
      const c = normalizeColor(v)
      if (c) (o as Record<string, string>)[key] = c
    } else {
      ;(o as Record<string, string>)[key] = decodeURIComponent(v)
    }
  }
  /** Shorthand for `fontFamily` when that key is absent. */
  const fontShorthand = params.get('font')
  if (fontShorthand != null && fontShorthand !== '' && o.fontFamily == null) {
    o.fontFamily = decodeURIComponent(fontShorthand)
  }
  return o
}

function truthyParam(params: URLSearchParams, ...keys: string[]): boolean {
  for (const k of keys) {
    const v = (params.get(k) ?? '').toLowerCase()
    if (v === '1' || v === 'true' || v === 'yes') return true
  }
  return false
}

export function mergedCustomThemeFromSearch(search: string): BashoTheme {
  const params = new URLSearchParams(search)
  return mergeBashoTheme({
    ...CUSTOM_WIDGET_BASE,
    ...themeOverridesFromSearchParams(params),
  })
}

export type WidgetUrlOptions = {
  countdownTotalDaysOnly: boolean
  alwaysShowNext: boolean
  badgeSrc: string | undefined
  badgeHeight: string | undefined
  badgeAlt: string
}

/** Header branding image: ignores `nobadge` / `noBadge` (those only affect card badges). */
export function headerBadgeFromSearchParams(params: URLSearchParams): {
  src: string
  alt: string
  height: string
} {
  const b = params.get('badge')
  const src =
    b != null && b !== '' && b !== '0' ? `/${b.replace(/^\/+/, '')}` : '/lil-origami-color.svg'
  return {
    src,
    alt: params.get('badgeAlt') ?? 'Lil Origami',
    height: params.get('badgeHeight') ?? '3.35rem',
  }
}

export function widgetOptionsFromSearchParams(params: URLSearchParams): WidgetUrlOptions {
  const nobadge = truthyParam(params, 'nobadge', 'noBadge')
  let badgeSrc: string | undefined
  if (nobadge) {
    badgeSrc = undefined
  } else if (params.has('badge')) {
    const b = params.get('badge')
    badgeSrc =
      b == null || b === '' || b === '0'
        ? undefined
        : `/${b.replace(/^\/+/, '')}`
  } else {
    badgeSrc = '/lil-origami-color.svg'
  }

  return {
    countdownTotalDaysOnly:
      truthyParam(params, 'countdownTotalDaysOnly', 'daysOnly'),
    alwaysShowNext: truthyParam(params, 'alwaysShowNext'),
    badgeSrc,
    badgeHeight: params.get('badgeHeight') ?? '3.35rem',
    badgeAlt: params.get('badgeAlt') ?? 'Lil Origami',
  }
}

/**
 * Basho countdown theming: primary / secondary / accent colors, font, and layout tokens.
 * Merge {@link defaultBashoTheme} with overrides, then apply via {@link bashoThemeToInlineStyle} on a wrapper.
 */

export interface BashoTheme {
  /**
   * Main **foreground** (body text, card copy, countdown string).
   * Set this for “default text color” (e.g. `#000` on a light card).
   */
  primary: string
  /** Muted / secondary foreground (venues, dates, subtitles) */
  secondary: string
  /**
   * Accent: focus rings, home-page buttons, param keys in the sidebar, and the **“Current basho” /
   * “Next basho”** kickers unless you set {@link cardTitleCurrent} / {@link cardTitleNext}.
   */
  accent: string
  /**
   * “Current basho” kicker — defaults to {@link accent} when omitted from the merge input (not set in your partial theme object).
   */
  cardTitleCurrent: string
  /**
   * “Next basho” kicker — defaults to {@link cardTitleCurrent} when omitted from the merge input.
   */
  cardTitleNext: string
  /** Font stack (quote families with spaces) */
  fontFamily: string
  /** Page background */
  background: string
  /** Card / elevated panels */
  surface: string
  /** Default borders */
  border: string
  /** Soft accent tint — exposed as `--basho-color-accent-soft` for custom CSS */
  accentSoft: string
  /** `<pre>` code sample text */
  codeForeground: string
  /** Card drop shadow (any valid `box-shadow`) */
  cardShadow: string
  /** Corner radius for cards (e.g. `12px`) */
  radius: string
}

/** Default dark theme (matches previous hard-coded palette). */
export const defaultBashoTheme: BashoTheme = {
  primary: '#e8eef4',
  secondary: '#8b9cb3',
  accent: '#c94c4c',
  cardTitleCurrent: '#c94c4c',
  cardTitleNext: '#c94c4c',
  fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
  background: '#0f1419',
  surface: '#1a222d',
  border: '#2d3a4a',
  accentSoft: 'rgba(201, 76, 76, 0.15)',
  codeForeground: '#a8bdd4',
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.35)',
  radius: '12px',
}

/** Example light theme — swap in with `mergeBashoTheme(lightBashoThemeExample)` or pick fields. */
export const lightBashoThemeExample: Partial<BashoTheme> = {
  primary: '#0f172a',
  secondary: '#64748b',
  accent: '#b45309',
  cardTitleCurrent: '#b45309',
  cardTitleNext: '#b45309',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  accentSoft: 'rgba(180, 83, 9, 0.12)',
  codeForeground: '#334155',
  cardShadow: '0 4px 20px rgba(15, 23, 42, 0.08)',
  fontFamily: "Georgia, 'Times New Roman', serif",
}

/**
 * Deep-merge overrides onto defaults. Use for app shell or per-widget `theme` prop.
 *
 * @example
 * ```ts
 * const theme = mergeBashoTheme({
 *   accent: '#22c55e',
 *   fontFamily: "'DM Sans', sans-serif",
 * })
 * ```
 */
/** @deprecated Use `cardTitleCurrent` */
export type BashoThemeOverrides = Partial<BashoTheme> & { cardTitle?: string }

export function mergeBashoTheme(overrides: BashoThemeOverrides = {}): BashoTheme {
  const { cardTitle: legacyCardTitle, ...rest } = overrides
  const merged = { ...defaultBashoTheme, ...rest }
  const cardTitleCurrent =
    'cardTitleCurrent' in overrides
      ? merged.cardTitleCurrent
      : legacyCardTitle !== undefined
        ? legacyCardTitle
        : merged.accent
  const cardTitleNext = 'cardTitleNext' in overrides ? merged.cardTitleNext : cardTitleCurrent
  return { ...merged, cardTitleCurrent, cardTitleNext }
}

/** CSS custom property names consumed by `app.css` / widget styles. */
export function bashoThemeToCssVars(theme: BashoTheme): Record<string, string> {
  return {
    '--basho-color-primary': theme.primary,
    '--basho-color-secondary': theme.secondary,
    '--basho-color-accent': theme.accent,
    '--basho-color-card-title-current': theme.cardTitleCurrent,
    '--basho-color-card-title-next': theme.cardTitleNext,
    '--basho-font-family': theme.fontFamily,
    '--basho-color-background': theme.background,
    '--basho-color-surface': theme.surface,
    '--basho-color-border': theme.border,
    '--basho-color-accent-soft': theme.accentSoft,
    '--basho-color-code': theme.codeForeground,
    '--basho-shadow-card': theme.cardShadow,
    '--basho-radius': theme.radius,
  }
}

/** For Svelte `style={...}` on a wrapping element. */
export function bashoThemeToInlineStyle(theme: BashoTheme): string {
  return Object.entries(bashoThemeToCssVars(theme))
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ')
}

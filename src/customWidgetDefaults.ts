import type { BashoThemeOverrides } from './theme'

/** Body text / code on `/` and the “dark + lime” demo block — accent matches this by default. */
const DEMO_FOREGROUND = '#CEFE1B'

/** Default “custom” widget look for `/` — overridden by URL search params. */
export const CUSTOM_WIDGET_BASE: BashoThemeOverrides = {
  background: '#000000',
  surface: '#000000',
  primary: DEMO_FOREGROUND,
  secondary: '#9fb82e',
  /** Same as primary: kickers, buttons, sidebar keys unless URL sets cardTitle* / accent */
  accent: DEMO_FOREGROUND,
  accentSoft: 'rgba(246, 38, 103, 0.2)',
  border: '#2a2a2a',
  codeForeground: DEMO_FOREGROUND,
  cardShadow: '0 4px 24px rgba(0, 0, 0, 0.45)',
  radius: '12px',
  fontFamily: "'Times New Roman', Times, serif",
}

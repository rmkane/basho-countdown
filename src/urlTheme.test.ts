import { describe, expect, it } from 'vitest'
import { CUSTOM_WIDGET_BASE } from './customWidgetDefaults'
import {
  headerBadgeFromSearchParams,
  mergedCustomThemeFromSearch,
  themeOverridesFromSearchParams,
  widgetOptionsFromSearchParams,
} from './urlTheme'

describe('themeOverridesFromSearchParams', () => {
  it('parses hex colors with or without hash', () => {
    const p = new URLSearchParams('primary=CEFE1B&accent=%23ff00aa')
    const o = themeOverridesFromSearchParams(p)
    expect(o.primary).toBe('#CEFE1B')
    expect(o.accent).toBe('#ff00aa')
  })

  it('ignores invalid colors', () => {
    const p = new URLSearchParams('primary=not-a-color&secondary=abc123')
    const o = themeOverridesFromSearchParams(p)
    expect(o.primary).toBeUndefined()
    expect(o.secondary).toBe('#abc123')
  })
})

describe('mergedCustomThemeFromSearch', () => {
  it('starts from custom base and applies overrides', () => {
    const t = mergedCustomThemeFromSearch('?primary=ffffff')
    expect(t.background).toBe(CUSTOM_WIDGET_BASE.background)
    expect(t.primary).toBe('#ffffff')
  })

  it('ties card kickers to accent when base omits cardTitle* (URL accent only)', () => {
    const t = mergedCustomThemeFromSearch('?accent=F62667')
    expect(t.accent).toBe('#F62667')
    expect(t.cardTitleCurrent).toBe('#F62667')
    expect(t.cardTitleNext).toBe('#F62667')
  })

  it('allows separate kicker colors from accent via URL', () => {
    const t = mergedCustomThemeFromSearch(
      '?accent=ffffff&cardTitleCurrent=00ff00&cardTitleNext=0000ff'
    )
    expect(t.accent).toBe('#ffffff')
    expect(t.cardTitleCurrent).toBe('#00ff00')
    expect(t.cardTitleNext).toBe('#0000ff')
  })

  it('accepts font and fontFamily for font stack', () => {
    const a = mergedCustomThemeFromSearch('?font=system-ui%2C%20sans-serif')
    expect(a.fontFamily).toBe('system-ui, sans-serif')
    const b = mergedCustomThemeFromSearch(
      '?font=Arial&fontFamily=%22Times%20New%20Roman%22%2C%20serif'
    )
    expect(b.fontFamily).toBe('"Times New Roman", serif')
  })
})

describe('widgetOptionsFromSearchParams', () => {
  it('defaults badge and daysOnly', () => {
    const o = widgetOptionsFromSearchParams(new URLSearchParams(''))
    expect(o.badgeSrc).toBe('/lil-origami-color.svg')
    expect(o.countdownTotalDaysOnly).toBe(false)
  })

  it('respects daysOnly and nobadge', () => {
    const o = widgetOptionsFromSearchParams(new URLSearchParams('daysOnly=1&nobadge=1'))
    expect(o.countdownTotalDaysOnly).toBe(true)
    expect(o.badgeSrc).toBeUndefined()
  })
})

describe('headerBadgeFromSearchParams', () => {
  it('still provides a header src when nobadge hides card badges', () => {
    const h = headerBadgeFromSearchParams(new URLSearchParams('nobadge=1'))
    expect(h.src).toBe('/lil-origami-color.svg')
  })

  it('uses badge filename for header even with nobadge', () => {
    const h = headerBadgeFromSearchParams(
      new URLSearchParams('nobadge=1&badge=lil-origami.svg')
    )
    expect(h.src).toBe('/lil-origami.svg')
  })
})

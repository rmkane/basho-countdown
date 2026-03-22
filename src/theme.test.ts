import { describe, expect, it } from 'vitest'
import {
  bashoThemeToCssVars,
  bashoThemeToInlineStyle,
  defaultBashoTheme,
  mergeBashoTheme,
} from './theme'

describe('mergeBashoTheme', () => {
  it('fills defaults', () => {
    const t = mergeBashoTheme()
    expect(t.primary).toBe(defaultBashoTheme.primary)
    expect(t.accent).toBe(defaultBashoTheme.accent)
  })

  it('overrides selected keys', () => {
    const t = mergeBashoTheme({ accent: '#00ff00', fontFamily: 'Arial' })
    expect(t.accent).toBe('#00ff00')
    expect(t.fontFamily).toBe('Arial')
    expect(t.primary).toBe(defaultBashoTheme.primary)
  })

  it('ties card titles to accent when card title keys are omitted', () => {
    const t = mergeBashoTheme({ accent: '#ff00aa' })
    expect(t.cardTitleCurrent).toBe('#ff00aa')
    expect(t.cardTitleNext).toBe('#ff00aa')
  })

  it('uses cardTitleCurrent for next heading when only cardTitleCurrent is set', () => {
    const t = mergeBashoTheme({ cardTitleCurrent: '#cccccc' })
    expect(t.cardTitleCurrent).toBe('#cccccc')
    expect(t.cardTitleNext).toBe('#cccccc')
  })

  it('allows independent current and next heading colors', () => {
    const t = mergeBashoTheme({
      accent: '#111111',
      cardTitleCurrent: '#222222',
      cardTitleNext: '#333333',
    })
    expect(t.cardTitleCurrent).toBe('#222222')
    expect(t.cardTitleNext).toBe('#333333')
  })

  it('accepts deprecated cardTitle as alias for cardTitleCurrent', () => {
    const t = mergeBashoTheme({ cardTitle: '#abcdef' })
    expect(t.cardTitleCurrent).toBe('#abcdef')
    expect(t.cardTitleNext).toBe('#abcdef')
  })
})

describe('bashoThemeToCssVars', () => {
  it('emits expected custom property names', () => {
    const vars = bashoThemeToCssVars(defaultBashoTheme)
    expect(vars['--basho-color-primary']).toBe(defaultBashoTheme.primary)
    expect(vars['--basho-color-accent']).toBe(defaultBashoTheme.accent)
    expect(vars['--basho-color-card-title-current']).toBe(defaultBashoTheme.cardTitleCurrent)
    expect(vars['--basho-color-card-title-next']).toBe(defaultBashoTheme.cardTitleNext)
    expect(vars['--basho-font-family']).toBe(defaultBashoTheme.fontFamily)
  })
})

describe('bashoThemeToInlineStyle', () => {
  it('produces a non-empty inline style string', () => {
    const s = bashoThemeToInlineStyle(mergeBashoTheme({ accent: '#abc' }))
    expect(s).toContain('--basho-color-accent: #abc')
    expect(s).toContain('--basho-font-family:')
  })
})

import { describe, expect, it } from 'vitest'
import {
  type BashoCardModel,
  type BashoCardNext,
  formatElapsedAgo,
  formatRelativeTime,
  getBashoCountdownData,
  getBashoInfo,
  getBashoNameAndVenue,
  getClosestBashoDate,
  getNextBashoStart,
  normalizeConfig,
} from './basho-logic'

const locale = 'en-US'

function expectNextCard(cards: BashoCardModel[]): BashoCardNext {
  const next = cards.find((c): c is BashoCardNext => c.kind === 'next')
  expect(next).toBeDefined()
  return next!
}

describe('getNextBashoStart', () => {
  it('returns 10:00 JST on 2nd Sunday when still before that basho', () => {
    const ref = new Date('2025-01-01T12:00:00Z')
    expect(getNextBashoStart(ref).toISOString()).toBe('2025-01-12T01:00:00.000Z')
  })

  it('advances to the following basho after the current one has begun', () => {
    const ref = new Date('2025-01-20T12:00:00Z')
    expect(getNextBashoStart(ref).toISOString()).toBe('2025-03-09T01:00:00.000Z')
  })

  it('returns March basho when already in that month before start', () => {
    const ref = new Date('2025-03-05T12:00:00Z')
    expect(getNextBashoStart(ref).toISOString()).toBe('2025-03-09T01:00:00.000Z')
  })
})

describe('getClosestBashoDate', () => {
  it('returns 00:00 JST on the basho anchor day for January 2025', () => {
    const ref = new Date('2025-01-01T12:00:00Z')
    expect(getClosestBashoDate(ref).toISOString()).toBe('2025-01-11T15:00:00.000Z')
  })
})

describe('getBashoInfo', () => {
  it('marks tournament active with currentDay during Hatsu 2025', () => {
    const info = getBashoInfo(new Date('2025-01-14T12:00:00Z'))
    expect(info.isActive).toBe(true)
    expect(info.currentDay).toBe(4)
    expect(info.month).toBe(1)
    expect(info.bashoNumber).toBe(1)
  })

  it('is not active between bashos', () => {
    const info = getBashoInfo(new Date('2025-03-01T12:00:00Z'))
    expect(info.isActive).toBe(false)
    expect(info.currentDay).toBeUndefined()
  })
})

describe('getBashoNameAndVenue', () => {
  it('maps January to Hatsu', () => {
    expect(getBashoNameAndVenue(1)?.name).toBe('Hatsu Basho')
  })
})

describe('normalizeConfig', () => {
  it('applies defaults', () => {
    const c = normalizeConfig({})
    expect(c.referenceDate).toBeUndefined()
    expect(c.targetDate).toBeUndefined()
    expect(c.alwaysShowNext).toBe(false)
    expect(c.locale).toBe('en-US')
    expect(c.live).toBe(true)
    expect(c.tickMs).toBe(1000)
    expect(c.labelCurrentBasho).toBe('Current basho')
    expect(c.labelNextBasho).toBe('Next basho')
    expect(c.countdownTotalDaysOnly).toBe(false)
  })

  it('accepts custom card headings', () => {
    const c = normalizeConfig({
      labelCurrentBasho: 'Now playing',
      labelNextBasho: 'Upcoming',
    })
    expect(c.labelCurrentBasho).toBe('Now playing')
    expect(c.labelNextBasho).toBe('Upcoming')
  })

  it('parses ISO date strings', () => {
    const c = normalizeConfig({ referenceDate: '2025-06-01T00:00:00Z' })
    expect(c.referenceDate?.toISOString()).toBe('2025-06-01T00:00:00.000Z')
  })

  it('respects live: false', () => {
    expect(normalizeConfig({ live: false }).live).toBe(false)
  })
})

describe('formatElapsedAgo', () => {
  it('uses a single trailing “ago” for multi-part spans', () => {
    const earlier = new Date('2025-01-12T12:00:00Z')
    const later = new Date('2025-01-22T12:00:00Z')
    const s = formatElapsedAgo(earlier, later, locale)
    expect(s).toMatch(/ago$/)
    expect(s).not.toMatch(/ago,.*ago/)
    expect(s).toContain('1 week')
    expect(s).toContain('3 days')
  })

  it('totalDaysOnly uses total days without weeks', () => {
    const earlier = new Date('2025-01-12T12:00:00Z')
    const later = new Date('2025-01-22T12:00:00Z')
    const s = formatElapsedAgo(earlier, later, locale, { totalDaysOnly: true })
    expect(s).toMatch(/ago$/)
    expect(s).not.toMatch(/week/i)
    expect(s).toMatch(/10/)
    expect(s).toMatch(/day/i)
  })

  it('does not return raw multi-million second strings for long gaps', () => {
    const earlier = new Date('2025-01-12T01:00:00Z')
    const later = new Date('2026-03-22T12:00:00Z')
    const s = formatElapsedAgo(earlier, later, locale)
    expect(s).not.toMatch(/^\d{5,}/)
    expect(s).toMatch(/ago$/)
  })
})

describe('formatRelativeTime', () => {
  it('counts down toward a future target', () => {
    const now = new Date('2025-01-01T12:00:00Z')
    const target = new Date('2025-01-12T01:00:00.000Z')
    const s = formatRelativeTime(now, target, locale)
    expect(s).toMatch(/in |next |tomorrow|day|week|hour/i)
  })

  it('totalDaysOnly uses a single day count (no weeks) for long spans', () => {
    const now = new Date('2025-01-01T12:00:00Z')
    const target = new Date('2025-01-11T12:00:00Z')
    const s = formatRelativeTime(now, target, locale, { totalDaysOnly: true })
    expect(s).toMatch(/\d/)
    expect(s).not.toMatch(/week/i)
    expect(s).toMatch(/day/i)
  })
})

describe('getBashoCountdownData', () => {
  it('sets targetInPast and “ago” copy when target is before now', () => {
    const now = new Date('2026-03-22T12:00:00Z')
    const cfg = normalizeConfig({ targetDate: '2025-01-12T01:00:00Z', live: false })
    const { cards } = getBashoCountdownData(now, cfg)
    const next = expectNextCard(cards)
    expect(next.targetInPast).toBe(true)
    expect(next.countdownText).toMatch(/ago$/i)
    expect(next.dateRange).toMatch(/2025/)
  })

  it('uses formatRelativeTime when target is still ahead of now', () => {
    const now = new Date('2025-01-01T12:00:00Z')
    const cfg = normalizeConfig({ targetDate: '2025-01-12T01:00:00Z', live: false })
    const { cards } = getBashoCountdownData(now, cfg)
    const next = expectNextCard(cards)
    expect(next.targetInPast).toBe(false)
    expect(next.countdownText).not.toMatch(/ago$/i)
  })

  it('countdownTotalDaysOnly avoids week breakdown in countdown text', () => {
    const now = new Date('2025-01-01T12:00:00Z')
    const cfg = normalizeConfig({
      targetDate: '2025-01-11T12:00:00Z',
      live: false,
      countdownTotalDaysOnly: true,
    })
    const { cards } = getBashoCountdownData(now, cfg)
    const next = expectNextCard(cards)
    expect(next.countdownText).not.toMatch(/week/i)
    expect(next.countdownText).toMatch(/day/i)
  })

  it('omits current basho when alwaysShowNext', () => {
    const now = new Date('2025-01-14T12:00:00Z')
    const cfg = normalizeConfig({ alwaysShowNext: true, live: false })
    const { cards } = getBashoCountdownData(now, cfg)
    expect(cards.some((c) => c.kind === 'current')).toBe(false)
    expect(cards.filter((c) => c.kind === 'next')).toHaveLength(1)
  })

  it('includes current basho during tournament when not alwaysShowNext', () => {
    const now = new Date('2025-01-14T12:00:00Z')
    const cfg = normalizeConfig({ live: false })
    const { cards } = getBashoCountdownData(now, cfg)
    expect(cards.some((c) => c.kind === 'current')).toBe(true)
    expect(cards.some((c) => c.kind === 'next')).toBe(true)
  })

  it('uses labelCurrentBasho and labelNextBasho on cards', () => {
    const now = new Date('2025-01-14T12:00:00Z')
    const cfg = normalizeConfig({
      live: false,
      labelCurrentBasho: 'Honbasho now',
      labelNextBasho: 'Honbasho next',
    })
    const { cards } = getBashoCountdownData(now, cfg)
    const current = cards.find((c) => c.kind === 'current')
    const next = expectNextCard(cards)
    expect(current?.title).toBe('Honbasho now')
    expect(next.title).toBe('Honbasho next')
  })
})

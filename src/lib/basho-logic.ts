/**
 * Basho calendar + countdown logic (aligned with @sumo-banzuke/basho-utils + legacy NextBashoCountdown).
 */

const BASHO_DAYS = 15
const JST_OFFSET_HOURS = 9
const MS_PER_MINUTE = 60_000
const MS_PER_HOUR = 60 * MS_PER_MINUTE
const MS_PER_DAY = 24 * MS_PER_HOUR
const SEC_PER_MIN = 60
const SEC_PER_HOUR = 3600
const SEC_PER_DAY = 86400
const SEC_PER_60_DAYS = 60 * SEC_PER_DAY
const JST_TIMEZONE = 'Asia/Tokyo'

export type BashoMonthKey = 1 | 3 | 5 | 7 | 9 | 11

export const BASHO_DISPLAY: Record<BashoMonthKey, { name: string; venue: string }> = {
  1: { name: 'Hatsu Basho', venue: 'Ryōgoku Kokugikan, Tokyo' },
  3: { name: 'Haru (Spring) Basho', venue: 'Edion Arena, Osaka' },
  5: { name: 'Natsu (Summer) Basho', venue: 'Ryōgoku Kokugikan, Tokyo' },
  7: { name: 'Nagoya Basho', venue: 'Aichi Prefectural Gymnasium, Nagoya' },
  9: { name: 'Aki (Autumn) Basho', venue: 'Ryōgoku Kokugikan, Tokyo' },
  11: { name: 'Kyushu Basho', venue: 'Fukuoka Kokusai Center, Fukuoka' },
}

function addMonths(year: number, month: number, delta: number): { year: number; month: number } {
  let m = month + delta
  let y = year
  while (m > 11) {
    m -= 12
    y += 1
  }
  while (m < 0) {
    m += 12
    y -= 1
  }
  return { year: y, month: m }
}

function getSecondSunday(year: number, month: number, useUTC: boolean): number {
  const first = useUTC ? new Date(Date.UTC(year, month, 1)) : new Date(year, month, 1)
  const dayOfWeek = useUTC ? first.getUTCDay() : first.getDay()
  return dayOfWeek === 0 ? 8 : 15 - dayOfWeek
}

function dateAt00JST(year: number, month: number, day: number): Date {
  const msFirst = Date.UTC(year, month, 0, 15, 0, 0)
  return new Date(msFirst + (day - 1) * MS_PER_DAY)
}

function getJSTDate(date: Date = new Date()): Date {
  const utc = date.getTime() + date.getTimezoneOffset() * MS_PER_MINUTE
  return new Date(utc + JST_OFFSET_HOURS * MS_PER_HOUR)
}

export function getClosestBashoDate(date: Date = new Date()): Date {
  const jst = getJSTDate(date)
  let year = jst.getUTCFullYear()
  let month = jst.getUTCMonth()
  if (month % 2 === 1) {
    const next = addMonths(year, month, 1)
    year = next.year
    month = next.month
  }
  const secondSunday = getSecondSunday(year, month, true)
  return dateAt00JST(year, month, secondSunday)
}

/** Next basho start at 10:00 JST on the 2nd Sunday (same as basho-utils getNextBashoStart). */
export function getNextBashoStart(date: Date = new Date()): Date {
  const jstMs = date.getTime() + JST_OFFSET_HOURS * MS_PER_HOUR
  const jstCal = new Date(jstMs)
  let year = jstCal.getUTCFullYear()
  let month = jstCal.getUTCMonth()
  if (month % 2 === 1) {
    const next = addMonths(year, month, 1)
    year = next.year
    month = next.month
  }
  const secondSunday = getSecondSunday(year, month, true)
  const candidate = new Date(Date.UTC(year, month, secondSunday, 1, 0, 0))
  if (date.getTime() < candidate.getTime()) {
    return candidate
  }
  const { year: nextYear, month: nextMonth } = addMonths(year, month, 2)
  const nextSecondSunday = getSecondSunday(nextYear, nextMonth, true)
  return new Date(Date.UTC(nextYear, nextMonth, nextSecondSunday, 1, 0, 0))
}

export interface BashoInfo {
  startDate: Date
  endDate: Date
  year: number
  month: number
  bashoNumber: number
  isActive: boolean
  currentDay: number | undefined
}

export function getBashoInfo(date: Date): BashoInfo {
  const startDate = getClosestBashoDate(date)
  const endDate = new Date(startDate.getTime() + (BASHO_DAYS - 1) * MS_PER_DAY)
  const jstStart = getJSTDate(startDate)
  const year = jstStart.getUTCFullYear()
  const month = jstStart.getUTCMonth() + 1
  const bashoNumber = Math.floor((month - 1) / 2) + 1
  const jst = getJSTDate(date)
  const startOfTodayJST = dateAt00JST(jst.getUTCFullYear(), jst.getUTCMonth(), jst.getUTCDate())
  const diffDays = Math.floor((startOfTodayJST.getTime() - startDate.getTime()) / MS_PER_DAY)
  const isActive = diffDays >= 0 && diffDays < BASHO_DAYS
  const currentDay = isActive ? diffDays + 1 : undefined
  return { startDate, endDate, year, month, bashoNumber, isActive, currentDay }
}

export function getBashoNameAndVenue(month1to12: number): { name: string; venue: string } | undefined {
  if (month1to12 in BASHO_DISPLAY) {
    return BASHO_DISPLAY[month1to12 as BashoMonthKey]
  }
  return undefined
}

export function getMonthInJST(date: Date, locale = 'en-US'): number {
  const parts = new Intl.DateTimeFormat(locale, { month: 'numeric', timeZone: JST_TIMEZONE }).formatToParts(date)
  const m = parts.find((p) => p.type === 'month')
  return m ? parseInt(m.value, 10) : date.getMonth() + 1
}

export function formatMonthDayYearJST(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: JST_TIMEZONE,
  }).format(date)
}

export function formatDateTimeJST(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: JST_TIMEZONE,
  }).format(date)
}

function stripRelativePrefixSuffix(s: string): string {
  return s.replace(/^in /, '').replace(/ ago$/, '')
}

type RtfPart = { value: number; unit: Intl.RelativeTimeFormatUnit }

function formatRelativeTimeBreakdown(parts: RtfPart[], rtf: Intl.RelativeTimeFormat): string {
  const formatted = parts.filter((p) => p.value !== 0).map((p) => rtf.format(p.value, p.unit))
  if (formatted.length === 0) return rtf.format(0, 'second')
  if (formatted.length === 1) return formatted[0]
  const rest = formatted.slice(1).map(stripRelativePrefixSuffix)
  return [formatted[0], ...rest].join(', ')
}

/** Compound past tense: "1 week, 3 days, 5 hours ago" (avoids "1 week ago, 3 days"). */
function formatPastCompoundAgo(parts: RtfPart[], rtf: Intl.RelativeTimeFormat): string {
  const formatted = parts
    .filter((p) => p.value !== 0)
    .map((p) => rtf.format(p.value, p.unit).replace(/ ago$/, ''))
  if (formatted.length === 0) return rtf.format(0, 'second')
  if (formatted.length === 1) return `${formatted[0]} ago`
  return `${formatted.join(', ')} ago`
}

const RELATIVE_TIME_UNITS: readonly {
  threshold: number
  divisor: number
  name: Intl.RelativeTimeFormatUnit
}[] = [
  { threshold: 60, divisor: 60, name: 'second' },
  { threshold: 60, divisor: 60, name: 'minute' },
  { threshold: 24, divisor: 24, name: 'hour' },
  { threshold: 21, divisor: 7, name: 'day' },
  { threshold: 9, divisor: 4.34524, name: 'week' },
  { threshold: 12, divisor: 12, name: 'month' },
  { threshold: Number.POSITIVE_INFINITY, divisor: 1, name: 'year' },
]

export type RelativeTimeFormatOptions = {
  /** If true, show a single day count (no weeks/hours/minutes breakdown). */
  totalDaysOnly?: boolean
}

export function formatRelativeTime(
  from: Date,
  to: Date,
  locale = 'en-US',
  options?: RelativeTimeFormatOptions
): string {
  const diffMs = to.getTime() - from.getTime()
  if (options?.totalDaysOnly && Math.abs(diffMs) >= MS_PER_DAY) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
    const totalDays = Math.round(diffMs / MS_PER_DAY)
    return rtf.format(totalDays, 'day')
  }
  let diffSec = Math.round(diffMs / 1000)
  const totalSec = Math.abs(diffSec)
  const sign = diffSec < 0 ? -1 : 1
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (totalSec >= SEC_PER_MIN) {
    const days = Math.floor(totalSec / SEC_PER_DAY)
    const hours = Math.floor((totalSec % SEC_PER_DAY) / SEC_PER_HOUR)
    const minutes = Math.floor((totalSec % SEC_PER_HOUR) / SEC_PER_MIN)
    const seconds = totalSec % SEC_PER_MIN

    if (totalSec >= SEC_PER_DAY && totalSec < SEC_PER_60_DAYS) {
      const weeks = Math.floor(days / 7)
      const daysRem = days % 7
      const parts: RtfPart[] = []
      if (weeks > 0) parts.push({ value: sign * weeks, unit: 'week' })
      parts.push(
        { value: sign * daysRem, unit: 'day' },
        { value: sign * hours, unit: 'hour' },
        { value: sign * minutes, unit: 'minute' }
      )
      return formatRelativeTimeBreakdown(parts, rtf)
    }
    if (totalSec >= SEC_PER_HOUR && totalSec < SEC_PER_DAY) {
      return formatRelativeTimeBreakdown(
        [
          { value: sign * hours, unit: 'hour' },
          { value: sign * minutes, unit: 'minute' },
          { value: sign * seconds, unit: 'second' },
        ],
        rtf
      )
    }
    if (totalSec >= SEC_PER_MIN && totalSec < SEC_PER_HOUR) {
      return formatRelativeTimeBreakdown(
        [
          { value: sign * minutes, unit: 'minute' },
          { value: sign * seconds, unit: 'second' },
        ],
        rtf
      )
    }
  }

  let duration = diffSec
  for (const division of RELATIVE_TIME_UNITS) {
    if (Math.abs(duration) < division.threshold) {
      return rtf.format(Math.round(duration), division.name)
    }
    duration /= division.divisor
  }
  return rtf.format(Math.round(duration), 'year')
}

/**
 * How long `earlier` was before `later` (both instants), as a clear "… ago" phrase.
 * Uses `numeric: 'always'` so past events never read like a future countdown (e.g. "next week, …").
 */
export function formatElapsedAgo(
  earlier: Date,
  later: Date,
  locale = 'en-US',
  options?: RelativeTimeFormatOptions
): string {
  const diffSec = Math.round((later.getTime() - earlier.getTime()) / 1000)
  if (diffSec < 1) {
    return new Intl.RelativeTimeFormat(locale, { numeric: 'auto' }).format(0, 'second')
  }
  if (options?.totalDaysOnly && diffSec >= SEC_PER_DAY) {
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
    const days = Math.floor(diffSec / SEC_PER_DAY)
    return rtf.format(-days, 'day')
  }
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'always' })
  const totalSec = diffSec
  const days = Math.floor(totalSec / SEC_PER_DAY)
  const hours = Math.floor((totalSec % SEC_PER_DAY) / SEC_PER_HOUR)
  const minutes = Math.floor((totalSec % SEC_PER_HOUR) / SEC_PER_MIN)
  const seconds = totalSec % SEC_PER_MIN

  if (totalSec >= SEC_PER_DAY && totalSec < SEC_PER_60_DAYS) {
    const weeks = Math.floor(days / 7)
    const daysRem = days % 7
    const parts: RtfPart[] = []
    if (weeks > 0) parts.push({ value: -weeks, unit: 'week' })
    parts.push(
      { value: -daysRem, unit: 'day' },
      { value: -hours, unit: 'hour' },
      { value: -minutes, unit: 'minute' }
    )
    return formatPastCompoundAgo(parts, rtf)
  }
  if (totalSec >= SEC_PER_HOUR && totalSec < SEC_PER_DAY) {
    return formatPastCompoundAgo(
      [
        { value: -hours, unit: 'hour' },
        { value: -minutes, unit: 'minute' },
        { value: -seconds, unit: 'second' },
      ],
      rtf
    )
  }
  if (totalSec >= SEC_PER_MIN && totalSec < SEC_PER_HOUR) {
    return formatPastCompoundAgo(
      [
        { value: -minutes, unit: 'minute' },
        { value: -seconds, unit: 'second' },
      ],
      rtf
    )
  }
  if (totalSec >= SEC_PER_60_DAYS) {
    let duration = -totalSec
    for (const division of RELATIVE_TIME_UNITS) {
      if (Math.abs(duration) < division.threshold) {
        return rtf.format(Math.round(duration), division.name)
      }
      duration /= division.divisor
    }
    return rtf.format(Math.round(duration), 'year')
  }
  return rtf.format(-totalSec, 'second')
}

export interface BashoCountdownConfigInput {
  referenceDate?: Date | string
  targetDate?: Date | string
  alwaysShowNext?: boolean
  locale?: string
  live?: boolean
  tickMs?: number
  /** Uppercase card heading when the current basho card is shown (default: `Current basho`). */
  labelCurrentBasho?: string
  /** Uppercase card heading for the next basho card (default: `Next basho`). */
  labelNextBasho?: string
  /**
   * If true, next-card countdown / “ago” text uses **total days** only (via `Intl.RelativeTimeFormat`),
   * not weeks + days + hours, etc.
   */
  countdownTotalDaysOnly?: boolean
}

function parseDate(value: Date | string | null | undefined): Date | undefined {
  if (value == null) return undefined
  if (value instanceof Date) return new Date(value.getTime())
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

export interface NormalizedBashoConfig {
  referenceDate: Date | undefined
  targetDate: Date | undefined
  alwaysShowNext: boolean
  locale: string
  live: boolean
  tickMs: number
  labelCurrentBasho: string
  labelNextBasho: string
  countdownTotalDaysOnly: boolean
}

export function normalizeConfig(config: BashoCountdownConfigInput = {}): NormalizedBashoConfig {
  return {
    referenceDate: parseDate(config.referenceDate),
    targetDate: parseDate(config.targetDate),
    alwaysShowNext: Boolean(config.alwaysShowNext),
    locale: config.locale ?? 'en-US',
    live: config.live !== false,
    tickMs: typeof config.tickMs === 'number' ? config.tickMs : 1000,
    labelCurrentBasho: config.labelCurrentBasho ?? 'Current basho',
    labelNextBasho: config.labelNextBasho ?? 'Next basho',
    countdownTotalDaysOnly: Boolean(config.countdownTotalDaysOnly),
  }
}

export interface BashoCardCurrent {
  kind: 'current'
  title: string
  name?: string
  venue?: string
  dateRange: string
  dayLine: string
  sub: string
}

export interface BashoCardNext {
  kind: 'next'
  title: string
  name?: string
  venue?: string
  dateRange: string
  countdownText: string
  untilText: string
  targetInPast: boolean
}

export type BashoCardModel = BashoCardCurrent | BashoCardNext

export function getBashoCountdownData(
  now: Date,
  cfg: NormalizedBashoConfig
): { cards: BashoCardModel[] } {
  const locale = cfg.locale
  const bashoInfo = getBashoInfo(now)
  const target = cfg.targetDate ?? getNextBashoStart(now)
  const nextEndDate = new Date(target.getTime() + 14 * MS_PER_DAY)

  const cards: BashoCardModel[] = []

  const currentDay = bashoInfo.currentDay
  const showCurrent =
    !cfg.alwaysShowNext && bashoInfo.isActive && currentDay != null
  if (showCurrent) {
    const display = getBashoNameAndVenue(bashoInfo.month)
    const daysLeft = 15 - currentDay
    const sub =
      daysLeft === 0 ? 'Final day' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`
    const range = `${formatMonthDayYearJST(bashoInfo.startDate, locale)} – ${formatMonthDayYearJST(bashoInfo.endDate, locale)}`
    cards.push({
      kind: 'current',
      title: cfg.labelCurrentBasho,
      name: display?.name,
      venue: display?.venue,
      dateRange: range,
      dayLine: `Day ${currentDay} of 15`,
      sub,
    })
  }

  const nextDisplay = getBashoNameAndVenue(getMonthInJST(target, locale))
  const targetInPast = now.getTime() >= target.getTime()
  const timeOpts = cfg.countdownTotalDaysOnly ? { totalDaysOnly: true as const } : undefined
  const countdownText = targetInPast
    ? formatElapsedAgo(target, now, locale, timeOpts)
    : formatRelativeTime(now, target, locale, timeOpts)
  const untilText = formatDateTimeJST(target, locale)
  const nextRange = `${formatMonthDayYearJST(target, locale)} – ${formatMonthDayYearJST(nextEndDate, locale)}`
  cards.push({
    kind: 'next',
    title: cfg.labelNextBasho,
    name: nextDisplay?.name,
    venue: nextDisplay?.venue,
    dateRange: nextRange,
    countdownText,
    untilText,
    targetInPast,
  })

  return { cards }
}

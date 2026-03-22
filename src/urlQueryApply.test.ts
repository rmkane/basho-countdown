import { describe, expect, it } from 'vitest'
import { buildUrlWithQueryPatch, searchHasAnyQueryKey } from './urlQueryApply'

describe('buildUrlWithQueryPatch', () => {
  it('merges params and keeps others', () => {
    const u = buildUrlWithQueryPatch('/foo', '?primary=abc&other=1', { primary: 'FF00AA' })
    expect(u.startsWith('/foo?')).toBe(true)
    const q = new URLSearchParams(u.split('?')[1])
    expect(q.get('primary')).toBe('FF00AA')
    expect(q.get('other')).toBe('1')
  })

  it('removes listed keys', () => {
    const u = buildUrlWithQueryPatch('/foo', '?badge=x&nobadge=1', { badge: 'a.svg' }, ['nobadge', 'noBadge'])
    expect(u).toContain('badge=a.svg')
    expect(u).not.toContain('nobadge')
  })
})

describe('searchHasAnyQueryKey', () => {
  it('returns false for empty keys', () => {
    expect(searchHasAnyQueryKey('?a=1', [])).toBe(false)
  })

  it('detects keys with or without leading ?', () => {
    expect(searchHasAnyQueryKey('?primary=ff&other=1', ['primary'])).toBe(true)
    expect(searchHasAnyQueryKey('primary=ff', ['primary'])).toBe(true)
    expect(searchHasAnyQueryKey('?primary=ff', ['missing'])).toBe(false)
  })
})

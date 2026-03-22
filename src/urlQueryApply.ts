/**
 * Build a new URL path+search by merging `patch` into the current query string.
 */
export function buildUrlWithQueryPatch(
  pathname: string,
  currentSearch: string,
  patch: Record<string, string>,
  removeKeys: string[] = []
): string {
  const params = new URLSearchParams(currentSearch.startsWith('?') ? currentSearch.slice(1) : currentSearch)
  for (const k of removeKeys) {
    params.delete(k)
  }
  for (const [k, v] of Object.entries(patch)) {
    params.set(k, v)
  }
  const q = params.toString()
  return q ? `${pathname}?${q}` : pathname
}

/** True if `search` includes at least one of `keys` as a query parameter (any value). */
export function searchHasAnyQueryKey(search: string, keys: string[]): boolean {
  if (keys.length === 0) return false
  const raw = search.startsWith('?') ? search.slice(1) : search
  const params = new URLSearchParams(raw)
  return keys.some((k) => params.has(k))
}

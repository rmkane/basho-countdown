<script lang="ts">
  import { onMount } from 'svelte'
  import BashoCountdown from '$lib/BashoCountdown.svelte'
  import { bashoThemeToInlineStyle } from './theme'
  import {
    headerBadgeFromSearchParams,
    mergedCustomThemeFromSearch,
    widgetOptionsFromSearchParams,
  } from './urlTheme'
  import {
    clearKeysForColorRow,
    clearKeysForStringRow,
    clearKeysForWidgetRow,
    sidebarColorParams,
    sidebarFontNote,
    sidebarStringParams,
    sidebarWidgetParams,
  } from './urlConfigReference'
  import { buildUrlWithQueryPatch, searchHasAnyQueryKey } from './urlQueryApply'

  /** Re-read query string on back/forward and after “Try it” patches. */
  let navTick = $state(0)
  onMount(() => {
    const bump = () => {
      navTick += 1
    }
    window.addEventListener('popstate', bump)
    return () => window.removeEventListener('popstate', bump)
  })

  function applyTry(patch: Record<string, string>, removeKeys: string[] = []) {
    if (typeof window === 'undefined') return
    const next = buildUrlWithQueryPatch(
      window.location.pathname,
      window.location.search,
      patch,
      removeKeys
    )
    history.pushState(null, '', next)
    navTick += 1
  }

  function clearRow(keys: string[]) {
    applyTry({}, keys)
  }

  function rowClearDisabled(keys: string[]): boolean {
    navTick
    if (typeof window === 'undefined') return true
    return !searchHasAnyQueryKey(window.location.search, keys)
  }

  const page = $derived.by(() => {
    navTick
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const params = new URLSearchParams(search)
    const merged = mergedCustomThemeFromSearch(search)
    const opts = widgetOptionsFromSearchParams(params)
    const headerBadge = headerBadgeFromSearchParams(params)
    return {
      pageStyle: bashoThemeToInlineStyle(merged),
      theme: merged,
      opts,
      headerBadge,
    }
  })
</script>

<div class="basho-countdown-page basho-countdown-home" style={page.pageStyle}>
  <header class="basho-countdown-home__header">
    <div class="basho-countdown-home__header-inner">
      <div class="basho-countdown-home__header-brand">
        <img
          class="basho-countdown-home__header-badge"
          src={page.headerBadge.src}
          alt={page.headerBadge.alt}
          style:height={page.headerBadge.height}
        />
        <div class="basho-countdown-home__header-text">
          <h1 class="basho-countdown-home__title">Basho countdown</h1>
          <p class="basho-countdown-home__tagline">
            Live honbasho dates — theme this page with URL query parameters.
          </p>
        </div>
      </div>
      <nav class="basho-countdown-home__nav" aria-label="Site">
        <a class="basho-countdown-home__btn" href="/demo">Component demos</a>
        <a
          class="basho-countdown-home__btn"
          href={typeof window !== 'undefined' ? window.location.pathname : '/'}
        >
          Clear params
        </a>
      </nav>
    </div>
  </header>

  <div class="basho-countdown-home__layout">
    <div class="basho-countdown-home__left">
      <main class="basho-countdown-home__main">
        <BashoCountdown
          theme={page.theme}
          badgeSrc={page.opts.badgeSrc}
          badgeAlt={page.opts.badgeAlt}
          badgeHeight={page.opts.badgeHeight}
          countdownTotalDaysOnly={page.opts.countdownTotalDaysOnly}
          alwaysShowNext={page.opts.alwaysShowNext}
        />
      </main>
    </div>

    <aside class="basho-countdown-home__sidebar" aria-label="URL query configuration">
      <h2 class="basho-countdown-home__sidebar-title">Configuration</h2>
      <p class="basho-countdown-home__sidebar-lead">
        Add query params to this page’s URL. Hex colors work with or without <code>#</code>. Expand a
        section below — each row has <strong>Try example</strong> (merges into the URL) and
        <strong>Clear</strong> (removes that row’s params). Use <strong>Clear params</strong> in the header
        to strip the whole query string.
      </p>

      <details class="basho-countdown-home__accordion">
        <summary class="basho-countdown-home__accordion-summary">
          <span class="basho-countdown-home__accordion-title">Theme colors</span>
        </summary>
        <div class="basho-countdown-home__accordion-panel">
          <ul class="basho-countdown-home__param-list">
            {#each sidebarColorParams as row}
              {@const clearKeys = clearKeysForColorRow(row)}
              <li>
                <code class="basho-countdown-home__param-key">{row.key}</code>
                <span class="basho-countdown-home__param-desc">{row.description}</span>
                <div class="basho-countdown-home__param-actions">
                  <button
                    type="button"
                    class="basho-countdown-home__try-btn"
                    onclick={() => applyTry(row.tryParams)}
                  >
                    Try example
                  </button>
                  <button
                    type="button"
                    class="basho-countdown-home__try-btn basho-countdown-home__try-btn--clear"
                    onclick={() => clearRow(clearKeys)}
                    disabled={rowClearDisabled(clearKeys)}
                  >
                    Clear
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </details>

      <details class="basho-countdown-home__accordion">
        <summary class="basho-countdown-home__accordion-summary">
          <span class="basho-countdown-home__accordion-title">Theme (text / CSS)</span>
        </summary>
        <div class="basho-countdown-home__accordion-panel">
          <ul class="basho-countdown-home__param-list">
            {#each sidebarStringParams as row}
              {@const clearKeys = clearKeysForStringRow(row)}
              <li>
                <code class="basho-countdown-home__param-key">{row.key}</code>
                <span class="basho-countdown-home__param-desc">{row.description}</span>
                {#if row.example}
                  <div class="basho-countdown-home__param-ex">
                    e.g. <code>{row.example}</code>
                  </div>
                {/if}
                <div class="basho-countdown-home__param-actions">
                  <button
                    type="button"
                    class="basho-countdown-home__try-btn"
                    onclick={() => applyTry(row.tryParams)}
                  >
                    Try example
                  </button>
                  {#if row.tryAlt}
                    {@const alt = row.tryAlt}
                    <button
                      type="button"
                      class="basho-countdown-home__try-btn"
                      onclick={() => applyTry(alt.tryParams)}
                    >
                      Try {alt.label}
                    </button>
                  {/if}
                  <button
                    type="button"
                    class="basho-countdown-home__try-btn basho-countdown-home__try-btn--clear"
                    onclick={() => clearRow(clearKeys)}
                    disabled={rowClearDisabled(clearKeys)}
                  >
                    Clear
                  </button>
                </div>
              </li>
            {/each}
          </ul>
          <p class="basho-countdown-home__sidebar-note">{sidebarFontNote}</p>
        </div>
      </details>

      <details class="basho-countdown-home__accordion">
        <summary class="basho-countdown-home__accordion-summary">
          <span class="basho-countdown-home__accordion-title">Widget flags</span>
        </summary>
        <div class="basho-countdown-home__accordion-panel">
          <ul class="basho-countdown-home__param-list">
            {#each sidebarWidgetParams as row}
              {@const clearKeys = clearKeysForWidgetRow(row)}
              <li>
                <code class="basho-countdown-home__param-key">{row.keys.join(', ')}</code>
                <span class="basho-countdown-home__param-desc">{row.description}</span>
                {#if row.example}
                  <div class="basho-countdown-home__param-ex">
                    e.g. <code>{row.example}</code>
                  </div>
                {/if}
                <div class="basho-countdown-home__param-actions">
                  <button
                    type="button"
                    class="basho-countdown-home__try-btn"
                    onclick={() => applyTry(row.tryParams, row.tryRemoveKeys ?? [])}
                  >
                    Try example
                  </button>
                  <button
                    type="button"
                    class="basho-countdown-home__try-btn basho-countdown-home__try-btn--clear"
                    onclick={() => clearRow(clearKeys)}
                    disabled={rowClearDisabled(clearKeys)}
                  >
                    Clear
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      </details>

    </aside>
  </div>

  <footer class="basho-countdown-home__page-footer">
    <div class="basho-countdown-home__page-footer-inner">
      <p class="basho-countdown-home__footer-copy">
        <strong>Basho countdown</strong> — Svelte widget + basho calendar logic. Build with
        <code>pnpm run build</code>, serve <code>dist/</code> (e.g. <code>go run .</code>).
      </p>
    </div>
  </footer>
</div>

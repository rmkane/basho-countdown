<script lang="ts">
  import BashoCard from './BashoCard.svelte'
  import { getBashoCountdownData, normalizeConfig, type BashoCountdownConfigInput } from './basho-logic'
  import { bashoThemeToInlineStyle, mergeBashoTheme, type BashoTheme } from '../theme'

  function hasFixedReference(d: Date | string | undefined): boolean {
    if (d == null || d === '') return false
    const x = d instanceof Date ? d : new Date(d)
    return !Number.isNaN(x.getTime())
  }

  export type BashoCountdownProps = BashoCountdownConfigInput & {
    theme?: Partial<BashoTheme>
    /** Shown inside **each** card, top-right (e.g. `/badge.svg` from `public/`). */
    badgeSrc?: string
    badgeAlt?: string
    badgeHeight?: string
  }

  let {
    referenceDate = undefined,
    targetDate = undefined,
    alwaysShowNext = false,
    locale = 'en-US',
    live = true,
    tickMs = 1000,
    labelCurrentBasho = undefined,
    labelNextBasho = undefined,
    countdownTotalDaysOnly = false,
    theme = undefined,
    badgeSrc = undefined,
    badgeAlt = '',
    badgeHeight = '3rem',
  }: BashoCountdownProps = $props()

  const cfg = $derived(
    normalizeConfig({
      referenceDate,
      targetDate,
      alwaysShowNext,
      locale,
      live,
      tickMs,
      labelCurrentBasho,
      labelNextBasho,
      countdownTotalDaysOnly,
    })
  )

  const rootStyle = $derived(
    theme != null ? bashoThemeToInlineStyle(mergeBashoTheme(theme)) : undefined
  )

  /** Bumps on interval so live mode re-reads `new Date()`. */
  let refresh = $state(0)

  $effect(() => {
    if (!live || hasFixedReference(referenceDate)) return
    const id = setInterval(() => {
      refresh += 1
    }, tickMs)
    return () => clearInterval(id)
  })

  const data = $derived.by(() => {
    refresh
    const now = cfg.referenceDate
      ? new Date(cfg.referenceDate.getTime())
      : new Date()
    return getBashoCountdownData(now, cfg)
  })
</script>

<div class="basho-countdown" style={rootStyle}>
  <div class="basho-countdown__cards">
    {#each data.cards as card, i (card.kind + '-' + i)}
      <BashoCard {card} badgeSrc={badgeSrc} badgeAlt={badgeAlt} {badgeHeight} />
    {/each}
  </div>
</div>

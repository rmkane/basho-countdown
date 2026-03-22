<script lang="ts">
  import type { BashoCardModel } from './basho-logic'

  let {
    card,
    badgeSrc = undefined,
    badgeAlt = '',
    badgeHeight = '3rem',
  }: {
    card: BashoCardModel
    badgeSrc?: string
    badgeAlt?: string
    badgeHeight?: string
  } = $props()

  const hasBadge = $derived(Boolean(badgeSrc))
</script>

<article
  class="basho-card"
  class:basho-card--current={card.kind === 'current'}
  class:basho-card--next={card.kind === 'next'}
  class:basho-card--has-badge={hasBadge}
  style={hasBadge ? `--basho-badge-height: ${badgeHeight}` : undefined}
>
  {#if badgeSrc}
    <img class="basho-card__badge" src={badgeSrc} alt={badgeAlt} />
  {/if}
  <h2 class="basho-card__title">{card.title}</h2>
  {#if card.name}
    <p class="basho-card__name">{card.name}</p>
  {/if}
  {#if card.venue}
    <p class="basho-card__venue">{card.venue}</p>
  {/if}
  {#if card.dateRange}
    <p class="basho-card__dates">{card.dateRange}</p>
  {/if}
  <div class="basho-card__body">
    {#if card.kind === 'current'}
      <p class="basho-card__dayline">{card.dayLine}</p>
    {:else}
      <p class="basho-card__countdown" title={card.countdownText}>{card.countdownText}</p>
    {/if}
  </div>
  {#if card.kind === 'current'}
    <p class="basho-card__sub">{card.sub}</p>
  {:else if card.targetInPast}
    <p class="basho-card__sub">Date is in the past</p>
  {:else}
    <p class="basho-card__sub">until {card.untilText}</p>
  {/if}
</article>

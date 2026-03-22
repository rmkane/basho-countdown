<script lang="ts">
  import BashoCountdown from '$lib/BashoCountdown.svelte'
  import { getClosestBashoDate } from '$lib/basho-logic'
  import { CUSTOM_WIDGET_BASE } from './customWidgetDefaults'
  import { bashoThemeToInlineStyle, mergeBashoTheme } from './theme'

  const appTheme = mergeBashoTheme({})
  const pageThemeStyle = bashoThemeToInlineStyle(appTheme)

  const customWidgetTheme = mergeBashoTheme(CUSTOM_WIDGET_BASE)

  const MS_PER_DAY = 86400000

  const simNow = new Date()
  simNow.setUTCHours(12, 0, 0, 0)
  simNow.setUTCDate(simNow.getUTCDate() - 6)
  const simTarget = new Date(simNow.getTime() + 10 * MS_PER_DAY)

  const bashoStart = getClosestBashoDate(new Date())
  const midBashoRef = new Date(bashoStart.getTime() + 7 * MS_PER_DAY)
</script>

<div class="basho-countdown-page basho-countdown-demo-page" style={pageThemeStyle}>
  <div class="basho-countdown-demo-page__inner">
    <p class="basho-countdown-demo-nav">
      <a href="/">← Custom widget (home)</a>
    </p>
    <h1>Basho countdown</h1>
    <p class="lead">
      Svelte + Vite demo: <strong>current basho</strong> during a tournament, otherwise
      <strong>next basho</strong> with a live relative countdown. Theming: set CSS variables via
      <code>mergeBashoTheme</code> in <code>DemoPage.svelte</code> or pass <code>theme=&#123;&#123; … &#125;&#125;</code> to
      <code>BashoCountdown</code>.
    </p>
    <p class="basho-countdown-hint">
      <strong>Production:</strong> run <code>pnpm run build</code>, then serve the
      <code>dist/</code> folder (e.g. <code>go run .</code> in this directory).
    </p>

    <div class="basho-countdown-demo">
      <div class="basho-countdown-demo__block">
        <h2>Default (live clock)</h2>
        <BashoCountdown />
        <pre>&lt;BashoCountdown /&gt;</pre>
      </div>

      <div class="basho-countdown-demo__block">
        <h2>Per-widget theme (dark + lime)</h2>
        <p class="basho-countdown-demo__note">
          Same defaults as <a href="/">/</a> — use <code>customWidgetDefaults.ts</code> + URL params on the home page.
        </p>
        <BashoCountdown
          theme={customWidgetTheme}
          badgeSrc="/lil-origami-color.svg"
          badgeAlt="Lil Origami"
          badgeHeight="3.35rem"
          countdownTotalDaysOnly
        />
        <pre>
          badgeSrc="/lil-origami-color.svg" — static files live in <code>public/</code>; optional
          <code>badgeHeight</code>, <code>countdownTotalDaysOnly</code>
        </pre>
      </div>

      <div class="basho-countdown-demo__block">
        <h2>Always next only</h2>
        <BashoCountdown alwaysShowNext />
        <pre>&lt;BashoCountdown alwaysShowNext /&gt;</pre>
      </div>

      <div class="basho-countdown-demo__block">
        <h2>Simulated clock + custom target</h2>
        <p class="basho-countdown-demo__note">
          <code>referenceDate</code> and <code>targetDate</code> are built from <strong>today</strong> (frozen
          at page load). A fixed 2025-01-12 target with a 2025 reference would always look “soon” even in
          2026 — that was the bug.
        </p>
        <BashoCountdown
          referenceDate={simNow.toISOString()}
          targetDate={simTarget.toISOString()}
          live={false}
        />
        <pre>referenceDate + targetDate (ISO from script), live=&#123;false&#125;</pre>
      </div>

      <div class="basho-countdown-demo__block">
        <h2>Mid-basho snapshot</h2>
        <p class="basho-countdown-demo__note">
          <code>referenceDate</code> ≈ day 8 of the basho returned by <code>getClosestBashoDate(new Date())</code>.
        </p>
        <BashoCountdown referenceDate={midBashoRef.toISOString()} live={false} />
        <pre>referenceDate during tournament, live=&#123;false&#125;</pre>
      </div>

      <div class="basho-countdown-demo__block">
        <h2>Past basho start (real clock)</h2>
        <p class="basho-countdown-demo__note">
          Hard-coded 2025 start with <strong>live</strong> updates: wall-clock <code>now</code> is after the
          target, so you should see “… ago” and “Date is in the past”.
        </p>
        <BashoCountdown targetDate="2025-01-12T01:00:00Z" />
        <pre>targetDate in the past, default live</pre>
      </div>
    </div>
  </div>
</div>

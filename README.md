# Basho countdown (Svelte + Vite + TypeScript)

Demo app aligned with the monorepo’s basho calendar and legacy countdown behavior. The widget is **`BashoCountdown.svelte`**; calendar math lives in **`src/lib/basho-logic.ts`**.

- **`/`** — custom-themed widget only; **query-string overrides** for colors and options (see below).
- **`/demo`** — full multi-block demo page (former home).

Uses **[pnpm](https://pnpm.io/)** for installs and scripts (`pnpm install`, `pnpm run build`, …).

This folder has **`.npmrc`** with `ignore-workspace=true` so it stays a **standalone** project even though the repo root defines a pnpm workspace (otherwise installs would use the root lockfile only).

## Makefile shortcuts

From `examples/basho-countdown`:

| Command        | What it does                       |
| -------------- | ---------------------------------- |
| `make help`    | List targets                       |
| `make install` | `pnpm install`                     |
| `make build`   | Production build → `dist/`         |
| `make test`    | `vitest run` — `basho-logic` tests |
| `make check`   | `svelte-check` (Svelte + TS)       |
| `make dev`     | Vite dev server (HMR)              |
| `make preview` | `vite preview` (builds first)      |
| `make server`  | `make build` then `go run .`       |
| `make clean`   | Remove `node_modules` and `dist`   |

Port: `PORT=3456 make server`

## Develop (Vite dev server)

```bash
cd examples/basho-countdown
make dev
```

Or: `pnpm install` then `pnpm dev`. Open the URL Vite prints (usually <http://localhost:5173>).

### Routes & URL theming (`/`)

Production and dev treat unknown paths as the SPA shell so **`/demo`** loads the demo page.

On **`/`**, defaults come from **`src/customWidgetDefaults.ts`**. Override with query params (hex with or without `#`). The configuration sidebar has **Try example** and **Clear** on each row (`pushState` merge vs remove that row’s keys). The header **Clear params** link strips the entire query string.

| Param                                                                                                                                                                            | Effect                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`primary`**, **`secondary`**, **`accent`**, **`background`**, **`surface`**, **`border`**, **`accentSoft`**, **`codeForeground`**, **`cardTitleCurrent`**, **`cardTitleNext`** | Theme colors                                                                                                                                                                                                   |
| **`cardShadow`**, **`radius`**                                                                                                                                                   | Shadow, radius (URL-encoded)                                                                                                                                                                                   |
| **`fontFamily`** or **`font`**                                                                                                                                                   | CSS `font-family` stack. Use **`font`** for short URLs. Encode commas (`%2C`), spaces (`%20`), and quotes (`%22`) as needed, e.g. `font=%22DM%20Sans%22%2C%20sans-serif`                                       |
| **`daysOnly`** or **`countdownTotalDaysOnly`**                                                                                                                                   | `1` / `true` / `yes` → total-days countdown                                                                                                                                                                    |
| **`alwaysShowNext`**                                                                                                                                                             | Same truthy values → only next card                                                                                                                                                                            |
| **`badge`**                                                                                                                                                                      | Filename under `public/` for **card** badges; also sets the **header** image when set. Empty or `0` removes the card badge when `badge` is present. Omit → default `lil-origami-color.svg` for header + cards. |
| **`nobadge`**                                                                                                                                                                    | `1` / `true` / `yes` → no badge on **countdown cards only** (header still shows default or `badge=` image).                                                                                                    |
| **`badgeHeight`**, **`badgeAlt`**                                                                                                                                                | Size / alt for card badge and header image                                                                                                                                                                     |

Examples: `/?primary=ff00cc&background=111111&daysOnly=1` · `/?font=system-ui%2C%20sans-serif`

## Type check

```bash
pnpm run check    # svelte-check --tsconfig ./tsconfig.json
# or: make check
```

## Theming

Tokens live in **`src/theme.ts`**:

- **`primary`** — main **text foreground** (body, names, countdown string).
- **`secondary`** — muted foreground (venues, dates, “until …” line).
- **`accent`** — buttons, focus rings, sidebar param keys, and **“Current basho” / “Next basho”** kickers unless **`cardTitleCurrent`** / **`cardTitleNext`** override.
- **`fontFamily`**, plus **`background`**, **`surface`**, **`border`**, **`accentSoft`**, **`codeForeground`** (demo `<pre>` blocks only), **`cardShadow`**, **`radius`**.

1. **Whole page** — In `App.svelte`, edit `mergeBashoTheme({ … })` and apply `style={bashoThemeToInlineStyle(appTheme)}` on `.basho-countdown-page` (already wired). CSS variables cascade to all widgets.
2. **One widget** — `<BashoCountdown theme={{ accent: '#2dd4bf', accentSoft: 'rgba(45,212,191,0.18)' }} />` merges with defaults and sets variables on that instance only (use `accentSoft` in your own CSS via `--basho-color-accent-soft` if needed).
3. **Copy-paste light palette** — `lightBashoThemeExample` in `theme.ts` can be passed to `mergeBashoTheme(lightBashoThemeExample)` for a starting light theme.

Styles read **`--basho-color-*`**, **`--basho-font-family`**, etc.; see `app.css`. Hint boxes use `color-mix` from accent + background.

## Tests

```bash
cd examples/basho-countdown
pnpm run test          # once
pnpm run test:watch    # watch mode
# or: make test
```

- `src/lib/basho-logic.test.ts` — calendar + countdown logic
- `src/theme.test.ts` — theme merge + CSS var helpers

## Production build + Go

```bash
cd examples/basho-countdown
make server
```

Or manually: `pnpm run build` then `go run .`

Open <http://localhost:8080/>. Port: `PORT=3456 go run .` or `PORT=3456 make server`

`go run .` **requires `dist/`** to exist (it exits with a hint if you skip the build).

## Preview build without Go

```bash
pnpm run preview
```

## Component API (`BashoCountdown`)

Props (same ideas as the old config object):

| Prop                         | Description                                                                                                                                                                                                                                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`referenceDate`**          | `Date` or ISO string — fixed “now” for basho detection + countdown. With `live` (default), no ticking when set.                                                                                                                                                                                                                                        |
| **`targetDate`**             | Countdown end. Omit → next basho start (10:00 JST, 2nd Sunday rules).                                                                                                                                                                                                                                                                                  |
| **`alwaysShowNext`**         | If true, only the “Next basho” card (no current basho).                                                                                                                                                                                                                                                                                                |
| **`locale`**                 | BCP 47 locale (default `en-US`).                                                                                                                                                                                                                                                                                                                       |
| **`live`**                   | If `true` (default), update every `tickMs` when `referenceDate` is unset.                                                                                                                                                                                                                                                                              |
| **`tickMs`**                 | Update interval in ms (default `1000`).                                                                                                                                                                                                                                                                                                                |
| **`labelCurrentBasho`**      | Optional heading for the current-basho card (default `Current basho`).                                                                                                                                                                                                                                                                                 |
| **`labelNextBasho`**         | Optional heading for the next-basho card (default `Next basho`).                                                                                                                                                                                                                                                                                       |
| **`countdownTotalDaysOnly`** | If true, the next-card countdown (and past-target “ago” text) uses **total days** only for spans ≥ 1 day — no week/day/hour breakdown (`Intl.RelativeTimeFormat` `day` unit). Shorter spans still use hours/minutes.                                                                                                                                   |
| **`theme`**                  | Optional `Partial<BashoTheme>` — merged with defaults; sets CSS variables on this widget only. Use **`primary`** / **`secondary`** for body text. **`cardTitleCurrent`** / **`cardTitleNext`** color those headings (defaults: **`accent`** / **`cardTitleCurrent`**). Deprecated: **`cardTitle`** maps to **`cardTitleCurrent`**. See `src/theme.ts`. |
| **`badgeSrc`**               | Optional image URL; shown **inside every card**, top-right (e.g. `/logo.png` in **`public/`**).                                                                                                                                                                                                                                                        |
| **`badgeAlt`**               | Alt text; use `""` if decorative.                                                                                                                                                                                                                                                                                                                      |
| **`badgeHeight`**            | CSS length for badge height (width scales), default `3rem`. Sets `--basho-badge-height`.                                                                                                                                                                                                                                                               |

### Logic-only (no UI)

```ts
import { getBashoCountdownData, normalizeConfig } from './src/lib/basho-logic'

const data = getBashoCountdownData(new Date(), normalizeConfig({ alwaysShowNext: true }))
// data.cards — BashoCardModel[]
```

Exported types include `BashoCountdownConfigInput`, `NormalizedBashoConfig`, `BashoCardModel`, `BashoInfo`, etc.

## Layout

- `tsconfig.json` — TypeScript (strict, `noEmit`)
- `src/vite-env.d.ts` — Svelte / Vite references
- `src/main.ts` — app entry
- `src/theme.ts` — theme types, `mergeBashoTheme`, `bashoThemeToInlineStyle`
- `src/App.svelte` — route shell: `/` vs `/demo`
- `src/CustomIndex.svelte` — home: countdown left, configuration sidebar right
- `src/urlConfigReference.ts` — sidebar copy + “Try example” patches + per-row **Clear** key lists (keep in sync with `urlTheme.ts`)
- `src/urlQueryApply.ts` — merge query patches for the sidebar buttons
- `src/DemoPage.svelte` — full demo grid
- `src/customWidgetDefaults.ts`, `src/urlTheme.ts` — defaults + query parsing
- `src/lib/BashoCountdown.svelte` — widget
- `src/lib/BashoCard.svelte` — single card
- `src/lib/basho-logic.ts` — dates, `getBashoCountdownData`, `normalizeConfig`
- `src/lib/basho-logic.test.ts` — Vitest regression tests
- `public/lil-origami.svg` — badge used in the themed demo (`badgeSrc`)
- `server.go` — static file server for **`dist/`**

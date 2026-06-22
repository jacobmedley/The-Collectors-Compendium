# CLAUDE.md — The Collector's Compendium

Project memory for Claude Code. Read this before making changes.

## What this is

An interactive, single-page dashboard for a high-end collectible statue & figure
collection (44 pieces: 39 owned, 3 payment-plan, 2 pre-order). It tracks what was
paid, deal quality vs MSRP, current market value, gain/loss, rarity, liquidity, and
physical dimensions. It doubles as estate & insurance documentation.

**Headline totals (2026-06-09):** MSRP $30,604 | Paid $22,673 | Market mid $33,100 |
Market high / insurance $41,637 | Unrealized gain $10,427 | Verified rows 7 / Estimated 37

**Live site:** https://jacobmedley.github.io/The-Collectors-Compendium/
**Hosting:** GitHub Pages, served from `main` branch root.

## Architecture (important — read before editing)

This app has one dev dependency (`esbuild`) used only at build time. Three files matter:

- **`collection.jsx`** — the entire React app in one file. This is the source of
  truth you edit. ~1,337 lines: helpers, `SEED_ITEMS` data array, then components.
- **`icons.json`** — pre-extracted icon arrays for the 21 Lucide icons used by the
  app (generated once by `node generate-icons.mjs`, then committed). `build.mjs`
  reads this; the browser never fetches lucide separately.
- **`index.html`** — a self-contained wrapper with React 18.3.1 loaded via CDN
  (`defer`) and the JSX **precompiled and inlined** by `build.mjs`. It is GENERATED
  from `collection.jsx` (see below). Never edit it by hand.

### The build/sync step (do this after every JSX edit)

`build.mjs` reads `collection.jsx` + `icons.json`, transpiles + minifies the JSX
with esbuild (classic runtime: `React.createElement`, no auto-import), and writes
the result into `index.html` as a plain `<script>` inside a `DOMContentLoaded`
callback. The transform:

1. Strip the two `import` lines from the top of `collection.jsx`.
2. Inline `icons.json` as `const lucide = {...}` plus the `_li` shim and 21 icon
   `const`s so the un-imported code resolves.
3. Assemble React globals shim + lucide shim + app body + mount call.
4. Run `esbuild.transformSync` with `loader:'jsx'`, `jsxFactory:'React.createElement'`,
   `minify:true`, `target:'es2018'`.
5. Wrap in `document.addEventListener('DOMContentLoaded', ...)` so it runs after
   the defer'd React/ReactDOM CDN scripts.

Run the build:
```
node build.mjs
```
This reads `collection.jsx` and rewrites `index.html`. Always run it before commit.

### Why keep a minimal build step?

The owner wants to edit one file and push. GitHub Pages serves static files only.
The original in-browser Babel approach broke when unpkg silently rolled Babel to v8
(which defaults to the automatic JSX runtime, emitting illegal `import` statements
inside classic `<script>` tags). esbuild at build time is the minimal fix: one
dev dependency, same single-file workflow, precompiled output, no runtime overhead.
Do not migrate to Vite/CRA unless the owner explicitly asks.

## Data model

Every item in `SEED_ITEMS` has these fields. See README for full meanings.
Key ones for editing:

- `id` — **stable unique key. NEVER change it.** It is the filename of the item's
  image (`images/thumbs/<id>.jpg`) AND the key for saved user edits. Changing an id
  breaks both.
- `msrp` — the **creator's** retail price (Sideshow, XM, Prime 1, etc.), never a
  distributor's price.
- `itemCost` — paid for the item, post-discount, pre tax/ship.
- `totalPaid` — all-in out of pocket (item + tax + ship + tariff).
- `marketLow/marketMid/marketHigh` — resell range. Mid is canonical for totals.
- `marketSource` — `'verified'` (researched from real sales) or `'estimated'`.
- `dimensions` — `{ heightIn, widthIn, depthIn, weightLbs }`, any can be `null`.
  **XM dimension convention:** XM spec sheets use B → `widthIn`, L → `depthIn`.
  **Weight-source priority:** actual statue weight > manufacturer listed product weight >
  shipping weight proxy > unknown. Proxy/estimated weights are noted in `notes`.
- `rarityTier` — `'T1'`..`'T6'` by production run. **T1 = rarest (Legendary).** Scale:
  T1 Legendary #FF8000 (1–250) | T2 Epic #A335EE (251–999) | T3 Rare #0070DD (1k–2.4k) |
  T4 Uncommon #1EFF00 (2.5k–4.9k) | T5 Common #E8E4DA (5k–9.9k) | T6 Mass #9D9D9D (10k+/open).
  Tiers are always derived from production run, never hand-assigned.

### Financial conventions (do not silently redefine)

- **Savings vs MSRP = `msrp - itemCost`.** Deal quality. Tax/ship excluded.
- **Overhead = `totalPaid - itemCost`.** Cost to receive. Never blended into savings.
- **Gain = `marketMid - totalPaid`.** Unrealized mark-to-market.
- **Liquidation value** = `marketLow × liquidityFactor` (high 1.0, med 0.85, low 0.65).
- **Insurance/replacement value** = `marketHigh`.

These live in `computeMetrics()` near the top of `collection.jsx`.

## Persistence

User edits (to market values, dimensions, notes, etc.) are layered as "overrides"
on top of `SEED_ITEMS` and saved under the key `collection-overrides`.

The `store` abstraction (top of `CollectionApp`) handles both environments:
- In the Claude artifact sandbox → uses `window.storage` (per-user KV).
- Everywhere else (GitHub Pages, local, normal browsers) → falls back to
  `localStorage`.

Note: `localStorage` is **per-browser, per-device**. Edits made on the phone do
NOT sync to the desktop. If cross-device sync is ever needed, that requires a
backend (out of scope for the zero-build setup) or committing edits back into
`SEED_ITEMS` by hand.

## Images

All 44 product photos live in `images/thumbs/<id>.jpg`, named by item id. They are
served from the same repo, so they always load on the live site (no hotlink issues).

`resolveImg(item)` builds the URL from `IMAGE_BASE_URL + item.id + '.jpg'`.
`IMAGE_BASE_URL` is the GitHub raw URL. To add a new item's image: drop
`<new-id>.jpg` into `images/thumbs/` and the app finds it automatically.

The `imageUrl` field on each item is now legacy/unused for display (kept as a record
of the original source). `resolveImg` ignores it in favor of the id-based path.

## Common tasks

- **Add an item:** append an object to `SEED_ITEMS` with a new unique `id`, fill
  fields, drop `images/thumbs/<id>.jpg` in, run `node build.mjs`, commit.
- **Edit a value permanently (for everyone):** change it in `SEED_ITEMS` (not via the
  in-app editor, which is per-browser only), rebuild, commit.
- **Change styling/layout:** edit the relevant component in `collection.jsx`, rebuild.
- **Verify market data:** check eBay sold listings / creator PDP; set `marketSource`
  to `'verified'` only when based on real observed sales.
- **Data flow:** Google Sheet (Collection_Data) → edits to `SEED_ITEMS` → `node build.mjs` → commit + push.

## Owner-verified record corrections (settled — do not re-open)

- **Darkseid:** productionRun 1,000 confirmed. Edition #767/1,000. Prior notes saying "LE 2,000" were wrong.
- **Magneto-prestige:** editionNumber '234' is final. Any prior "243 correction" was itself an error; 234 is authoritative.
- **Vi (Hot Toys):** status = owned. Prior notes saying "Pre-order" were stale.

## Guardrails

- Never change an item `id`.
- Never put distributor prices in `msrp`.
- Keep overhead and deal-quality separate.
- Always run `node build.mjs` before committing, or index.html goes stale.
- Don't migrate to a build system unless asked.
- This is not financial advice; values are estimates for planning.

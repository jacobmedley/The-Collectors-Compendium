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

This is a **zero-build** app. There is no npm, no bundler, no transpile step.
Two files matter:

- **`collection.jsx`** — the entire React app in one file. This is the source of
  truth you edit. ~1,337 lines: helpers, `SEED_ITEMS` data array, then components.
- **`index.html`** — a self-contained wrapper that loads React + ReactDOM + Babel
  Standalone + Lucide from CDN, then runs the JSX **inlined inside it** via an
  in-browser Babel transform. It is GENERATED from `collection.jsx` (see below).

### The build/sync step (do this after every JSX edit)

`index.html` contains a COPY of `collection.jsx` inlined in a `<script type="text/babel">`
block. When you change `collection.jsx`, you must regenerate `index.html`, or the
live site won't reflect your edits. The transform:

1. Strip the two `import` lines from the top of `collection.jsx`
   (`import React...` and `import {...} from 'lucide-react'`).
2. Paste the rest between the shim header and the mount footer in the
   `<script type="text/babel">` block.
3. The shim header declares `const { useState, ... } = React;` and
   `const { Search, ... } = lucide;` so the un-imported code resolves.
4. The footer mounts: `root.render(<CollectionApp />);`

A `build.mjs` script in the repo does this automatically. Run:
```
node build.mjs
```
This reads `collection.jsx` and rewrites `index.html`. Always run it before commit.

### Why no build system?

The owner wants to edit one file and push. GitHub Pages serves static files only.
In-browser Babel keeps the toolchain at zero. The tradeoff: a ~0.3s transpile on
each page load, which is fine for a personal dashboard. Do not "modernize" this
into Vite/CRA unless the owner explicitly asks — it would break the workflow.

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
- `rarityTier` — `'T1'`..`'T6'` by production run. **T1 = rarest.** Scale:
  T1 Ultra Rare <50 | T2 Very Rare 50–249 | T3 Rare 250–999 |
  T4 Limited 1k–2.5k | T5 Wide 2.5k–10k | T6 Mass 10k+

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

## Guardrails

- Never change an item `id`.
- Never put distributor prices in `msrp`.
- Keep overhead and deal-quality separate.
- Always run `node build.mjs` before committing, or index.html goes stale.
- Don't migrate to a build system unless asked.
- This is not financial advice; values are estimates for planning.

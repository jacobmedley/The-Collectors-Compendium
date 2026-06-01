# The Collector's Compendium

An interactive dashboard for a high-end collectible statue & figure collection.
Tracks cost basis, deal quality, market value, gain/loss, rarity, liquidity, and
physical dimensions — and doubles as estate & insurance documentation.

**Live:** https://jacobmedley.github.io/The-Collectors-Compendium/

![Pieces](https://img.shields.io/badge/pieces-42-c9a55c) ![Build](https://img.shields.io/badge/build-zero--config-success)

---

## Quick start

This is a **zero-build** static app. To run it locally, just open `index.html`
in a browser — or, better, serve it so `fetch` works for images:

```bash
# any static server works; pick one
python3 -m http.server 8000
# then open http://localhost:8000
```

Or with Node:
```bash
npx serve .
```

## How it works

Two files matter:

| File | Role |
| --- | --- |
| `collection.jsx` | The entire React app + all collection data. **Edit this.** |
| `index.html` | Self-contained page that runs the JSX via in-browser Babel. **Generated.** |

`index.html` loads React, ReactDOM, Babel Standalone, and Lucide from CDN, then
runs a copy of `collection.jsx` inlined inside it. There is no bundler.

### After editing `collection.jsx`, rebuild:

```bash
node build.mjs
```

This regenerates `index.html` from `collection.jsx`. **Always run it before
committing** or the live site will be stale. (See `CLAUDE.md` for the why.)

## Project structure

```
.
├── index.html          # generated — do not hand-edit
├── collection.jsx      # source of truth (app + data)
├── build.mjs           # regenerates index.html from collection.jsx
├── CLAUDE.md           # project memory / instructions for Claude Code
├── README.md           # this file
└── images/
    └── thumbs/         # 42 product photos, named <item-id>.jpg
```

## Data model

Each item in `SEED_ITEMS` (top of `collection.jsx`) has:

| Field | Meaning |
| --- | --- |
| `id` | Stable unique key. **Never change** — it's the image filename and the saved-edit key. |
| `name` | Display name incl. edition label |
| `franchise` | DC, Marvel, Star Wars, League of Legends, etc. |
| `studio` | Creator/manufacturer (Sideshow, XM, Hot Toys…) — not the retailer |
| `category` | Premium Format, 1/4 Scale Statue, Sixth Scale Figure, etc. |
| `edition` | Standard / Exclusive / Premier / Deluxe |
| `rarityTier` | T1–T6 by production run |
| `productionRun` | Verified edition size, or `null` |
| `msrp` | **Creator's** official retail price |
| `itemCost` | Paid for item only, post-discount, pre tax/ship |
| `totalPaid` | All-in out of pocket (item + tax + ship + tariff) |
| `marketLow/Mid/High` | Secondary-market resell range (Mid is canonical) |
| `marketSource` | `verified` (real sales) or `estimated` (modeled) |
| `liquidity` | `high` / `medium` / `low` |
| `dimensions` | `{ heightIn, widthIn, depthIn, weightLbs }` (any may be `null`) |
| `savingsMethods` | sale, rewards, gift-card, black-friday, free-bonus, etc. |
| `status` | owned / pre-order / payment-plan / wishlist |
| `notes` | Provenance, bundle math, caveats |
| `url` | Product page |

### Rarity tiers (by production run)

| Tier | Edition size |
| --- | --- |
| T1 — Mass | 10,000+ |
| T2 — Wide | 2,500–9,999 |
| T3 — Limited | 1,000–2,499 |
| T4 — Rare | 250–999 |
| T5 — Very Rare | 50–249 |
| T6 — Ultra Rare | under 50 |

### Financial conventions

- **Savings vs MSRP** = `msrp − itemCost` (deal quality; excludes tax/ship)
- **Overhead** = `totalPaid − itemCost` (cost to receive; kept separate)
- **Gain** = `marketMid − totalPaid` (unrealized)
- **Liquidation value** = `marketLow × liquidity factor` (high 1.0 / med 0.85 / low 0.65)
- **Insurance/replacement value** = `marketHigh`

## Editing the collection

**Permanent changes** (visible to everyone) go in `SEED_ITEMS`, then rebuild + commit.

**In-app edits** (the pencil/edit button) are saved to your browser's
`localStorage` only — they're per-device and don't sync or get committed. Use them
for quick personal tweaks; use `SEED_ITEMS` for anything that should stick.

### Adding a new item

1. Append an object to `SEED_ITEMS` with a new unique `id`.
2. Save its photo as `images/thumbs/<id>.jpg`.
3. `node build.mjs`
4. Commit & push.

## Deploy

GitHub Pages serves `main` branch root. Push to `main` → live in ~60s. No CI needed.

## License / disclaimer

Personal project. Collectible values are volatile and illiquid; all figures are
estimates for planning, not guaranteed resale prices. Not financial advice.

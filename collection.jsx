import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Search, Filter, ArrowUp, ArrowDown, X, Edit3, ExternalLink, TrendingUp, TrendingDown, Minus, Gift, Info, BarChart3, ChevronDown, ChevronUp, Award, Zap, CheckCircle2, Wallet, CalendarClock, Percent } from 'lucide-react';

// =============================================================================
// SEED DATA — 40 items
// MSRP = creator's official retail price (source of truth)
// itemCost = paid for item only, post-discount, pre tax/ship
// totalPaid = full out-of-pocket (item + overhead)
// marketLow/Mid/High = secondary market resell range (mid is canonical)
// marketSource: 'verified' = researched eBay/forum sales | 'estimated' = modeled from category
// liquidity: 'high' | 'medium' | 'low' (how quickly a piece typically sells)
// purchaseDate = order date | releaseDate = manufacturer release date | acquisitionDate = when received
// editionNumber = specific piece # (e.g. '068' for piece #068/800); null until verified
// =============================================================================

const SEED_ITEMS = [
  { id: 'ultra-magnus', name: 'Ultra Magnus — Premium Limited Edition', franchise: 'Transformers (Bumblebee)', studio: 'Threezero', category: 'Action Figure', edition: 'Premium Limited Edition', rarityTier: 'T4', productionRun: 1200, msrp: 539.99, itemCost: 539.99, totalPaid: 539.99, marketLow: 480, marketMid: 580, marketHigh: 720, marketSource: 'estimated', liquidity: 'medium', savingsMethods: [], notes: 'BBTS exclusive.', url: 'https://www.bigbadtoystore.com/product/transformers-bumblebee-premium-ultra-magnus-limited-edition-action-figure-176242', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/ultra-magnus.jpg', purchaseDate: '2026-05-08', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 19.0, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'darkseid', name: 'Darkseid Maquette — Exclusive Edition', franchise: 'DC Comics', studio: 'Sideshow Collectibles', category: 'Maquette', edition: 'Exclusive (alternate portrait)', rarityTier: 'T4', productionRun: 1000, msrp: 660, itemCost: 460, totalPaid: 494.34, marketLow: 600, marketMid: 750, marketHigh: 950, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['sale', 'free-bonus'], notes: 'Sideshow LE 2,000. Bundle with free Iron Man Neon. Bundle subtotal $1,070, discount -$608, total $494.34.', url: 'https://www.sideshow.com/collectibles/dc-comics-darkseid-sideshow-collectibles-200581', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/darkseid.jpg', purchaseDate: '2024-12-02', releaseDate: null, editionNumber: '767', acquisitionDate: null, dimensions: { heightIn: 24.0, widthIn: 16.0, depthIn: 10.0, weightLbs: 25.0}, status: 'owned' },
  { id: 'iron-man-neon', name: 'Iron Man Neon Tech 4.0', franchise: 'Marvel', studio: 'Hot Toys', category: 'Sixth Scale Figure', edition: '2021 Toy Fair Exclusive', rarityTier: 'T5', productionRun: null, msrp: 410, itemCost: 0, totalPaid: 0, marketLow: 400, marketMid: 500, marketHigh: 700, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['free-bonus'], notes: '2021 Toy Fair Exclusive — discontinued, trades at premium. Free bonus with Darkseid.', url: 'https://www.sideshow.com/collectibles/marvel-iron-man-neon-tech-4-0-hot-toys-908326', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/iron-man-neon.jpg', purchaseDate: '2024-12-02', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 12.6, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'rogue-gambit', name: 'Rogue & Gambit Premium Format', franchise: 'Marvel (X-Men)', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Limited Edition', rarityTier: 'T3', productionRun: 1200, msrp: 750, itemCost: 750, totalPaid: 840.84, marketLow: 700, marketMid: 900, marketHigh: 1100, marketSource: 'estimated', liquidity: 'high', savingsMethods: [], notes: 'Standalone purchase. $750 item + $38 ship. X-Men pair = strong demand. LE 1200.', url: '', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/rogue-gambit.jpg', purchaseDate: '2025-01-12', releaseDate: null, editionNumber: '98', acquisitionDate: '2025-03-27', dimensions: { heightIn: 18.75, widthIn: 11.0, depthIn: 12.0, weightLbs: 10.0 }, status: 'owned' },
  { id: 'mando-child', name: 'ARTFX Mandalorian & The Child', franchise: 'Star Wars', studio: 'Kotobukiya', category: 'ARTFX Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 185, itemCost: 155, totalPaid: 165, marketLow: 200, marketMid: 240, marketHigh: 300, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['sale', 'rewards'], notes: 'Bundled with Iron Man Deluxe ($419.14 bundle). Open edition.', url: '', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/mando-child.jpg', purchaseDate: '2025-07-18', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 10.35, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'iron-man-deluxe', name: 'Iron Man (Deluxe) Mark VII', franchise: 'Marvel', studio: 'Hot Toys', category: 'Sixth Scale Figure', edition: 'Deluxe', rarityTier: 'T5', productionRun: null, msrp: 410, itemCost: 264, totalPaid: 282, marketLow: 350, marketMid: 475, marketHigh: 600, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['sale', 'rewards'], notes: 'Bundled with Mandalorian. Avengers-era release, holding value.', url: '', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/iron-man-deluxe.jpg', purchaseDate: '2025-07-18', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 12.8, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'jinx', name: 'Jinx (Hot Toys)', franchise: 'League of Legends', studio: 'Hot Toys', category: 'Sixth Scale Figure', edition: 'Standard', rarityTier: 'T5', productionRun: null, msrp: 275, itemCost: 138.95, totalPaid: 181.25, marketLow: 250, marketMid: 300, marketHigh: 400, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift-card', 'rewards'], notes: '$100 gift card + $36.05 rewards. Out of pocket $181.25 on $275 MSRP.', url: 'https://www.sideshow.com/collectibles/league-of-legends-jinx-hot-toys-913946', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/jinx.jpg', purchaseDate: '2026-01-22', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 10.8, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'batgirl', name: 'Batgirl Premium Format', franchise: 'DC Comics', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Standard', rarityTier: 'T4', productionRun: 2200, msrp: 720, itemCost: 720, totalPaid: 851.94, marketLow: 650, marketMid: 800, marketHigh: 1000, marketSource: 'estimated', liquidity: 'high', savingsMethods: [], notes: 'No discounts. Tariff $28.80, tax $50.40, ship $52.74.', url: 'https://www.sideshow.com/collectibles/dc-comics-batgirl-premium-format-figure-sideshow-collectibles-300854', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/batgirl.jpg', purchaseDate: '2025-05-30', releaseDate: null, editionNumber: '1829', acquisitionDate: '2025-08-23', dimensions: { heightIn: 21.5, widthIn: 15.0, depthIn: 14.0, weightLbs: 17.0 }, status: 'owned' },
  { id: 'pennywise', name: 'Pennywise Bishoujo', franchise: 'IT', studio: 'Kotobukiya', category: 'Bishoujo Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 155, itemCost: 130, totalPaid: 159.65, marketLow: 120, marketMid: 150, marketHigh: 200, marketSource: 'estimated', liquidity: 'medium', savingsMethods: [], notes: 'No discounts. Open edition; modest appreciation.', url: 'https://www.sideshow.com/collectibles/it-pennywise-kotobukiya-906443', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/pennywise.jpg', purchaseDate: '2025-05-29', releaseDate: null, editionNumber: null, acquisitionDate: '2025-09-09', dimensions: { heightIn: 10.4, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'iron-man-xlii', name: 'Iron Man Mark XLII Quarter Scale (Deluxe)', franchise: 'Marvel', studio: 'Hot Toys', category: 'Quarter Scale Figure', edition: 'Deluxe', rarityTier: 'T4', productionRun: null, msrp: 650, itemCost: 450, totalPaid: 496.50, marketLow: 700, marketMid: 1100, marketHigh: 1500, marketSource: 'verified', liquidity: 'high', savingsMethods: ['sale', 'rewards'], notes: 'QS008 reissue. Verified eBay $700-1500. Iron Man 3 era, strong demand.', url: 'https://www.sideshow.com/collectibles/marvel-iron-man-mark-xlii-deluxe-version-hot-toys-908659', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/iron-man-xlii.jpg', purchaseDate: '2025-05-24', releaseDate: null, editionNumber: null, acquisitionDate: '2025-06-01', dimensions: { heightIn: 20.0, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'ahri', name: 'Ahri', franchise: 'League of Legends', studio: 'Jimei Palace', category: 'Statue', edition: 'Standard', rarityTier: 'T4', productionRun: 2488, msrp: 499, itemCost: 499, totalPaid: 586.59, marketLow: 450, marketMid: 550, marketHigh: 700, marketSource: 'estimated', liquidity: 'low', savingsMethods: [], notes: 'No discounts. Jimei Palace typical ~999 edition; smaller secondary market.', url: 'https://www.sideshow.com/collectibles/league-of-legends-ahri-jimei-palace-914273', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/ahri.jpg', purchaseDate: '2025-05-03', releaseDate: null, editionNumber: '1990', acquisitionDate: null, dimensions: { heightIn: 16.53, widthIn: 12.2, depthIn: 9.84, weightLbs: 22.0 }, status: 'owned' },
  { id: 'supergirl', name: 'Supergirl Series #8', franchise: 'DC Comics', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 205, itemCost: 24, totalPaid: 50.16, marketLow: 180, marketMid: 220, marketHigh: 280, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['sale', 'rewards'], notes: 'BEST DEAL: Discount -$20, rewards -$161. Paid only $24 for the item.', url: 'https://www.sideshow.com/collectibles/dc-comics-supergirl-series-8-iron-studios-913755', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/supergirl.jpg', purchaseDate: '2025-05-03', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 9.7, widthIn: 5.6, depthIn: 4.5, weightLbs: 1.7 }, status: 'owned' },
  { id: 'batman-joker', name: 'Batman vs The Joker: Eternal Enemies', franchise: 'DC Comics', studio: 'Sideshow Collectibles', category: 'Premium Format (Diorama)', edition: 'Exclusive Edition (Sideshow Exclusive)', rarityTier: 'T3', productionRun: 275, msrp: 1050, itemCost: 1006.90, totalPaid: 1216.85, marketLow: 1400, marketMid: 1750, marketHigh: 2200, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['sale', 'rewards'], notes: 'EXCLUSIVE EDITION LE 275 — verified from PDP. Much rarer than previously estimated. Order AAZ98549. Sideshow-exclusive diorama. Paid $1,007 item after $43 discounts/rewards.', url: 'https://www.sideshow.com/collectibles/dc-comics-batman-vs-the-joker-eternal-enemies-sideshow-collectibles-2006431', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/batman-joker.jpg', purchaseDate: '2025-01-25', releaseDate: null, editionNumber: '43', acquisitionDate: null, dimensions: { heightIn: 31.25, widthIn: 21.0, depthIn: 15.0, weightLbs: 24.0 }, status: 'owned' },
  { id: 'red-sonja', name: 'Red Sonja: A Savage Sword Premium Format', franchise: 'Dynamite (Red Sonja)', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Standard', rarityTier: 'T4', productionRun: 2000, msrp: 680, itemCost: 660, totalPaid: 784.84, marketLow: 650, marketMid: 800, marketHigh: 1000, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale'], notes: 'Discount -$20.', url: 'https://www.sideshow.com/collectibles/dynamite-red-sonja-sideshow-collectibles-300813', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/red-sonja.jpg', purchaseDate: '2025-01-18', releaseDate: null, editionNumber: '631', acquisitionDate: '2025-02-18', dimensions: { heightIn: 22.5, widthIn: 16.0, depthIn: 18.0, weightLbs: 15.2}, status: 'owned' },
  { id: 'hulk-gamma', name: 'The Hulk: Gamma Smash (Sideshow Seconds)', franchise: 'Marvel', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Sideshow Exclusive — Seconds/Distressed (LE 150)', rarityTier: 'T2', productionRun: 150, msrp: 850, itemCost: 702.50, totalPaid: 851.49, marketLow: 950, marketMid: 1200, marketHigh: 1500, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale', 'seconds-discount'], notes: 'SIDESHOW EXCLUSIVE LE 150 — T5 Very Rare. Sideshow Seconds (factory-distressed unit). Seconds discount $127.50 + promo $20 = -$147.50 total. Order AAZ90214. Resale value strong on rarity, Seconds designation may discount vs mint by ~15-20%.', url: 'https://www.sideshow.com/collectibles/marvel-the-hulk-gamma-smash-sideshow-collectibles-300866', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/hulk-gamma.jpg', purchaseDate: '2025-01-16', releaseDate: null, editionNumber: '86', acquisitionDate: null, dimensions: { heightIn: 28.0, widthIn: 18.0, depthIn: 19.0, weightLbs: 33.2}, status: 'owned' },
  { id: 'red-hood-samurai', name: 'Red Hood — Samurai Series 1/4', franchise: 'DC Comics', studio: 'XM Studios', category: '1/4 Scale Statue', edition: 'Samurai Series', rarityTier: 'T3', productionRun: 899, msrp: 2499, itemCost: 999.60, totalPaid: 999.60, marketLow: 1800, marketMid: 2100, marketHigh: 2500, marketSource: 'verified', liquidity: 'medium', savingsMethods: ['sale', 'black-friday'], notes: 'LE 899. Spec Fiction Order #87046, May 27 2026. MSRP $2,499 (Spec Fiction list), paid $999.60 (BLACK FRIDAY:BUSTERS 60% = $1,499 saved). Verified eBay $1,800-2,500.', url: 'https://www.xm-studios.com/products/red-hood-samurai-series.aspx', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/red-hood-samurai.jpg', purchaseDate: '2026-05-27', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 20.87, widthIn: 15.16, depthIn: 12.99, weightLbs: 26.46 }, status: 'owned' },
  { id: 'batman-shogu', name: 'Batman Shugo (Ver B XM Exclusive) 1/4', franchise: 'DC Comics', studio: 'XM Studios', category: '1/4 Scale Statue', edition: 'Samurai Series Version B (XM Exclusive)', rarityTier: 'T3', productionRun: 999, msrp: 2199, itemCost: 879.60, totalPaid: 879.60, marketLow: 1800, marketMid: 2200, marketHigh: 2700, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale', 'black-friday'], notes: 'LE 999. Spec Fiction Order #87046, May 27 2026. MSRP $2,199 (Spec Fiction list), paid $879.60 (BLACK FRIDAY:BUSTERS 60% = $1,319 saved).', url: 'https://www.xm-studios.com/products/batman-shugo-ver-a.aspx', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/batman-shogu.jpg', purchaseDate: '2026-05-27', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 26.0, widthIn: 19.7, depthIn: 16.1, weightLbs: 41.9 }, status: 'owned' },
  { id: 'rhino', name: 'Rhino 1/4', franchise: 'Marvel', studio: 'XM Studios', category: '1/4 Scale Statue', edition: 'Standard', rarityTier: 'T3', productionRun: 499, msrp: 1669, itemCost: 667.60, totalPaid: 667.60, marketLow: 1100, marketMid: 1400, marketHigh: 1800, marketSource: 'verified', liquidity: 'medium', savingsMethods: ['sale', 'black-friday'], notes: 'LE 499. Spec Fiction Order #86985, May 24 2026. MSRP $1,669 (Spec Fiction list), paid $667.60 (BLACK FRIDAY:BUSTERS 60% = $1,001 saved).', url: 'https://xm-studios.com/guest/shop/detail/rhino-copy-1769692922', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/rhino.jpg', purchaseDate: '2026-05-24', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 19.69, widthIn: 20.47, depthIn: 20.87, weightLbs: 44.09 }, status: 'owned' },
  { id: 'magneto-prestige', name: 'Magneto 1:3 Prestige — Premier Edition', franchise: 'Marvel (X-Men)', studio: 'XM Studios', category: '1:3 Prestige Statue', edition: 'Premier Edition (Legendary Beast)', rarityTier: 'T3', productionRun: 699, msrp: 2999, itemCost: 1199.60, totalPaid: 1199.60, marketLow: 1800, marketMid: 2200, marketHigh: 2600, marketSource: 'verified', liquidity: 'medium', savingsMethods: ['sale', 'black-friday'], notes: 'LE 699. Piece #243/699. Spec Fiction Order #86972, May 23 2026. MSRP $2,999 confirmed. Paid $1,199.60 (BLACK FRIDAY:BUSTERS 60% = $1,799 saved). Shipped May 26. Verified eBay $1,830-2,600. Shipping weight estimate — actual statue weight TBC.', url: 'https://xm-studios.com/guest/shop/detail/magneto-premier-edition-prestige-series', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/magneto-prestige.jpg', purchaseDate: '2026-05-23', releaseDate: null, editionNumber: '234', acquisitionDate: null, dimensions: { heightIn: 34.25, widthIn: 29.13, depthIn: 22.05, weightLbs: 115.0}, status: 'owned' },
  { id: 'ww-hydra', name: 'Wonder Woman vs Hydra — Fabok EX Bonus', franchise: 'DC Comics', studio: 'Prime 1 Studio', category: 'Museum Masterline 1:3 Statue', edition: 'EX Bonus (MMDC-48EXS, numbered)', rarityTier: 'T3', productionRun: 800, msrp: 1499, itemCost: 744, totalPaid: 1408, marketLow: 1400, marketMid: 1700, marketHigh: 2100, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale', 'rewards'], notes: 'Numbered LE 800. Prime 1 Order C2356334, May 25 2026. PROCESSING — all paid, about to ship. Caught 50%-off sale: item $749, rewards -$5 = $744 paid + $664 ship = $1,408 total.', url: 'https://www.prime1studio.com/dcwwc-wonder-woman-versus-hydra-concept-design-by-jason-fabok/MMDC-48EXS.html', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/ww-hydra.jpg', purchaseDate: '2026-05-25', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 35.24, widthIn: 23.23, depthIn: 17.99, weightLbs: 63.93 }, status: 'owned' },
  { id: 'pa-jinx', name: 'Jinx 1/6 (PureArts)', franchise: 'League of Legends', studio: 'PureArts', category: '1/6 Scale Statue', edition: 'Standard (LE)', rarityTier: 'T5', productionRun: 3000, msrp: 299, itemCost: 249.50, totalPaid: 284.50, marketLow: 280, marketMid: 350, marketHigh: 450, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale'], notes: 'LE 3,000. Bundle SKU PA009LOL split 50/50. LED, connects to Vi.', url: 'https://www.purearts.com/products/league-of-legends-jinx-1-6-scale-statue', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/pa-jinx.jpg', purchaseDate: '2024-08-31', releaseDate: null, editionNumber: '1102', acquisitionDate: '2025-09-04', dimensions: { heightIn: 12.4, widthIn: 10.8, depthIn: 8.7, weightLbs: 6.0}, status: 'owned' },
  { id: 'pa-vi', name: 'Vi 1/6 (PureArts)', franchise: 'League of Legends', studio: 'PureArts', category: '1/6 Scale Statue', edition: 'Standard (LE)', rarityTier: 'T5', productionRun: 2500, msrp: 299, itemCost: 249.50, totalPaid: 284.50, marketLow: 280, marketMid: 360, marketHigh: 470, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale'], notes: 'LE 2,500 — rarer than Jinx (3,000). LED hextech gauntlets.', url: 'https://www.purearts.com/products/league-of-legends-vi-1-6-scale-statue', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/pa-vi.jpg', purchaseDate: '2024-08-31', releaseDate: null, editionNumber: '1158', acquisitionDate: '2025-09-04', dimensions: { heightIn: 15.7, widthIn: 9.8, depthIn: 9.4, weightLbs: 7.0}, status: 'owned' },
  { id: 'bayek', name: "Assassin's Creed: Animus Bayek", franchise: "Assassin's Creed", studio: 'PureArts', category: 'Animus Statue', edition: 'Standard', rarityTier: 'T4', productionRun: 1500, msrp: 719.10, itemCost: 719.10, totalPaid: 777.10, marketLow: 650, marketMid: 800, marketHigh: 1000, marketSource: 'estimated', liquidity: 'high', savingsMethods: [], notes: 'LE 1,500. Black Friday 2024. AC fanbase = strong demand.', url: 'https://www.purearts.com/en-eu/products/assassins-creed-bayek', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/bayek.jpg', purchaseDate: '2024-11-26', releaseDate: null, editionNumber: '931', acquisitionDate: '2024-11-27', dimensions: { heightIn: 27.0, widthIn: 19.0, depthIn: 20.0, weightLbs: 27.0 }, status: 'owned' },
  { id: 'ekko', name: 'Ekko 1/4', franchise: 'League of Legends', studio: 'PureArts', category: '1/4 Scale Statue', edition: 'Standard', rarityTier: 'T4', productionRun: 2000, msrp: 679.15, itemCost: 339.58, totalPaid: 397.58, marketLow: 600, marketMid: 750, marketHigh: 900, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale', 'black-friday'], notes: 'LE 2,000. Black Friday 50% off (-$339.57).', url: 'https://www.purearts.com/en-eu/products/league-of-legends-ekko-1-4-scale-statue', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/ekko.jpg', purchaseDate: '2024-11-26', releaseDate: null, editionNumber: '75', acquisitionDate: '2024-11-27', dimensions: { heightIn: 24.0, widthIn: 21.0, depthIn: 13.0, weightLbs: 13.0 }, status: 'owned' },
  { id: 'galactus-sofvi', name: 'Galactus Jumbo Sofvi (Special Edition)', franchise: 'Marvel', studio: 'Hot Toys', category: 'Sofvi Figure', edition: 'Special Edition', rarityTier: 'T5', productionRun: null, msrp: 315, itemCost: 313.80, totalPaid: 334.20, marketLow: 280, marketMid: 340, marketHigh: 420, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['rewards'], notes: 'Rewards -$1.20. Pre-order.', url: 'https://www.sideshow.com/collectibles/marvel-galactus-jumbo-sofvi-hot-toys-914703', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/galactus-sofvi.jpg', purchaseDate: '2026-02-22', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 27.56, widthIn: null, depthIn: null, weightLbs: null }, status: 'payment-plan' },
  { id: 'ghost-spider', name: 'Ghost-Spider', franchise: 'Marvel', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 255, itemCost: 255, totalPaid: 303, marketLow: 230, marketMid: 275, marketHigh: 330, marketSource: 'estimated', liquidity: 'medium', savingsMethods: [], notes: 'Pre-order. Iron Studios 1:10 open edition.', url: 'https://www.sideshow.com/collectibles/marvel-ghost-spider-iron-studios-914258', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/ghost-spider.jpg', purchaseDate: '2025-12-05', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 13.4, widthIn: 7.6, depthIn: 6.6, weightLbs: 2.4 }, status: 'owned' },
  { id: 'spidey-stealth', name: 'Spider-Man (Stealth Suit) Deluxe', franchise: 'Marvel', studio: 'Hot Toys', category: 'Sixth Scale Figure', edition: 'Deluxe', rarityTier: 'T5', productionRun: null, msrp: 310, itemCost: 0, totalPaid: 0, marketLow: 280, marketMid: 350, marketHigh: 450, marketSource: 'estimated', liquidity: 'high', savingsMethods: ['free-bonus'], notes: 'FREE with White Vision purchase.', url: 'https://www.sideshow.com/collectibles/marvel-spider-man-stealth-suit-deluxe-version-hot-toys-904858', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/spidey-stealth.jpg', purchaseDate: '2025-11-28', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 12.0, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'white-vision', name: 'White Vision 1:4 Legacy Replica', franchise: 'Marvel (WandaVision)', studio: 'Iron Studios', category: '1:4 Legacy Replica Statue', edition: 'Limited Edition', rarityTier: 'T2', productionRun: 120, msrp: 1035, itemCost: 621, totalPaid: 718.02, marketLow: 1200, marketMid: 1650, marketHigh: 2200, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale', 'free-bonus'], notes: '1:4 Legacy Replica (NOT 1:10). Bundle with free Spider-Man Stealth.', url: 'https://www.sideshow.com/collectibles/marvel-white-vision-iron-studios-909938', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/white-vision.jpg', purchaseDate: '2025-11-28', releaseDate: null, editionNumber: '096', acquisitionDate: null, dimensions: { heightIn: 27.6, widthIn: 14.6, depthIn: 14.1, weightLbs: 19.0}, status: 'owned' },
  { id: 'cyclops', name: 'Cyclops Premium Format', franchise: 'Marvel (X-Men)', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Standard', rarityTier: 'T4', productionRun: 1200, msrp: 850, itemCost: 850, totalPaid: 1007.73, marketLow: 750, marketMid: 900, marketHigh: 1150, marketSource: 'estimated', liquidity: 'high', savingsMethods: [], notes: 'Pre-order. X-Men character = strong demand.', url: 'https://www.sideshow.com/collectibles/marvel-cyclops-sideshow-collectibles-300878', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/cyclops.jpg', purchaseDate: '2025-07-31', releaseDate: null, editionNumber: '89', acquisitionDate: null, dimensions: { heightIn: 23.25, widthIn: 20.0, depthIn: 20.0, weightLbs: 21.4}, status: 'owned' },
  { id: 'killer-croc', name: 'Killer Croc Premium Format', franchise: 'DC Comics', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Standard', rarityTier: 'T5', productionRun: null, msrp: 850, itemCost: 802.30, totalPaid: 944, marketLow: 800, marketMid: 950, marketHigh: 1200, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['rewards'], notes: 'Payment plan. Est. total ~$1,025 (tariff ~$20, tax ~$65, ship ~$90).', url: 'https://www.sideshow.com/collectibles/dc-comics-killer-croc-sideshow-collectibles-300914', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/killer-croc.jpg', purchaseDate: '2026-05-12', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 22.44, widthIn: 24.44, depthIn: 21.25, weightLbs: null }, status: 'payment-plan' },
  { id: 'succubus', name: 'Succubus Premium Format', franchise: 'Sideshow Originals', studio: 'Sideshow Collectibles', category: 'Premium Format Figure', edition: 'Standard', rarityTier: 'T4', productionRun: 1300, msrp: 650, itemCost: 630, totalPaid: 790.63, marketLow: 550, marketMid: 700, marketHigh: 900, marketSource: 'estimated', liquidity: 'low', savingsMethods: ['sale'], notes: 'Payment plan. Est. total ~$800. Sideshow Original IP = smaller resale market. Weight is shipping estimate.', url: 'https://www.sideshow.com/collectibles/sideshow-originals-succubus-sideshow-collectibles-300844', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/succubus.jpg', purchaseDate: '2026-03-05', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 30.5, widthIn: 16.2, depthIn: 10.4, weightLbs: 23.4}, status: 'payment-plan' },
  { id: 'miss-fortune', name: 'The Bounty Hunter — Miss Fortune', franchise: 'League of Legends', studio: 'Jimei Palace', category: 'Statue', edition: 'Standard', rarityTier: 'T4', productionRun: null, msrp: 550, itemCost: 483.10, totalPaid: 516.92, marketLow: 500, marketMid: 600, marketHigh: 750, marketSource: 'estimated', liquidity: 'low', savingsMethods: ['rewards'], notes: 'Rewards -$66.90. Pre-order.', url: 'https://www.sideshow.com/collectibles/league-of-legends-the-bounty-hunter-miss-fortune-jimei-palace-915012', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/miss-fortune.jpg', purchaseDate: '2025-11-16', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 16.92, widthIn: 11.41, depthIn: 7.87, weightLbs: 22.0 }, status: 'pre-order' },
  { id: 'vi', name: 'Vi (Hot Toys)', franchise: 'League of Legends', studio: 'Hot Toys', category: 'Sixth Scale Figure', edition: 'Standard', rarityTier: 'T5', productionRun: null, msrp: 280, itemCost: 280, totalPaid: 324.97, marketLow: 250, marketMid: 310, marketHigh: 400, marketSource: 'estimated', liquidity: 'medium', savingsMethods: [], notes: 'Pre-order.', url: '', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/vi.jpg', purchaseDate: '2025-09-05', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 12.0, widthIn: null, depthIn: null, weightLbs: null }, status: 'owned' },
  { id: 'thing', name: 'The Thing', franchise: 'Marvel (Fantastic Four)', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 219.99, itemCost: 198, totalPaid: 229.78, marketLow: 180, marketMid: 210, marketHigh: 260, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale'], notes: 'Iron Studios US Order #34774, confirmed Jan 17 2026. MSRP $219.99, WELCOMEIRON promo -$21.99 = $198 paid. Arrived Jan 22 2026.', url: 'https://ironstudios.com/products/statue-the-thing-fantastic-four-the-first-steps-art-scale-1-10-iron-studios', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/thing.jpg', purchaseDate: '2026-01-17', releaseDate: null, editionNumber: null, acquisitionDate: '2026-01-22', dimensions: { heightIn: 10.2, widthIn: 7.5, depthIn: 7.0, weightLbs: 11.6 }, status: 'owned' },
  { id: 'mr-fantastic', name: 'Mister Fantastic', franchise: 'Marvel (Fantastic Four)', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 205, itemCost: 205, totalPaid: 205, marketLow: 180, marketMid: 210, marketHigh: 260, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife. Cost recorded at MSRP for estate/insurance tracking.', url: 'https://ironstudios.com/products/statue-mister-fantastic-the-fantastic-four-first-steps-art-scale-1-10-iron-studios', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/mr-fantastic.jpg', purchaseDate: '2025-11-20', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 10.2, widthIn: 7.9, depthIn: 5.3, weightLbs: 8.64 }, status: 'owned' },
  { id: 'human-torch', name: 'Human Torch', franchise: 'Marvel (Fantastic Four)', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 225, itemCost: 225, totalPaid: 225, marketLow: 180, marketMid: 210, marketHigh: 260, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife. Cost recorded at MSRP for estate/insurance tracking.', url: 'https://ironstudios.com/products/statue-human-torch-the-fantastic-four-first-steps-art-scale-1-10-iron-studios', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/human-torch.jpg', purchaseDate: '2025-11-20', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 8.2, widthIn: 4.6, depthIn: 4.5, weightLbs: 10.27 }, status: 'owned' },
  { id: 'invisible-woman', name: 'Invisible Woman', franchise: 'Marvel (Fantastic Four)', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 205, itemCost: 205, totalPaid: 205, marketLow: 180, marketMid: 210, marketHigh: 260, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife. Cost recorded at MSRP for estate/insurance tracking.', url: 'https://ironstudios.com/products/statue-invisible-woman-the-fantastic-four-first-steps-art-scale-1-10-iron-studios', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/invisible-woman.jpg', purchaseDate: '2025-11-20', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 10.8, widthIn: 7.2, depthIn: 7.7, weightLbs: 1.9 }, status: 'owned' },
  { id: 'silver-surfer', name: 'Silver Surfer', franchise: 'Marvel (Fantastic Four)', studio: 'Iron Studios', category: '1:10 Art Scale Statue', edition: 'Standard', rarityTier: 'T6', productionRun: null, msrp: 235, itemCost: 235, totalPaid: 235, marketLow: 180, marketMid: 210, marketHigh: 260, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife. Pre-order. Cost at MSRP.', url: 'https://ironstudios.com/products/pre-order-statue-silver-surfer-fantastic-four-art-scale-1-10-iron-studios', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/silver-surfer.jpg', purchaseDate: '2025-11-20', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 10.4, widthIn: 7.0, depthIn: 10.7, weightLbs: 1.8 }, status: 'pre-order' },
  // ── NEW: Batman Family Q-Master (QMx) — gift from wife Dec 2019
  { id: 'batman-qmaster', name: 'Batman Family Q-Master Diorama', franchise: 'DC Comics', studio: 'Quantum Mechanix (QMx)', category: 'Q-Master Diorama', edition: 'Limited Edition', rarityTier: 'T5', productionRun: 5000, msrp: 166.60, itemCost: 166.60, totalPaid: 178.26, marketLow: 260, marketMid: 320, marketHigh: 397, marketSource: 'verified', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife (Norma Amazon order #111-9578171-9205849, Dec 3 2019). Paid $166.60 + $11.66 tax. Piece #1320/5000. Verified eBay $243-$397 active listings.', url: 'https://www.sideshow.com/collectibles/dc-comics-batman-family-q-master-quantum-mechanix-904408', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/batman-qmaster.jpg', purchaseDate: '2019-12-03', releaseDate: null, editionNumber: '1320', acquisitionDate: null, dimensions: { heightIn: 15.0, widthIn: 8.0, depthIn: 9.0, weightLbs: 5.65 }, status: 'owned' },

  // ── NEW: Batman by Andy Kubert Mini Statue (DC Collectibles) — gift from wife Feb 2019
  { id: 'batman-kubert', name: 'Batman — Designer Series by Andy Kubert', franchise: 'DC Comics', studio: 'DC Collectibles', category: 'Mini Statue', edition: 'Designer Series', rarityTier: 'T5', productionRun: 5000, msrp: 60, itemCost: 58.17, totalPaid: 58.17, marketLow: 150, marketMid: 200, marketHigh: 280, marketSource: 'verified', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife (Norma Amazon order #113-0240029-7072254, Feb 26 2019). Paid $58.17. Piece #3048/5000. Verified eBay $140-$225 used listings.', url: 'https://us.amazon.com/dp/B071DQYHDZ', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/batman-kubert.jpg', purchaseDate: '2019-02-26', releaseDate: null, editionNumber: '3048', acquisitionDate: null, dimensions: { heightIn: 4.0, widthIn: 5.0, depthIn: 7.0, weightLbs: 1.0 }, status: 'owned' },

  { id: 'nightcrawler', name: 'Nightcrawler — BDS Art Scale 1/10', franchise: 'Marvel (X-Men)', studio: 'Iron Studios', category: '1:10 BDS Art Scale Statue', edition: 'Standard (Limited)', rarityTier: 'T6', productionRun: null, msrp: 169.99, itemCost: 169.99, totalPaid: 169.99, marketLow: 160, marketMid: 200, marketHigh: 260, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife. BDS = Battle Diorama Series — more elaborate base than standard Art Scale (sentinel wreckage + teleport cloud effects). Currently sold out at Iron Studios. X-Men piece pairs well with Mystique (also gifted).', url: 'https://ironstudios.com/products/statue-nightcrawler-x-men-bds-art-scale-1-10-iron-studios', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/nightcrawler.jpg', purchaseDate: '2021-12-25', releaseDate: null, editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 8.0, widthIn: 7.0, depthIn: 5.1, weightLbs: 2.0 }, status: 'owned' },
  { id: 'mystique', name: 'Mystique — Restin State', franchise: 'Marvel (X-Men)', studio: 'Diamond Select', category: 'Premier Collection Statue', edition: 'Premier Collection', rarityTier: 'T5', productionRun: 3000, msrp: 180, itemCost: 180, totalPaid: 180, marketLow: 150, marketMid: 180, marketHigh: 230, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['gift'], notes: 'Gift from wife (Neighborhood Comics). Cost at MSRP. Weight < 1.0 lb per specs.', url: 'https://neighborhoodcomics.com/products/premier-collection-mystique-restin-state', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/mystique.jpg', purchaseDate: null, releaseDate: null, editionNumber: '0109', acquisitionDate: null, dimensions: { heightIn: 12.0, widthIn: 6.0, depthIn: 7.0, weightLbs: null }, status: 'owned' },
  { id: 'cable-hope', name: 'Cable with Hope', franchise: 'Marvel (X-Force)', studio: 'XM Studios', category: '1/4 Scale Statue', edition: 'Limited Edition', rarityTier: 'T3', productionRun: 800, msrp: 1316.33, itemCost: 824, totalPaid: 824, marketLow: 925, marketMid: 1450, marketHigh: 1900, marketSource: 'estimated', liquidity: 'medium', savingsMethods: ['sale', 'bundle'], notes: 'LE 800. Spec Fiction bundle with Apocalypse, Jun 6 2026. $1,648 total split evenly at $824 each (equal marketMid allocation). Official XM MSRP SGD 1,699 / USD $1,316.33. Free shipping.', url: 'https://xm-studios.com/guest/shop/detail/cable-with-hope', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/cable-hope.jpg', purchaseDate: '2026-06-06', releaseDate: '2021-11-10', editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 19.68, widthIn: 14.17, depthIn: 14.96, weightLbs: 44.09 }, status: 'owned' },
  { id: 'apocalypse', name: 'Apocalypse', franchise: 'Marvel (X-Men)', studio: 'XM Studios', category: '1/4 Scale Statue', edition: 'Limited Edition', rarityTier: 'T3', productionRun: 999, msrp: 1626, itemCost: 824, totalPaid: 824, marketLow: 900, marketMid: 1450, marketHigh: 1800, marketSource: 'verified', liquidity: 'medium', savingsMethods: ['sale', 'bundle'], notes: 'LE 999. Spec Fiction bundle with Cable & Hope, Jun 6 2026. $1,648 total split evenly at $824 each (equal marketMid allocation). Official XM MSRP SGD 2,099 / USD $1,626. Free shipping. Verified eBay market.', url: 'https://xm-studios.com/guest/shop/detail/apocalypse', imageUrl: 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs/apocalypse.jpg', purchaseDate: '2026-06-06', releaseDate: '2021-09-29', editionNumber: null, acquisitionDate: null, dimensions: { heightIn: 32.3, widthIn: 24.4, depthIn: 25.2, weightLbs: 83.8 }, status: 'owned' },
];

// =============================================================================
// CONSTANTS
// =============================================================================

const RARITY_TIERS = {
  // RPG quality scale — mirrors WoW/Diablo item quality conventions
  T1: { label: 'Ultra Rare (<50)',   short: 'Ultra Rare', rpg: 'Artifact',   color: '#E05050' }, // Red    — rarest
  T2: { label: 'Very Rare (50–249)', short: 'Very Rare',  rpg: 'Legendary',  color: '#FF8C00' }, // Orange
  T3: { label: 'Rare (250–999)',     short: 'Rare',       rpg: 'Epic',       color: '#A335EE' }, // Purple
  T4: { label: 'Limited (1k–2.5k)', short: 'Limited',    rpg: 'Rare',       color: '#0090FF' }, // Blue
  T5: { label: 'Wide (2.5k–10k)',   short: 'Wide',       rpg: 'Uncommon',   color: '#1EFF00' }, // Green
  T6: { label: 'Mass (10k+)',        short: 'Mass',       rpg: 'Common',     color: '#9D9D9D' }, // Gray   — most common
  Unknown: { label: 'Unknown',       short: '?',          rpg: 'Unknown',    color: '#9D9D9D' },
};

const RISK_COLORS = {
  Conservative: '#5aaf6a',
  Balanced:     '#c9a55c',
  Speculative:  '#c07070',
};

const SAVINGS_LABELS = {
  'sale': 'Sale', 'rewards': 'Rewards', 'gift-card': 'Gift Card', 'black-friday': 'Black Friday',
  'free-bonus': 'Free Bonus', 'seconds-discount': 'Seconds', 'gift': 'Gift', 'loyalty': 'Loyalty',
  'bundle': 'Bundle',
};

const STATUS_LABELS = {
  'owned': 'Owned', 'pre-order': 'Pre-Order', 'payment-plan': 'Payment Plan', 'wishlist': 'Wishlist',
};

const LIQUIDITY_LABELS = {
  'high': { label: 'High', desc: 'Strong collector base, typically sells in <30 days', color: '#a8c89b' },
  'medium': { label: 'Medium', desc: 'Solid niche demand, typically 1-3 months to sell', color: '#c9a55c' },
  'low': { label: 'Low', desc: 'Limited resale market, may take 6+ months', color: '#c89b9b' },
};

const SORT_OPTIONS = [
  { key: 'name', label: 'Name' },
  { key: 'msrp', label: 'MSRP' },
  { key: 'itemCost', label: 'Item Paid' },
  { key: 'totalPaid', label: 'Total OOP' },
  { key: 'overhead', label: 'Overhead' },
  { key: 'marketMid', label: 'Market Value' },
  { key: 'savingsAbs', label: 'Savings $' },
  { key: 'savingsPct', label: 'Savings %' },
  { key: 'gainPct', label: 'Gain %' },
  { key: 'cagrPct', label: 'CAGR %' },
  { key: 'holdingDays', label: 'Holding Period' },
  { key: 'releaseDate', label: 'Release Date' },
  { key: 'purchaseDate', label: 'Purchase Date' },
  { key: 'rarityTier', label: 'Rarity' },
  { key: 'productionRun', label: 'Production Run' },
  { key: 'liquidity', label: 'Liquidity' },
  { key: 'studio', label: 'Studio' },
  { key: 'franchise', label: 'Franchise' },
];

// Tooltip definitions — what each metric actually means
const TOOLTIPS = {
  msrp: "Manufacturer's official retail price. The source of truth set by the creator (Sideshow, XM, Prime 1, etc.). Distributor undercuts are missed deals, not discounts on MSRP.",
  itemCost: "What you paid for the item itself, after discounts/rewards but BEFORE tax, shipping, or tariff. This is the number used to measure deal quality vs MSRP.",
  totalPaid: "All-in cost: item + tax + shipping + tariff. This is your true cost basis for return calculations.",
  overhead: "Tax + shipping + tariff. Pure cost of getting the item to your door. NOT a deal metric — even free items can have heavy overhead.",
  marketValue: "Mid-point estimate of current secondary-market resell value. Based on recent eBay sold listings and forum sales where available.",
  marketRange: "Realistic low-to-high band of what a piece sells for today. Low ≈ quick-flip price. High ≈ patient seller, mint condition, premium listing.",
  savingsAbs: "Dollar amount saved vs MSRP at point of sale. MSRP minus Item Paid. Measures how good the deal was when you bought.",
  savingsPct: "Percentage discount captured vs MSRP. (MSRP - Item Paid) / MSRP. The deal quality, normalized.",
  gainAbs: "Unrealized profit: current market mid minus total out-of-pocket cost (includes overhead). The honest mark-to-market number.",
  gainPct: "Return on total invested capital, mark-to-market. (Market - Total Paid) / Total Paid.",
  rarity: "Rarity tier by production run — color-coded like RPG item quality. T1 Artifact (red, <50 pcs) → T2 Legendary (orange) → T3 Epic (purple) → T4 Rare (blue) → T5 Uncommon (green) → T6 Common (gray, 10k+). Lower tier number = scarcer.",
  liquidity: "How easily the piece can be sold. Driven by collector base size, franchise popularity, and studio reputation. Affects how realistic the market value is.",
  productionRun: "Total number of this piece made worldwide. Lower = scarcer = typically better long-term value retention.",
  marketSource: "Verified = researched on eBay/forums. Estimated = modeled from category patterns (studio, rarity, franchise).",
  releaseDate: "The manufacturer's official release date — when the product ships to distributors/customers. For pre-orders, this is the estimated ship window.",
  acquisitionDate: "The date you personally received the piece. May differ slightly from delivery tracking.",
  editionNumber: "Your specific piece number within the edition (e.g. #068 from a run of 800). Confirms your piece is legitimate and adds precision to rarity.",
  spread: "Difference between high and low estimates. Wide spread = uncertain market. Tight spread = consensus pricing.",
  liquidation: "Estimated proceeds if the entire collection were liquidated within 30 days. Uses market low × a liquidity discount factor (high=1.0, medium=0.85, low=0.65). This is the conservative floor — what an estate or quick sale would realistically net.",
};

// Per-item hero image focal point. CSS object-position: "<x> <y>".
// Unlisted items default to 'center 27%' (collection median).
const IMG_POSITION = {
  'batman-joker':     'center 27%',
  'magneto-prestige': 'center 32%',
  'red-hood-samurai': 'center 61%',
  'ww-hydra':         'center 20%',
  'white-vision':     'center 20%',
  'cable-hope':       'center 20%',
  'apocalypse':       'center 47%',
  'rhino':            'center 29%',
  'hulk-gamma':       'center 20%',
  'iron-man-xlii':    'center 46%',
  'killer-croc':      'center 27%',
  'rogue-gambit':     'center 12%',
  'cyclops':          'center 15%',
  'batgirl':          'center 26%',
  'red-sonja':        'center 50%',
  'bayek':            'center 16%',
  'darkseid':         'center 29%',
  'ekko':             'center 63%',
  'succubus':         'center 28%',
  'ultra-magnus':     'center 27%',
  'ahri':             'center 20%',
  'iron-man-neon':    'center 19%',
  'pennywise':        'center 55%',
  'pa-jinx':          'center 58%',
  'pa-vi':            'center 16%',
};
const IMG_POSITION_DEFAULT = 'center 27%';

// =============================================================================
// IMAGE PROXY — routes through wsrv.nl to bypass hotlink protection
// Most collectibles CDNs (Sideshow, XM Studios, etc.) block Referer from
// external domains. wsrv.nl fetches server-side and re-serves the image.
// =============================================================================

// ─── IMAGE LOADER ────────────────────────────────────────────────────────────
// Claude.ai artifacts run in a sandboxed iframe whose img-src CSP may block
// external <img> tags even when CORS is open. Fetching through JS (connect-src)
// then converting to a data URL sidesteps the restriction entirely.
// Module-level cache so each image is only downloaded once per session.
const _imgCache = new Map();

function useRemoteImage(url) {
  const cached = _imgCache.get(url);
  const [src, setSrc]     = React.useState(cached || null);
  const [failed, setFailed] = React.useState(false);

  React.useEffect(() => {
    if (!url || cached) return;
    let alive = true;
    fetch(url)
      .then(r => { if (!r.ok) throw r.status; return r.blob(); })
      .then(blob => new Promise((res, rej) => {
        const fr = new FileReader();
        fr.onload  = () => res(fr.result);
        fr.onerror = rej;
        fr.readAsDataURL(blob);
      }))
      .then(dataUrl => {
        _imgCache.set(url, dataUrl);
        if (alive) setSrc(dataUrl);
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [url]);

  return { src, failed };
}
// Hotlinking from Sideshow/XM/PureArts is blocked by their servers, and proxies
// are unreliable. Best fix: self-host. Drop each statue photo into ONE folder on
// a server you control, named by the item's id (e.g. human-torch.jpg, ahri.jpg),
// then set IMAGE_BASE_URL below. On that folder, set the response header:
//     Access-Control-Allow-Origin: *
// ...and images will "just work" with no proxy.
//
// Leave IMAGE_BASE_URL = '' to keep using each item's imageUrl via the wsrv.nl
// proxy (best-effort; may still fail for hotlink-protected CDNs).
const IMAGE_BASE_URL = 'https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main/images/thumbs';
const IMAGE_EXT      = 'jpg';     // file extension you save them as
const USE_PROXY      = true;      // ignored once IMAGE_BASE_URL is set

// Returns the best image source for an item (self-hosted preferred).
const resolveImg = (item) => {
  if (IMAGE_BASE_URL) return `${IMAGE_BASE_URL.replace(/\/$/, '')}/${item.id}.${IMAGE_EXT}`;
  return item.imageUrl || null;
};

const proxyImg = (url) => {
  if (!url) return null;
  if (url.startsWith('data:')) return url;            // base64 — never proxy
  if (IMAGE_BASE_URL) return url;                     // self-hosted w/ CORS — no proxy
  if (!USE_PROXY) return url;
  return `https://wsrv.nl/?url=${encodeURIComponent(url)}&n=-1`;
};

const fmt$ = (n) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
};

const fmtPct = (n) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return `${n >= 0 ? '+' : ''}${n.toFixed(0)}%`;
};

const computeMetrics = (item) => {
  const msrp = item.msrp || 0;
  const itemCost = item.itemCost;
  const marketMid = item.marketMid || 0;
  const marketLow = item.marketLow || 0;
  const marketHigh = item.marketHigh || 0;
  const totalPaid = item.totalPaid;

  const savingsAbs = itemCost !== null && itemCost !== undefined ? msrp - itemCost : null;
  const savingsPct = itemCost !== null && itemCost !== undefined && msrp > 0
    ? ((msrp - itemCost) / msrp) * 100 : null;

  const overhead = totalPaid !== null && totalPaid !== undefined && itemCost !== null && itemCost !== undefined
    ? totalPaid - itemCost : null;

  const gainAbs = totalPaid !== null && totalPaid !== undefined ? marketMid - totalPaid : null;
  const gainPct = totalPaid !== null && totalPaid !== undefined && totalPaid > 0
    ? ((marketMid - totalPaid) / totalPaid) * 100
    : (totalPaid === 0 && marketMid > 0 ? Infinity : null);

  // Spread as % of mid — wider = less certain
  const spreadPct = marketMid > 0 ? ((marketHigh - marketLow) / marketMid) * 100 : 0;

  // Holding period + CAGR from purchase date
  let holdingDays = null;
  let cagrPct = null;
  if (item.purchaseDate) {
    const purchased = new Date(item.purchaseDate);
    holdingDays = Math.floor((new Date() - purchased) / 86400000);
    if (itemCost > 0 && holdingDays > 30 && marketMid > 0) {
      cagrPct = (Math.pow(marketMid / itemCost, 365 / holdingDays) - 1) * 100;
    }
  }

  const riskClass =
    (item.liquidity === 'high' && ['T3','T4','T5','T6'].includes(item.rarityTier))
      ? 'Conservative'
    : (item.liquidity === 'low' || ['T1','T2'].includes(item.rarityTier))
      ? 'Speculative'
    : 'Balanced';

  return { savingsAbs, savingsPct, overhead, gainAbs, gainPct, spreadPct, holdingDays, cagrPct, riskClass };
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

// ---------------------------------------------------------------------------
// Cross-environment persistence.
// In the Claude artifact sandbox, window.storage exists (per-user KV store).
// On GitHub Pages / local / any normal browser, it does NOT — so we fall back
// to localStorage. Same async interface either way, so call sites don't change.
// ---------------------------------------------------------------------------
const STORAGE_KEY = 'collection-overrides';
const store = {
  async get(key) {
    if (typeof window !== 'undefined' && window.storage && window.storage.get) {
      return window.storage.get(key);
    }
    try {
      const value = localStorage.getItem(key);
      return value != null ? { value } : null;
    } catch (e) { return null; }
  },
  async set(key, value) {
    if (typeof window !== 'undefined' && window.storage && window.storage.set) {
      return window.storage.set(key, value);
    }
    try { localStorage.setItem(key, value); } catch (e) {}
  },
};

export default function CollectionApp() {
  const [overrides, setOverrides] = useState({});
  const [loaded, setLoaded] = useState(false);

  const [search, setSearch] = useState('');
  const [filterFranchise, setFilterFranchise] = useState('all');
  const [filterStudio, setFilterStudio] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRarity, setFilterRarity] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLiquidity, setFilterLiquidity] = useState('all');
  const [sortKey, setSortKey] = useState('marketMid');
  const [sortDir, setSortDir] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [modalItemId, setModalItemId] = useState(null);
  const [activeTooltip, setActiveTooltip] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const result = await store.get(STORAGE_KEY);
        if (result && result.value) setOverrides(JSON.parse(result.value));
      } catch (e) {}
      setLoaded(true);
    })();
  }, []);

  const saveOverrides = async (next) => {
    setOverrides(next);
    try { await store.set(STORAGE_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const items = useMemo(() => SEED_ITEMS.map((s) => ({ ...s, ...(overrides[s.id] || {}) })), [overrides]);

  const updateItem = (id, patch) => saveOverrides({ ...overrides, [id]: { ...(overrides[id] || {}), ...patch } });
  const resetItem = (id) => { const next = { ...overrides }; delete next[id]; saveOverrides(next); };

  const uniques = useMemo(() => {
    const set = (key) => Array.from(new Set(items.map((i) => i[key]))).filter(Boolean).sort();
    return { franchise: set('franchise'), studio: set('studio'), category: set('category') };
  }, [items]);

  const visible = useMemo(() => {
    let arr = items.map((i) => ({ ...i, ...computeMetrics(i) }));
    if (search) {
      const q = search.toLowerCase();
      arr = arr.filter((i) => i.name.toLowerCase().includes(q) || i.franchise.toLowerCase().includes(q) || i.studio.toLowerCase().includes(q) || (i.notes || '').toLowerCase().includes(q));
    }
    if (filterFranchise !== 'all') arr = arr.filter((i) => i.franchise === filterFranchise);
    if (filterStudio !== 'all') arr = arr.filter((i) => i.studio === filterStudio);
    if (filterCategory !== 'all') arr = arr.filter((i) => i.category === filterCategory);
    if (filterRarity !== 'all') arr = arr.filter((i) => i.rarityTier === filterRarity);
    if (filterStatus !== 'all') arr = arr.filter((i) => i.status === filterStatus);
    if (filterLiquidity !== 'all') arr = arr.filter((i) => i.liquidity === filterLiquidity);

    arr.sort((a, b) => {
      let va = a[sortKey], vb = b[sortKey];
      if (va === null || va === undefined) va = sortDir === 'asc' ? Infinity : -Infinity;
      if (vb === null || vb === undefined) vb = sortDir === 'asc' ? Infinity : -Infinity;
      if (typeof va === 'string') return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      return sortDir === 'asc' ? va - vb : vb - va;
    });
    return arr;
  }, [items, search, filterFranchise, filterStudio, filterCategory, filterRarity, filterStatus, filterLiquidity, sortKey, sortDir]);

  const totals = useMemo(() => {
    const committed = visible.filter((i) => i.status !== 'wishlist');
    const groupBy = (key) => {
      const m = {};
      committed.forEach((i) => { m[i[key]] = (m[i[key]] || 0) + (i.marketMid || 0); });
      return Object.entries(m).sort((a, b) => b[1] - a[1]);
    };
    const sum = (key) => committed.reduce((s, i) => s + (i[key] || 0), 0);

    const itemSpend = sum('itemCost');
    const overhead = committed.reduce((s, i) => s + (i.totalPaid || 0) - (i.itemCost || 0), 0);
    const totalPaid = sum('totalPaid');
    const marketMid = sum('marketMid');
    const marketLow = sum('marketLow');
    const marketHigh = sum('marketHigh');
    const msrp = sum('msrp');
    const savingsAbs = committed.reduce((s, i) => s + (i.msrp || 0) - (i.itemCost || 0), 0);
    const gainAbs = marketMid - totalPaid;

    // Liquidity-weighted market value: higher liquidity items get more credit
    const liquidityWeight = { high: 1.0, medium: 0.85, low: 0.65 };
    const liquidAdjusted = committed.reduce((s, i) => s + (i.marketMid || 0) * (liquidityWeight[i.liquidity] || 0.85), 0);

    const liquidationValue = committed.reduce((s, i) =>
      s + (i.marketLow || 0) * (liquidityWeight[i.liquidity] || 0.85), 0);

    const studioMids = {};
    committed.forEach(i => {
      studioMids[i.studio] = (studioMids[i.studio] || 0) + (i.marketMid || 0);
    });
    const hhi = Object.values(studioMids).reduce((sum, v) =>
      sum + Math.pow(v / (marketMid || 1), 2), 0) * 10000;

    return {
      count: visible.length, committedCount: committed.length,
      msrp, itemSpend, overhead, totalPaid, marketMid, marketLow, marketHigh,
      savingsAbs, gainAbs, liquidAdjusted, liquidationValue, hhi,
      byStudio: groupBy('studio'),
      byFranchise: groupBy('franchise'),
      byRarity: groupBy('rarityTier'),
      topByMarket: [...committed].sort((a, b) => (b.marketMid || 0) - (a.marketMid || 0)).slice(0, 5),
      topBySavings: [...committed].filter(i => i.savingsAbs > 0).sort((a, b) => (b.savingsAbs || 0) - (a.savingsAbs || 0)).slice(0, 5),
      topByGain: [...committed].filter(i => i.gainAbs > 0).sort((a, b) => (b.gainAbs || 0) - (a.gainAbs || 0)).slice(0, 5),
    };
  }, [visible]);

  const activeFilterCount = (filterFranchise !== 'all' ? 1 : 0) + (filterStudio !== 'all' ? 1 : 0) + (filterCategory !== 'all' ? 1 : 0) + (filterRarity !== 'all' ? 1 : 0) + (filterStatus !== 'all' ? 1 : 0) + (filterLiquidity !== 'all' ? 1 : 0);
  const clearFilters = () => { setFilterFranchise('all'); setFilterStudio('all'); setFilterCategory('all'); setFilterRarity('all'); setFilterStatus('all'); setFilterLiquidity('all'); setSearch(''); };

  if (!loaded) {
    return <div style={{ background: '#0a0a0b', color: '#f5f1e8', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'serif' }}>Loading…</div>;
  }

  return (
    <div style={{ background: 'linear-gradient(180deg, #0a0a0b 0%, #111114 100%)', minHeight: '100vh', color: 'var(--c-primary)', fontFamily: '"Manrope", -apple-system, sans-serif', paddingBottom: 64 }} onClick={() => setActiveTooltip(null)}><div style={{ maxWidth: 1920, margin: '0 auto' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,600&family=Manrope:wght@300;400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        /* ── Fluid typography (WCAG 2.2 AA ≥ 4.5:1 on dark bg) ── */
        :root {
          --t-xs:   clamp(10px, 0.55vw + 8.8px, 12px);
          --t-sm:   clamp(11px, 0.65vw + 9.7px, 13px);
          --t-base: clamp(13px, 0.8vw + 11.4px, 15px);
          --t-md:   clamp(14px, 0.9vw + 12.2px, 17px);
          --t-lg:   clamp(16px, 1.1vw + 13.7px, 20px);
          --t-xl:   clamp(18px, 1.4vw + 15px, 24px);
          --t-2xl:  clamp(22px, 1.8vw + 18px, 30px);
          /* WCAG-safe neutrals on #131316 (bg L≈0.005) — all ≥ 4.5:1 */
          --c-primary:   #edeae2;   /* 16.8:1 */
          --c-secondary: #b2ada4;   /*  8.9:1 */
          --c-muted:     #9a9690;   /*  6.4:1 */
          --c-dim:       #848078;   /*  4.9:1 */
          --c-faint:     #7a7670;   /*  4.5:1 — minimum AA */
          --c-gold:      #d4a750;
          --c-gold-dim:  #a07828;
          --gap-card:    clamp(10px, 1.2vw, 16px);
          --pad-card:    clamp(12px, 2vw, 18px);
          --r-card:      12px;
        }
        .display { font-family: 'Fraunces', Georgia, serif; font-weight: 400; letter-spacing: -0.01em; }
        .mono { font-family: 'SF Mono', 'Cascadia Code', Consolas, monospace; font-variant-numeric: tabular-nums; }
        button { font-family: inherit; cursor: pointer; }
        select, input, textarea { font-family: inherit; }
        /* ── Responsive grids ── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--gap-card);
        }
        .cards-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: var(--gap-card);
        }
        @media (min-width: 1024px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .cards-grid { grid-template-columns: repeat(2, 1fr); }
        }
        /* ── Swipeable mini-stats (mobile ≤1023px shows 2 at a time, swipe for more) ── */
        .mini-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 5px;
        }
        @media (max-width: 1023px) {
          .mini-stats {
            display: flex;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            gap: 5px;
          }
          .mini-stats::-webkit-scrollbar { display: none; }
          .mini-stats > * {
            flex: 0 0 calc(50% - 2.5px);
            min-width: 0;
            scroll-snap-align: start;
          }
        }
        .swipe-dots { display: none; justify-content: center; gap: 5px; margin-top: 7px; }
        @media (max-width: 1023px) { .swipe-dots { display: flex; } }
        .swipe-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #3a3a40; transition: background 0.25s, transform 0.25s;
          cursor: pointer;
        }
        .swipe-dot.active { background: var(--c-gold); transform: scale(1.25); }
        @keyframes spin { to { transform: rotate(360deg); } }
        button:focus-visible, a:focus-visible, select:focus-visible, input:focus-visible {
          outline: 2px solid #d4a750; outline-offset: 2px;
        }
        ::-webkit-scrollbar { height: 6px; width: 6px; }
        ::-webkit-scrollbar-track { background: #16161a; }
        ::-webkit-scrollbar-thumb { background: #3a3a40; border-radius: 3px; }
        /* ── Tooltip edge safety ── */
        .tooltip-pop { position: absolute; z-index: 200; }
        .tooltip-pop.align-left  { left: 0; transform: none; }
        .tooltip-pop.align-right { right: 0; left: auto; transform: none; }
        .tooltip-pop.align-center{ left: 50%; transform: translateX(-50%); }
        .tooltip-pop.above { bottom: 120%; top: auto; }
        .tooltip-pop.below { top: 120%; bottom: auto; }
      `}</style>

      <header style={{ padding: '24px 16px 16px', borderBottom: '1px solid #1f1f24' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <h1 className="display" style={{ fontSize: 28, fontWeight: 400, margin: 0 }}>The Archive</h1>
          <span className="mono" style={{ fontSize: 12, color: 'var(--c-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{visible.length} / {items.length}</span>
        </div>
        <p style={{ fontSize: 11, color: 'var(--c-muted)', margin: 0, letterSpacing: '0.02em', lineHeight: 1.5 }}>
          Creator MSRP · resell ranges · liquidity-weighted · tap <Info size={10} style={{ display: 'inline', verticalAlign: 'middle' }} /> to learn any metric
        </p>

        <div className="stats-grid" style={{ marginTop: 20 }}>
          <Stat label="Item Spend" tooltipKey="itemCost" value={fmt$(totals.itemSpend)} sub="items only" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Stat label="Overhead" tooltipKey="overhead" value={fmt$(totals.overhead)} sub="ship · tax · tariff" tone="muted" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Stat label="Savings vs MSRP" tooltipKey="savingsAbs" value={fmt$(totals.savingsAbs)} sub={`${totals.msrp > 0 ? ((totals.savingsAbs / totals.msrp) * 100).toFixed(0) : 0}% off retail`} tone={totals.savingsAbs > 0 ? 'positive' : 'neutral'} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Stat label="Market Value" tooltipKey="marketValue" value={fmt$(totals.marketMid)} sub={`range ${fmt$(totals.marketLow)}–${fmt$(totals.marketHigh)}`} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Stat label="Total OOP" tooltipKey="totalPaid" value={fmt$(totals.totalPaid)} sub="all-in invested" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Stat label="Unrealized Gain" tooltipKey="gainAbs" value={fmt$(totals.gainAbs)} sub={`liq-adj ${fmt$(totals.liquidAdjusted - totals.totalPaid)}`} tone={totals.gainAbs > 0 ? 'positive' : totals.gainAbs < 0 ? 'negative' : 'neutral'} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
          <Stat label="Liquidation Value" tooltipKey="liquidation" value={fmt$(totals.liquidationValue)} sub="market low × liquidity factor · 30-day floor" tone="muted" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} />
        </div>

        <button onClick={(e) => { e.stopPropagation(); setShowPortfolio(!showPortfolio); }} style={{ marginTop: 12, width: '100%', padding: '10px 14px', background: showPortfolio ? '#3a2f1c' : '#16161a', border: `1px solid ${showPortfolio ? '#7a5d2e' : '#2a2a30'}`, borderRadius: 8, color: showPortfolio ? '#c9a55c' : '#f5f1e8', fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <BarChart3 size={14} /> Portfolio Insights {showPortfolio ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showPortfolio && <PortfolioInsights totals={totals} />}
      </header>

      <div style={{ padding: 16, position: 'sticky', top: 0, background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(12px)', zIndex: 10, borderBottom: '1px solid #1f1f24' }}>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--c-dim)' }} />
          <input type="text" placeholder="Search the archive…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: '100%', padding: '10px 12px 10px 34px', background: '#16161a', border: '1px solid #2a2a30', borderRadius: 8, color: '#f5f1e8', fontSize: 14, outline: 'none' }} />
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={(e) => { e.stopPropagation(); setShowFilters(!showFilters); }} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: activeFilterCount > 0 ? '#3a2f1c' : '#16161a', border: `1px solid ${activeFilterCount > 0 ? '#7a5d2e' : '#2a2a30'}`, borderRadius: 8, color: activeFilterCount > 0 ? '#c9a55c' : '#f5f1e8', fontSize: 13, fontWeight: 500 }}>
            <Filter size={13} /> Filter
            {activeFilterCount > 0 && <span style={{ background: '#c9a55c', color: '#0a0a0b', borderRadius: 99, padding: '0 6px', fontSize: 11, fontWeight: 700 }}>{activeFilterCount}</span>}
          </button>
          <div style={{ flex: 1, display: 'flex', gap: 6, alignItems: 'center' }}>
            <select value={sortKey} onChange={(e) => setSortKey(e.target.value)} style={{ flex: 1, padding: '8px 10px', background: '#16161a', border: '1px solid #2a2a30', borderRadius: 8, color: '#f5f1e8', fontSize: 13, appearance: 'none' }}>
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>Sort: {o.label}</option>)}
            </select>
            <button onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')} style={{ padding: 8, background: '#16161a', border: '1px solid #2a2a30', borderRadius: 8, color: '#f5f1e8', display: 'flex' }}>
              {sortDir === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
            </button>
          </div>
        </div>

        {showFilters && (
          <div style={{ marginTop: 12, padding: 12, background: '#16161a', border: '1px solid #2a2a30', borderRadius: 8, display: 'grid', gap: 10 }}>
            <FilterRow label="Franchise" value={filterFranchise} onChange={setFilterFranchise} options={uniques.franchise} />
            <FilterRow label="Studio" value={filterStudio} onChange={setFilterStudio} options={uniques.studio} />
            <FilterRow label="Category" value={filterCategory} onChange={setFilterCategory} options={uniques.category} />
            <FilterRow label="Rarity" value={filterRarity} onChange={setFilterRarity} options={Object.keys(RARITY_TIERS)} optionLabel={(k) => `${k} — ${RARITY_TIERS[k].label}`} />
            <FilterRow label="Status" value={filterStatus} onChange={setFilterStatus} options={['owned', 'pre-order', 'payment-plan', 'wishlist']} optionLabel={(k) => STATUS_LABELS[k]} />
            <FilterRow label="Liquidity" value={filterLiquidity} onChange={setFilterLiquidity} options={['high', 'medium', 'low']} optionLabel={(k) => LIQUIDITY_LABELS[k].label} />
            {activeFilterCount > 0 && <button onClick={clearFilters} style={{ padding: '8px 12px', background: 'transparent', border: '1px solid #5a4a2a', borderRadius: 6, color: '#c9a55c', fontSize: 12, fontWeight: 500, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><X size={12} /> Clear all filters</button>}
          </div>
        )}
      </div>

      <div className="cards-grid" style={{ padding: 16 }}>
        {visible.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'var(--c-dim)' }}>No items match your filters.</div>}
        {visible.map((item) => (
          <ItemCard
            key={item.id} item={item}
            onOpenModal={() => { setModalItemId(item.id); setEditingId(null); }}
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
        ))}
      </div>

      {modalItemId && (() => {
        const modalItem = visible.find(i => i.id === modalItemId);
        if (!modalItem) return null;
        return (
          <DetailModal
            item={modalItem}
            editing={editingId === modalItem.id}
            onEdit={() => setEditingId(modalItem.id)}
            onCloseEdit={() => setEditingId(null)}
            onUpdate={(patch) => updateItem(modalItem.id, patch)}
            onReset={() => resetItem(modalItem.id)}
            hasOverride={!!overrides[modalItem.id]}
            onClose={() => { setModalItemId(null); setEditingId(null); }}
            activeTooltip={activeTooltip}
            setActiveTooltip={setActiveTooltip}
          />
        );
      })()}
    </div></div>
  );
}

// =============================================================================
// TOOLTIP COMPONENT
// =============================================================================

function InfoTooltip({ tooltipKey, activeTooltip, setActiveTooltip, anchorId }) {
  const isActive = activeTooltip === anchorId;
  const text = TOOLTIPS[tooltipKey];
  const btnRef = useRef(null);
  const [align, setAlign] = React.useState('center');
  const [vert, setVert] = React.useState('below');
  if (!text) return null;

  const handleOpen = (e) => {
    e.stopPropagation();
    if (!isActive && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      // Horizontal: avoid clipping on left/right edges
      if (rect.left < 140) setAlign('align-left');
      else if (rect.right > vw - 140) setAlign('align-right');
      else setAlign('align-center');
      // Vertical: flip above if near bottom of viewport
      setVert(rect.bottom > vh - 160 ? 'above' : 'below');
    }
    setActiveTooltip(isActive ? null : anchorId);
  };

  return (
    <span style={{ position: 'relative', display: 'inline-flex', verticalAlign: 'middle', marginLeft: 4 }}>
      <button
        ref={btnRef}
        onClick={handleOpen}
        style={{ background: 'transparent', border: 'none', padding: 0, display: 'inline-flex', color: isActive ? '#d4a750' : 'var(--c-faint)', cursor: 'pointer', lineHeight: 1 }}
        aria-label={`Info: ${tooltipKey}`}
        aria-expanded={isActive}
      >
        <Info size={11} />
      </button>
      {isActive && (
        <div
          onClick={(e) => e.stopPropagation()}
          className={`tooltip-pop ${align} ${vert}`}
          style={{ minWidth: 220, maxWidth: 280, padding: '10px 13px', background: '#1c1c22', border: '1px solid #3a3020', borderRadius: 8, fontSize: 'var(--t-sm)', color: 'var(--c-secondary)', lineHeight: 1.55, boxShadow: '0 8px 28px rgba(0,0,0,0.6)', pointerEvents: 'none' }}
        >
          {text}
        </div>
      )}
    </span>
  );
}

// =============================================================================
// PORTFOLIO INSIGHTS
// =============================================================================

function PortfolioInsights({ totals }) {
  const hhiColor = totals.hhi > 2500 ? '#c07070' : totals.hhi > 1500 ? '#c9a55c' : '#5aaf6a';
  return (
    <div style={{ marginTop: 12, padding: 14, background: '#0e0e10', border: '1px solid #2a2a30', borderRadius: 10 }}>
      <div style={{ marginBottom: 18, padding: '10px 12px', background: '#131316', borderRadius: 8, border: `1px solid ${hhiColor}30`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>Studio Concentration (HHI)</div>
          <div style={{ fontSize: 12, color: 'var(--c-secondary)' }}>
            {totals.hhi > 2500
              ? 'Highly concentrated — top studio dominates resale risk'
              : totals.hhi > 1500
                ? 'Moderate — healthy but watch top 2 studios'
                : 'Well diversified across studios'}
          </div>
        </div>
        <div className="mono" style={{ fontSize: 22, fontWeight: 600, color: hhiColor, flexShrink: 0, marginLeft: 16 }}>
          {Math.round(totals.hhi).toLocaleString()}
        </div>
      </div>
      <ConcentrationBar title="By Studio" data={totals.byStudio} total={totals.marketMid} accent="#c9a55c" />
      <ConcentrationBar title="By Franchise" data={totals.byFranchise} total={totals.marketMid} accent="#9c7a4e" />
      <ConcentrationBar title="By Rarity" data={totals.byRarity} total={totals.marketMid} accent="#b89460" formatLabel={(k) => `${k} ${RARITY_TIERS[k]?.label || ''}`} />

      <TopList title="Top Holdings (Market Value)" icon={<Award size={11} />} items={totals.topByMarket} valueKey="marketMid" formatValue={fmt$} />
      <TopList title="Best Deals (Savings $)" icon={<Zap size={11} />} items={totals.topBySavings} valueKey="savingsAbs" formatValue={(v) => `${fmt$(v)} saved`} />
      <TopList title="Biggest Gainers (vs Paid)" icon={<TrendingUp size={11} />} items={totals.topByGain} valueKey="gainAbs" formatValue={(v) => `+${fmt$(v)}`} tone="#a8c89b" />
    </div>
  );
}

function ConcentrationBar({ title, data, total, accent, formatLabel }) {
  if (!data || data.length === 0 || total === 0) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {data.slice(0, 6).map(([key, value]) => {
          const pct = (value / total) * 100;
          return (
            <div key={key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--t-sm)', color: 'var(--c-secondary)', marginBottom: 2 }}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>{formatLabel ? formatLabel(key) : key}</span>
                <span className="mono" style={{ color: accent }}>{pct.toFixed(0)}% · {fmt$(value)}</span>
              </div>
              <div style={{ width: '100%', height: 4, background: '#1f1f24', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: accent, borderRadius: 2 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopList({ title, icon, items, valueKey, formatValue, tone = '#c9a55c' }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: tone }}>{icon}</span>{title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((it, idx) => (
          <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: idx < items.length - 1 ? '1px solid #1a1a1e' : 'none' }}>
            <span style={{ color: '#d4cfc4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '65%' }}>
              <span style={{ color: 'var(--c-dim)', marginRight: 6 }}>{idx + 1}.</span>{it.name}
            </span>
            <span className="mono" style={{ color: tone, flexShrink: 0 }}>{formatValue(it[valueKey])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// CARDS & SUB-COMPONENTS
// =============================================================================

function Stat({ label, value, sub, tone = 'neutral', tooltipKey, activeTooltip, setActiveTooltip }) {
  const toneColor = tone === 'positive' ? '#5aaf6a' : tone === 'negative' ? '#c07070' : tone === 'muted' ? '#9c8870' : 'var(--c-primary)';
  return (
    <div style={{ background: '#16161a', border: '1px solid #22222a', borderRadius: 10, padding: 'clamp(10px, 1.5vw, 14px)' }}>
      <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-faint)', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center' }}>
        {label}
        {tooltipKey && <InfoTooltip tooltipKey={tooltipKey} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`stat-${label}`} />}
      </div>
      <div className="display mono" style={{ fontSize: 'var(--t-2xl)', fontWeight: 400, color: toneColor, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-dim)', marginTop: 4 }}>{sub}</div>
    </div>
  );
}

function FilterRow({ label, value, onChange, options, optionLabel }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <span style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600 }}>{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '8px 10px', background: '#0a0a0b', border: '1px solid #2a2a30', borderRadius: 6, color: '#f5f1e8', fontSize: 13 }}>
        <option value="all">All</option>
        {options.map((o) => <option key={o} value={o}>{optionLabel ? optionLabel(o) : o}</option>)}
      </select>
    </div>
  );
}

// Scrolls 4 mini-stats horizontally on mobile (2 visible, swipe for 2 more).
// On desktop the CSS class renders them as a normal 4-col grid.
function SwipeableStats({ children }) {
  const scrollRef = useRef(null);
  const [activeDot, setActiveDot] = React.useState(0);
  const PAGES = 2; // 4 items shown 2-at-a-time = 2 pages on mobile

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    const dot = maxScroll > 0
      ? Math.min(Math.round((el.scrollLeft / maxScroll) * (PAGES - 1)), PAGES - 1)
      : 0;
    setActiveDot(dot);
  };

  const goTo = (page) => {
    const el = scrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollTo({ left: (page / (PAGES - 1)) * maxScroll, behavior: 'smooth' });
  };

  return (
    <div style={{ marginTop: 10 }}>
      <div ref={scrollRef} className="mini-stats" onScroll={handleScroll}>
        {children}
      </div>
      <div className="swipe-dots" role="tablist" aria-label="Stats pages">
        {Array.from({ length: PAGES }).map((_, i) => (
          <span
            key={i}
            role="tab"
            aria-selected={i === activeDot}
            aria-label={`Page ${i + 1}`}
            onClick={() => goTo(i)}
            className={`swipe-dot${i === activeDot ? ' active' : ''}`}
          />
        ))}
      </div>
    </div>
  );
}

function ItemCard({ item, onOpenModal, activeTooltip, setActiveTooltip }) {
  const tier = RARITY_TIERS[item.rarityTier] || RARITY_TIERS.Unknown;
  const liq = LIQUIDITY_LABELS[item.liquidity] || LIQUIDITY_LABELS.medium;
  const gainTone = item.gainAbs > 0 ? '#5aaf6a' : item.gainAbs < 0 ? '#c07070' : 'var(--c-muted)';
  const savingsTone = item.savingsAbs > 0 ? '#5aaf6a' : 'var(--c-muted)';

  const imgUrl = resolveImg(item);
  const [imgErr, setImgErr] = useState(false);

  // Segmented LE badge data (no [] brackets)
  const leBadge = item.productionRun
    ? (item.editionNumber
        ? `${String(item.editionNumber).padStart(String(item.productionRun).length, '0')}/${item.productionRun.toLocaleString()}`
        : item.productionRun.toLocaleString())
    : null;

  // Bottom strip tint by gain
  const gc = (() => {
    if (item.savingsMethods.includes('gift') || (item.savingsMethods.includes('free-bonus') && item.itemCost === 0))
      return { bg: 'rgba(28,21,8,0.85)', border: '#50401a', text: '#d4a750' };
    if (!item.gainPct || item.totalPaid === 0)
      return { bg: 'rgba(20,20,24,0.85)', border: '#2c2c34', text: 'var(--c-muted)' };
    if (item.gainPct > 30)  return { bg: 'rgba(11,31,16,0.9)',  border: '#1d5225', text: '#5aaf6a' };
    if (item.gainPct > 10)  return { bg: 'rgba(28,21,8,0.85)', border: '#50401a', text: '#c9a55c' };
    if (item.gainPct >= -5) return { bg: 'rgba(20,20,24,0.85)', border: '#2c2c34', text: 'var(--c-muted)' };
    return { bg: 'rgba(31,14,14,0.9)', border: '#5a2020', text: '#c07070' };
  })();

  return (
    <div style={{ background: '#131316', border: '1px solid #252530', borderRadius: 'var(--r-card)', overflow: 'hidden', transition: 'border-color 0.2s', display: 'flex', flexDirection: 'column' }}>

      {/* ── CLICKABLE BODY ── */}
      <div onClick={onOpenModal} style={{ display: 'flex', cursor: 'pointer', flex: 1, minHeight: 0 }}>

        {/* LEFT: Thumbnail with overlaid badges */}
        <div style={{ position: 'relative', flexShrink: 0, width: 'clamp(140px, 28vw, 240px)', aspectRatio: '1 / 1', background: '#1a1a22', overflow: 'hidden' }}>
          {imgUrl && !imgErr
            ? <img
                src={imgUrl}
                alt={item.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: IMG_POSITION[item.id] || IMG_POSITION_DEFAULT, display: 'block' }}
                loading="lazy"
                onError={() => setImgErr(true)}
              />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, ${tier.color}18 0%, transparent 70%)` }}>
                <span className="display" style={{ fontSize: 'clamp(40px, 7vw, 70px)', color: tier.color, opacity: 0.3, userSelect: 'none' }}>{item.franchise.charAt(0)}</span>
              </div>
          }

          {/* TOP-LEFT: Tier badge (T1, T2 etc.) */}
          <div style={{ position: 'absolute', top: 8, left: 8, padding: '4px 10px', background: 'rgba(8,8,10,0.82)', backdropFilter: 'blur(6px)', borderRadius: 6, border: `1px solid ${tier.color}55`, fontSize: 'var(--t-xs)', fontWeight: 800, color: tier.color, letterSpacing: '0.06em', lineHeight: 1 }}>
            {item.rarityTier}
          </div>

          {/* BOTTOM-LEFT: Icon badges for status / flags */}
          {(() => {
            const badges = [];
            const iconStyle = { display: 'flex', alignItems: 'center', justifyContent: 'center', width: 26, height: 26, background: 'rgba(8,8,10,0.82)', backdropFilter: 'blur(6px)', borderRadius: 6 };
            if (item.status === 'pre-order')    badges.push({ icon: <CalendarClock size={13} />, color: '#7ab0c8', border: '#2a4060', title: 'Pre-Order' });
            if (item.status === 'payment-plan') badges.push({ icon: <Wallet size={13} />,       color: '#8a9acd', border: '#3a3a60', title: 'Payment Plan' });
            if (item.savingsMethods.includes('gift'))        badges.push({ icon: <Gift size={13} />,    color: '#d4a750', border: '#50401a', title: 'Gift' });
            if (item.savingsMethods.includes('free-bonus') && item.itemCost === 0)
              badges.push({ icon: <Percent size={13} />, color: '#d4a750', border: '#50401a', title: 'Free Bonus' });
            if (badges.length === 0) return null;
            return (
              <div style={{ position: 'absolute', bottom: 8, left: 8, display: 'flex', gap: 4 }}>
                {badges.map((b, i) => (
                  <div key={i} title={b.title} style={{ ...iconStyle, color: b.color, border: `1px solid ${b.border}` }}>{b.icon}</div>
                ))}
              </div>
            );
          })()}
        </div>

        {/* RIGHT: Content */}
        <div style={{ flex: 1, minWidth: 0, padding: 'clamp(12px, 2vw, 18px)', display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* Top row: LE pill + market value */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
            {/* Segmented LE pill — verified ✓ lives after the number */}
            <div style={{ display: 'inline-flex', alignItems: 'stretch', flexShrink: 0 }}>
              {leBadge ? (
                <>
                  <span style={{ padding: '4px 9px', background: tier.color + '22', border: `1px solid ${tier.color}70`, borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 'var(--t-xs)', fontWeight: 800, color: tier.color, letterSpacing: '0.1em', lineHeight: 1.4 }}>LE</span>
                  <span className="mono" style={{ padding: '4px 9px', background: tier.color + '10', border: `1px solid ${tier.color}50`, borderLeft: `1px solid ${tier.color}30`, borderRadius: '0 6px 6px 0', fontSize: 'var(--t-xs)', fontWeight: 600, color: tier.color, letterSpacing: '0.04em', lineHeight: 1.4, whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {leBadge}
                    {item.marketSource === 'verified' && <CheckCircle2 size={10} style={{ opacity: 0.75, flexShrink: 0 }} title="Market value verified" />}
                  </span>
                </>
              ) : (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 9px', background: tier.color + '18', border: `1px solid ${tier.color}45`, borderRadius: 6, fontSize: 'var(--t-xs)', fontWeight: 700, color: tier.color + 'cc', letterSpacing: '0.05em' }}>
                  {tier.short}
                  {item.marketSource === 'verified' && <CheckCircle2 size={10} style={{ opacity: 0.75 }} />}
                </span>
              )}
            </div>
            {/* Market value */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="display" style={{ fontSize: 'var(--t-2xl)', color: 'var(--c-primary)', lineHeight: 1, fontWeight: 400 }}>{fmt$(item.marketMid)}</div>
              <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-faint)', marginTop: 1, letterSpacing: '0.03em' }}>market mid</div>
            </div>
          </div>

          {/* Name + studio + category */}
          <div style={{ flex: 1 }}>
            <h3 className="display" style={{ fontSize: 'var(--t-lg)', fontWeight: 500, margin: '0 0 4px', lineHeight: 1.25, color: 'var(--c-primary)' }}>{item.name}</h3>
            <div style={{ fontSize: 'var(--t-sm)', lineHeight: 1.4, marginBottom: 2 }}>
              <span style={{ color: 'var(--c-gold)' }}>{item.studio}</span>
              <span style={{ margin: '0 5px', color: 'var(--c-faint)', opacity: 0.6 }}>·</span>
              <span style={{ color: 'var(--c-secondary)' }}>{item.franchise}</span>
            </div>
            <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-dim)' }}>{item.category}</div>
          </div>

          {/* 4-col mini stats */}
          <SwipeableStats>
            <MiniStat label="MSRP"     value={fmt$(item.msrp)}          tooltipKey="msrp"        activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-msrp`} />
            <MiniStat label="Paid"     value={fmt$(item.itemCost)}       tooltipKey="itemCost"    activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-paid`} />
            <MiniStat label="Saved"    value={fmtPct(item.savingsPct)}   tone={savingsTone}       tooltipKey="savingsPct"  activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-saved`} />
            <MiniStat label="Liquidity" value={liq.label}                tone={liq.color}         tooltipKey="liquidity"   activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-liq`} />
          </SwipeableStats>
        </div>
      </div>

      {/* ── BOTTOM PERFORMANCE STRIP ── */}
      <div style={{ borderTop: `1px solid ${gc.border}`, background: gc.bg, padding: `8px clamp(12px, 2vw, 18px)`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="mono" style={{ fontSize: 'var(--t-xs)', color: 'var(--c-secondary)' }}>
          <span style={{ color: 'var(--c-faint)', marginRight: 4 }}>RS:</span>
          {fmt$(item.marketLow)} – {fmt$(item.marketHigh)}
        </span>
        <span style={{ fontSize: 'var(--t-xs)', padding: '2px 7px', border: `1px solid ${RISK_COLORS[item.riskClass]}55`, borderRadius: 4, color: RISK_COLORS[item.riskClass], opacity: 0.85, flexShrink: 0 }}>{item.riskClass}</span>
        <span style={{ fontSize: 'var(--t-sm)', color: gc.text, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
          {item.gainAbs !== null && item.gainAbs > 0 && <TrendingUp size={12} />}
          {item.gainAbs !== null && item.gainAbs < 0 && <TrendingDown size={12} />}
          <span className="mono">
            {item.itemCost === 0 && item.totalPaid === 0 ? 'Gift / Free Bonus'
              : item.gainAbs !== null ? `${fmtPct(item.gainPct)} vs paid`
              : 'Market est.'}
          </span>
        </span>
      </div>
    </div>
  );
}


// =============================================================================
// DETAIL MODAL — full-screen overlay with all item details + edit form
// =============================================================================

function DetailModal({ item, editing, onEdit, onCloseEdit, onUpdate, onReset, hasOverride, onClose, activeTooltip, setActiveTooltip }) {
  const tier = RARITY_TIERS[item.rarityTier] || RARITY_TIERS.Unknown;
  const liq = LIQUIDITY_LABELS[item.liquidity] || LIQUIDITY_LABELS.medium;
  const gainTone = item.gainAbs > 0 ? '#5aaf6a' : item.gainAbs < 0 ? '#c07070' : 'var(--c-muted)';
  const savingsTone = item.savingsAbs > 0 ? '#5aaf6a' : 'var(--c-muted)';
  const imgUrl = resolveImg(item);
  const [imgErr, setImgErr] = useState(false);

  const leBadge = item.productionRun
    ? (item.editionNumber
        ? `${String(item.editionNumber).padStart(String(item.productionRun).length, '0')}/${item.productionRun.toLocaleString()}`
        : item.productionRun.toLocaleString())
    : null;

  // Close on backdrop click or Escape key
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0',
      }}
    >
      {/* Sheet — slides up from bottom on mobile, centered on desktop */}
      <div
        style={{
          position: 'relative',
          width: '100%', maxWidth: 680,
          maxHeight: '92dvh',
          background: '#0e0e12',
          border: `1px solid ${tier.color}30`,
          borderRadius: '20px 20px 0 0',
          display: 'flex', flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── HERO HEADER ── */}
        <div style={{ position: 'relative', flexShrink: 0, height: 200, background: '#1a1a22', overflow: 'hidden' }}>
          {imgUrl && !imgErr
            ? <img src={imgUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: IMG_POSITION[item.id] || IMG_POSITION_DEFAULT, display: 'block' }} onError={() => setImgErr(true)} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: `radial-gradient(ellipse at center, ${tier.color}18 0%, transparent 70%)` }}>
                <span className="display" style={{ fontSize: 80, color: tier.color, opacity: 0.2, userSelect: 'none' }}>{item.franchise.charAt(0)}</span>
              </div>
          }
          {/* Gradient scrim at bottom of hero */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 80, background: 'linear-gradient(transparent, #0e0e12)' }} />

          {/* Close button */}
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 12, right: 12, width: 34, height: 34, background: 'rgba(8,8,10,0.75)', backdropFilter: 'blur(8px)', border: `1px solid #3a3a40`, borderRadius: '50%', color: 'var(--c-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Close"
          ><X size={16} /></button>

          {/* Rarity badge */}
          <div style={{ position: 'absolute', top: 12, left: 12, padding: '4px 10px', background: 'rgba(8,8,10,0.82)', backdropFilter: 'blur(6px)', borderRadius: 6, border: `1px solid ${tier.color}55`, fontSize: 11, fontWeight: 800, color: tier.color, letterSpacing: '0.06em' }}>
            {item.rarityTier}
          </div>

          {/* LE badge + market value pinned to bottom-left of hero */}
          <div style={{ position: 'absolute', bottom: 12, left: 16, right: 60, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <div className="display" style={{ fontSize: 'clamp(18px,4vw,24px)', fontWeight: 400, color: 'var(--c-primary)', lineHeight: 1.15, textShadow: '0 1px 8px #000' }}>{item.name}</div>
              <div style={{ fontSize: 12, color: 'var(--c-gold)', marginTop: 2 }}>{item.studio}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 12 }}>
              <div className="display" style={{ fontSize: 'clamp(20px,4vw,26px)', color: 'var(--c-primary)', fontWeight: 400, lineHeight: 1 }}>{fmt$(item.marketMid)}</div>
              <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.05em' }}>market mid</div>
            </div>
          </div>
        </div>

        {/* ── SCROLLABLE CONTENT ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 32px' }}>

          {/* LE / rarity pill row */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {leBadge && (
              <div style={{ display: 'inline-flex', alignItems: 'stretch' }}>
                <span style={{ padding: '4px 9px', background: tier.color + '22', border: `1px solid ${tier.color}70`, borderRight: 'none', borderRadius: '6px 0 0 6px', fontSize: 11, fontWeight: 800, color: tier.color, letterSpacing: '0.1em' }}>LE</span>
                <span className="mono" style={{ padding: '4px 9px', background: tier.color + '10', border: `1px solid ${tier.color}50`, borderLeft: `1px solid ${tier.color}30`, borderRadius: '0 6px 6px 0', fontSize: 11, fontWeight: 600, color: tier.color, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  {leBadge}{item.marketSource === 'verified' && <CheckCircle2 size={10} style={{ opacity: 0.75 }} />}
                </span>
              </div>
            )}
            <span style={{ padding: '4px 10px', background: '#1a1a22', border: '1px solid #2a2a30', borderRadius: 6, fontSize: 11, color: 'var(--c-muted)' }}>{item.category}</span>
            <span style={{ padding: '4px 10px', background: '#1a1a22', border: '1px solid #2a2a30', borderRadius: 6, fontSize: 11, color: 'var(--c-muted)' }}>{item.franchise}</span>
            {item.status !== 'owned' && (
              <span style={{ padding: '4px 10px', background: '#1a1a2e', border: '1px solid #3a3a60', borderRadius: 6, fontSize: 11, color: '#8a9acd' }}>{STATUS_LABELS[item.status]}</span>
            )}
          </div>

          {!editing ? (
            <>
              {/* Financial grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <DetailRow label="MSRP" value={fmt$(item.msrp)} mono sub="creator retail" tooltipKey="msrp" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-msrp-m`} />
                <DetailRow label="Item Paid" value={fmt$(item.itemCost)} mono sub="post-discount" tooltipKey="itemCost" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-ic-m`} />
                <DetailRow label="Savings vs MSRP" value={`${fmt$(item.savingsAbs)} (${fmtPct(item.savingsPct)})`} mono tone={savingsTone} sub="deal quality" tooltipKey="savingsAbs" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-sav-m`} />
                <DetailRow label="Overhead" value={fmt$(item.overhead)} mono sub="ship · tax · tariff" tone="#9c8870" tooltipKey="overhead" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-oh-m`} />
                <DetailRow label="Total Paid" value={fmt$(item.totalPaid)} mono sub="all-in out of pocket" tooltipKey="totalPaid" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-tp-m`} />
                <DetailRow label="Market Mid" value={fmt$(item.marketMid)} mono sub={item.marketSource === 'verified' ? '✓ verified' : 'estimated'} tooltipKey="marketValue" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-mv-m`} />
                <DetailRow label="Resell Range" value={`${fmt$(item.marketLow)} – ${fmt$(item.marketHigh)}`} mono sub={`spread ${item.spreadPct.toFixed(0)}%`} tooltipKey="marketRange" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-mr-m`} />
                <DetailRow label="Gain vs Paid" value={item.gainAbs !== null ? `${fmt$(item.gainAbs)} (${fmtPct(item.gainPct)})` : '—'} mono tone={gainTone} tooltipKey="gainAbs" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-g-m`} />
              </div>

              {/* Collector details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <DetailRow label="Edition" value={item.edition} />
                <DetailRow label="Rarity" value={`${item.rarityTier} · ${tier.rpg}`} sub={tier.label} tone={tier.color} tooltipKey="rarity" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-rar-m`} />
                {item.productionRun && <DetailRow label="Production Run" value={`${item.productionRun.toLocaleString()} pieces`} tooltipKey="productionRun" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-prod-m`} />}
                <DetailRow label="Liquidity" value={liq.label} sub={liq.desc} tone={liq.color} tooltipKey="liquidity" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-liq-m`} />
                <DetailRow label="Risk Profile" value={item.riskClass} tone={RISK_COLORS[item.riskClass]} sub={item.riskClass === 'Conservative' ? 'High liquidity, broad edition' : item.riskClass === 'Speculative' ? 'Illiquid or very scarce — patient hold required' : 'Balanced liquidity and rarity'} />
                <DetailRow label="Edition №" value={item.editionNumber ? `#${item.editionNumber} / ${item.productionRun ? item.productionRun.toLocaleString() : '?'}` : '— pending'} sub={item.editionNumber ? 'your specific piece' : 'add when you have the box'} tone={item.editionNumber ? 'var(--c-gold)' : 'var(--c-dim)'} tooltipKey="editionNumber" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-en-m`} />
                {item.cagrPct !== null && <DetailRow label="CAGR (est.)" value={fmtPct(item.cagrPct)} mono tone={item.cagrPct > 0 ? '#5aaf6a' : '#c07070'} sub="annualized return" />}
                {item.purchaseDate && <DetailRow label="Purchase Date" value={new Date(item.purchaseDate).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})} sub={item.holdingDays ? `${item.holdingDays} days held` : null} />}
                {item.releaseDate
                  ? <DetailRow label="Release Date" value={new Date(item.releaseDate).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})} tooltipKey="releaseDate" activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={`${item.id}-rd-m`} />
                  : <DetailRow label="Release Date" value="—" sub="add when known" tone="var(--c-dim)" />
                }
                {item.acquisitionDate && <DetailRow label="Acquired" value={new Date(item.acquisitionDate).toLocaleDateString('en-US', {year:'numeric', month:'short', day:'numeric'})} />}
              </div>

              {/* Dimensions */}
              {item.dimensions && (item.dimensions.heightIn || item.dimensions.widthIn || item.dimensions.depthIn || item.dimensions.weightLbs) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Dimensions</div>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    {item.dimensions.heightIn  != null && <div><div style={{ fontSize: 9, color: 'var(--c-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>Height</div><div className="mono" style={{ fontSize: 15, color: 'var(--c-primary)' }}>{item.dimensions.heightIn}"</div></div>}
                    {item.dimensions.widthIn   != null && <div><div style={{ fontSize: 9, color: 'var(--c-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>Width</div><div className="mono" style={{ fontSize: 15, color: 'var(--c-primary)' }}>{item.dimensions.widthIn}"</div></div>}
                    {item.dimensions.depthIn   != null && <div><div style={{ fontSize: 9, color: 'var(--c-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>Depth</div><div className="mono" style={{ fontSize: 15, color: 'var(--c-primary)' }}>{item.dimensions.depthIn}"</div></div>}
                    {item.dimensions.weightLbs != null && <div><div style={{ fontSize: 9, color: 'var(--c-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3 }}>Weight</div><div className="mono" style={{ fontSize: 15, color: 'var(--c-primary)' }}>{item.dimensions.weightLbs} lbs</div></div>}
                  </div>
                </div>
              )}

              {/* Savings methods */}
              {item.savingsMethods.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Savings methods</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.savingsMethods.map((m) => <span key={m} style={{ fontSize: 'var(--t-sm)', padding: '4px 10px', background: 'rgba(58,47,28,0.6)', color: 'var(--c-gold)', borderRadius: 5, border: '1px solid #5a4a2a' }}>{SAVINGS_LABELS[m] || m}</span>)}
                  </div>
                </div>
              )}

              {/* Notes */}
              {item.notes && (
                <div style={{ marginBottom: 16, padding: 12, background: '#131316', borderRadius: 8, border: '1px solid #252530' }}>
                  <div style={{ fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Notes</div>
                  <div style={{ fontSize: 'var(--t-sm)', color: 'var(--c-secondary)', lineHeight: 1.65 }}>{item.notes}</div>
                </div>
              )}

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(58,47,28,0.5)', border: '1px solid #5a4a2a', borderRadius: 8, color: 'var(--c-gold)', fontSize: 'var(--t-sm)', fontWeight: 500 }}><Edit3 size={13} /> Edit values</button>
                {hasOverride && <button onClick={onReset} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #2a2a30', borderRadius: 8, color: 'var(--c-muted)', fontSize: 'var(--t-sm)' }}>Reset to original</button>}
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'transparent', border: '1px solid #2a2a30', borderRadius: 8, color: 'var(--c-muted)', fontSize: 'var(--t-sm)', textDecoration: 'none' }}><ExternalLink size={13} /> View listing</a>}
              </div>
            </>
          ) : (
            <>
              <div style={{ marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--c-gold)', fontWeight: 600 }}>Edit values</span>
                <button onClick={onCloseEdit} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid #2a2a30', borderRadius: 6, color: 'var(--c-muted)', fontSize: 12 }}>← Back</button>
              </div>
              <EditForm item={item} onUpdate={onUpdate} onClose={onCloseEdit} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}


function MiniStat({ label, value, tone = 'var(--c-primary)', tooltipKey, activeTooltip, setActiveTooltip, anchorId }) {
  return (
    <div style={{ background: '#1a1a22', border: '1px solid #28283200', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 'var(--t-xs)', color: 'var(--c-faint)', letterSpacing: '0.07em', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4, whiteSpace: 'nowrap' }}>
        {label}
        {tooltipKey && <InfoTooltip tooltipKey={tooltipKey} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={anchorId} />}
      </div>
      <div className="mono display" style={{ fontSize: 'var(--t-md)', color: tone, fontWeight: 500, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

function DetailRow({ label, value, sub, mono = false, tone = '#f5f1e8', tooltipKey, activeTooltip, setActiveTooltip, anchorId }) {
  return (
    <div>
      <div style={{ fontSize: 9, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 3, display: 'flex', alignItems: 'center' }}>
        {label}
        {tooltipKey && <InfoTooltip tooltipKey={tooltipKey} activeTooltip={activeTooltip} setActiveTooltip={setActiveTooltip} anchorId={anchorId} />}
      </div>
      <div className={mono ? 'mono' : ''} style={{ fontSize: 13, color: tone, fontWeight: mono ? 500 : 400 }}>{value}</div>
      {sub && <div style={{ fontSize: 10, color: 'var(--c-dim)', marginTop: 1 }}>{sub}</div>}
    </div>
  );
}

function EditForm({ item, onUpdate, onClose }) {
  const [marketLow, setMarketLow] = useState(item.marketLow?.toString() || '');
  const [marketMid, setMarketMid] = useState(item.marketMid?.toString() || '');
  const [marketHigh, setMarketHigh] = useState(item.marketHigh?.toString() || '');
  const [msrp, setMsrp] = useState(item.msrp?.toString() || '');
  const [itemCost, setItemCost] = useState(item.itemCost?.toString() || '');
  const [totalPaid, setTotalPaid] = useState(item.totalPaid?.toString() || '');
  const [rarityTier, setRarityTier] = useState(item.rarityTier);
  const [liquidity, setLiquidity] = useState(item.liquidity);
  const [marketSource, setMarketSource] = useState(item.marketSource);
  const [editionNumber, setEditionNumber] = useState(item.editionNumber?.toString() || '');
  const [imageUrl, setImageUrl] = useState(item.imageUrl || '');
  const [releaseDate, setReleaseDate] = useState(item.releaseDate || '');
  const [acquisitionDate, setAcquisitionDate] = useState(item.acquisitionDate || '');
  const [notes, setNotes] = useState(item.notes || '');
  const [dimH, setDimH] = useState(item.dimensions?.heightIn?.toString() || '');
  const [dimW, setDimW] = useState(item.dimensions?.widthIn?.toString() || '');
  const [dimD, setDimD] = useState(item.dimensions?.depthIn?.toString() || '');
  const [dimWt, setDimWt] = useState(item.dimensions?.weightLbs?.toString() || '');

  const save = () => {
    onUpdate({
      marketLow: marketLow === '' ? null : parseFloat(marketLow),
      marketMid: marketMid === '' ? null : parseFloat(marketMid),
      marketHigh: marketHigh === '' ? null : parseFloat(marketHigh),
      msrp: msrp === '' ? null : parseFloat(msrp),
      itemCost: itemCost === '' ? null : parseFloat(itemCost),
      totalPaid: totalPaid === '' ? null : parseFloat(totalPaid),
      rarityTier, liquidity, marketSource, notes,
      editionNumber: editionNumber === '' ? null : editionNumber,
      releaseDate: releaseDate === '' ? null : releaseDate,
      acquisitionDate: acquisitionDate === '' ? null : acquisitionDate,
      imageUrl: imageUrl === '' ? null : imageUrl,
      dimensions: {
        heightIn:  dimH  === '' ? null : parseFloat(dimH),
        widthIn:   dimW  === '' ? null : parseFloat(dimW),
        depthIn:   dimD  === '' ? null : parseFloat(dimD),
        weightLbs: dimWt === '' ? null : parseFloat(dimWt),
      },
    });
    onClose();
  };

  const inputStyle = { width: '100%', padding: '8px 10px', background: '#0a0a0b', border: '1px solid #2a2a30', borderRadius: 6, color: '#f5f1e8', fontSize: 13, fontFamily: 'inherit' };
  const labelStyle = { fontSize: 10, color: 'var(--c-faint)', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 4, display: 'block' };

  return (
    <div>
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 10, color: '#c9a55c', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8 }}>Resell Range</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
          <EditField label="Low" value={marketLow} onChange={setMarketLow} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
          <EditField label="Mid" value={marketMid} onChange={setMarketMid} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
          <EditField label="High" value={marketHigh} onChange={setMarketHigh} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <EditField label="MSRP (Creator)" value={msrp} onChange={setMsrp} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
        <EditField label="Item Paid" value={itemCost} onChange={setItemCost} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
        <EditField label="Total Paid" value={totalPaid} onChange={setTotalPaid} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
        <div>
          <label style={labelStyle}>Market Source</label>
          <select value={marketSource} onChange={(e) => setMarketSource(e.target.value)} style={inputStyle}>
            <option value="verified">Verified</option>
            <option value="estimated">Estimated</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Rarity Tier</label>
          <select value={rarityTier} onChange={(e) => setRarityTier(e.target.value)} style={inputStyle}>
            {Object.entries(RARITY_TIERS).map(([k, v]) => <option key={k} value={k}>{k} — {v.label}</option>)}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Liquidity</label>
          <select value={liquidity} onChange={(e) => setLiquidity(e.target.value)} style={inputStyle}>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 10, color: '#c9a55c', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, marginTop: 4 }}>Timeline & Edition</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <EditField label="Edition № (e.g. 068)" value={editionNumber} onChange={setEditionNumber} type="text" inputStyle={inputStyle} labelStyle={labelStyle} />
            <EditField label="Release Date (YYYY-MM-DD)" value={releaseDate} onChange={setReleaseDate} type="text" inputStyle={inputStyle} labelStyle={labelStyle} />
            <EditField label="Acquisition Date (YYYY-MM-DD)" value={acquisitionDate} onChange={setAcquisitionDate} type="text" inputStyle={inputStyle} labelStyle={labelStyle} />
            <EditField label="Image URL (1:1 thumbnail)" value={imageUrl} onChange={setImageUrl} type="text" inputStyle={inputStyle} labelStyle={labelStyle} />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <div style={{ fontSize: 10, color: '#c9a55c', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, marginBottom: 8, marginTop: 4 }}>Dimensions (inches / lbs)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8 }}>
            <EditField label='Height (in)' value={dimH} onChange={setDimH} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
            <EditField label='Width (in)'  value={dimW} onChange={setDimW} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
            <EditField label='Depth (in)'  value={dimD} onChange={setDimD} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
            <EditField label='Weight (lbs)' value={dimWt} onChange={setDimWt} type="number" inputStyle={inputStyle} labelStyle={labelStyle} />
          </div>
        </div>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button onClick={save} style={{ flex: 1, padding: '10px 16px', background: '#c9a55c', border: 'none', borderRadius: 6, color: '#0a0a0b', fontSize: 13, fontWeight: 600 }}>Save</button>
        <button onClick={onClose} style={{ padding: '10px 16px', background: 'transparent', border: '1px solid #2a2a30', borderRadius: 6, color: 'var(--c-muted)', fontSize: 13 }}>Cancel</button>
      </div>
    </div>
  );
}

function EditField({ label, value, onChange, type = 'text', inputStyle, labelStyle }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} style={inputStyle} />
    </div>
  );
}

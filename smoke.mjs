#!/usr/bin/env node
/**
 * smoke.mjs — post-build sanity checks
 *
 * Verifies that build.mjs produced a valid index.html and that
 * collection.jsx has no known structural problems.
 *
 * Exits 0 if all checks pass, 1 if any fail.
 * Usage: node smoke.mjs
 */

import { readFileSync, statSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = __dirname;

let passed = 0;
let failed = 0;

function check(label, fn) {
  try {
    const result = fn();
    if (result === false) throw new Error('assertion returned false');
    console.log(`  ✓ ${label}`);
    passed++;
  } catch (e) {
    console.error(`  ✗ ${label}${e.message ? ` — ${e.message}` : ''}`);
    failed++;
  }
}

// ---------------------------------------------------------------------------
// 1. Build succeeds
// ---------------------------------------------------------------------------
console.log('\nBuild check');
check('build.mjs exits 0', () => {
  execSync('node build.mjs', { cwd: ROOT, stdio: 'pipe' });
});

// ---------------------------------------------------------------------------
// 2. index.html integrity
// ---------------------------------------------------------------------------
console.log('\nindex.html');
const htmlPath = join(ROOT, 'index.html');
let html = '';
check('file exists', () => { statSync(htmlPath); });
check('file size ≥ 80 KB', () => {
  const { size } = statSync(htmlPath);
  if (size < 80_000) throw new Error(`only ${size} bytes`);
});
html = readFileSync(htmlPath, 'utf8');
check('contains <div id="root">', () => html.includes('<div id="root">'));
check('contains CollectionApp', () => html.includes('CollectionApp'));
check('contains SEED_ITEMS', () => html.includes('SEED_ITEMS'));
check('contains _li shim', () => html.includes('_li(lucide.'));
check('React pinned to 18.3.1', () => html.includes('react@18.3.1'));
check('ReactDOM pinned to 18.3.1', () => html.includes('react-dom@18.3.1'));
check('React loaded with defer', () => html.includes('defer src="https://unpkg.com/react@18.3.1'));
check('no Babel script', () => !html.includes('babel'));
check('no type="text/babel"', () => !html.includes('type="text/babel"'));
check('no lucide UMD CDN', () => !html.includes('unpkg.com/lucide'));
check('has error overlay', () => html.includes('window.onerror'));
check('has DOMContentLoaded mount', () => html.includes('DOMContentLoaded'));

const ICONS = [
  'Search','Filter','ArrowUp','ArrowDown','X','Edit3','ExternalLink',
  'TrendingUp','TrendingDown','Minus','Gift','Info','BarChart3',
  'ChevronDown','ChevronUp','Award','Zap','CheckCircle2','Wallet',
  'CalendarClock','Percent',
];
for (const icon of ICONS) {
  check(`icon shim: ${icon}`, () => html.includes(`_li(lucide.${icon})`));
}

// ---------------------------------------------------------------------------
// 3. collection.jsx integrity
// ---------------------------------------------------------------------------
console.log('\ncollection.jsx');
const jsxPath = join(ROOT, 'collection.jsx');
const jsx = readFileSync(jsxPath, 'utf8');
check('imports React', () => jsx.startsWith('import React'));
check('imports lucide-react', () => jsx.includes("from 'lucide-react'"));
check('exports CollectionApp', () => jsx.includes('export default function CollectionApp'));
check('no double-close ]\\n\\n]; bug', () => !jsx.includes('];\n\n];'));

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const total = passed + failed;
console.log(`\n${passed}/${total} checks passed${failed > 0 ? ` — ${failed} FAILED` : ' — all good'}\n`);
process.exit(failed > 0 ? 1 : 0);

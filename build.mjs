#!/usr/bin/env node
/**
 * build.mjs — regenerate index.html from collection.jsx
 *
 * This is a zero-dependency build step. It reads collection.jsx (the source of
 * truth), strips its import lines, and inlines the rest into a self-contained
 * index.html that runs via in-browser Babel. GitHub Pages serves index.html.
 *
 * Run after every edit to collection.jsx:
 *     node build.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'collection.jsx');
const OUT = join(__dirname, 'index.html');

const jsx = readFileSync(SRC, 'utf8');

// Strip top-level import lines — the browser shim provides React + lucide globals.
const body = jsx
  .split('\n')
  .filter((line) => !line.startsWith('import '))
  .join('\n');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>The Collector's Compendium</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  <script src="https://unpkg.com/lucide@0.383.0/dist/umd/lucide.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #root { height: 100%; }
    body { background: #08080a; color: #e8e4dc; font-family: 'Manrope', sans-serif; -webkit-font-smoothing: antialiased; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: #0e0e12; }
    ::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 3px; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script type="text/babel">
    // Shim React globals (Babel standalone needs these in scope)
    const { useState, useEffect, useMemo, useRef, useCallback } = React;

    // Shim lucide-react named exports
    const { Search, Filter, ArrowUp, ArrowDown, X, Edit3, ExternalLink,
            TrendingUp, TrendingDown, Minus, Gift, Info, BarChart3,
            ChevronDown, ChevronUp, Award, Zap, CheckCircle2, Wallet,
            CalendarClock, Percent } = lucide;

${body}

    // Mount
    const container = document.getElementById('root');
    const root = ReactDOM.createRoot(container);
    root.render(<CollectionApp />);
  </script>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf8');
console.log(`✓ index.html regenerated from collection.jsx (${Buffer.byteLength(html)} bytes)`);

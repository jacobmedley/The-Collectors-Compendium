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
// Also strip `export default ` / `export ` keywords: in a plain <script> there is
// no module system, so Babel would compile `export` into `exports.default = ...`
// and throw "exports is not defined". We want the bare declarations in scope.
const body = jsx
  .split('\n')
  .filter((line) => !line.startsWith('import '))
  .join('\n')
  .replace(/^export\s+default\s+/m, '')
  .replace(/^export\s+/gm, '');

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>The Collector's Compendium</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230e0e12'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='20' fill='%23c9a55c' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E" />
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

    // Shim lucide-react named exports — wraps vanilla lucide UMD icon data into React components.
    // Lucide UMD icon format: ["svg", defaultAttributes, [[tag, attrs], ...]]
    // Children are at index 2; we ignore index 0 (tag "svg") and index 1 (default attrs) since
    // we supply our own SVG wrapper props from the component's own size/color/strokeWidth.
    const _li = (icon) => !Array.isArray(icon) ? () => null :
      ({ size = 24, color = 'currentColor', strokeWidth = 2, style, ...r }) =>
        React.createElement('svg', {
          xmlns: 'http://www.w3.org/2000/svg', width: size, height: size,
          viewBox: '0 0 24 24', fill: 'none', stroke: color,
          strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', style, ...r,
        }, icon[2].map(([tag, a], i) => React.createElement(tag, { key: i, ...a })));
    const Search = _li(lucide.Search); const Filter = _li(lucide.Filter);
    const ArrowUp = _li(lucide.ArrowUp); const ArrowDown = _li(lucide.ArrowDown);
    const X = _li(lucide.X); const Edit3 = _li(lucide.Edit3);
    const ExternalLink = _li(lucide.ExternalLink);
    const TrendingUp = _li(lucide.TrendingUp); const TrendingDown = _li(lucide.TrendingDown);
    const Minus = _li(lucide.Minus); const Gift = _li(lucide.Gift);
    const Info = _li(lucide.Info); const BarChart3 = _li(lucide.BarChart3);
    const ChevronDown = _li(lucide.ChevronDown); const ChevronUp = _li(lucide.ChevronUp);
    const Award = _li(lucide.Award); const Zap = _li(lucide.Zap);
    const CheckCircle2 = _li(lucide.CheckCircle2); const Wallet = _li(lucide.Wallet);
    const CalendarClock = _li(lucide.CalendarClock); const Percent = _li(lucide.Percent);

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

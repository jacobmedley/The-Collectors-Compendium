#!/usr/bin/env node
/**
 * build.mjs — regenerate index.html from collection.jsx
 *
 * Requires: esbuild (devDependency), icons.json in repo root.
 * To regenerate icons.json: node generate-icons.mjs
 *
 * Run after every edit to collection.jsx:
 *     node build.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { transformSync } from 'esbuild';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = join(__dirname, 'collection.jsx');
const OUT = join(__dirname, 'index.html');
const ICONS_PATH = join(__dirname, 'icons.json');

const jsx = readFileSync(SRC, 'utf8');
const icons = JSON.parse(readFileSync(ICONS_PATH, 'utf8'));

// Strip top-level import lines and export keywords — same logic as before.
// The browser shim provides React + lucide globals; no module system in scope.
const appBody = jsx
  .split('\n')
  .filter((line) => !line.startsWith('import '))
  .join('\n')
  .replace(/^export\s+default\s+/m, '')
  .replace(/^export\s+/gm, '');

// Full source: React globals shim + lucide data shim + app body + mount call.
// Passed to esbuild for JSX transform + minification.
const source = `const { useState, useEffect, useMemo, useRef, useCallback } = React;

const lucide = ${JSON.stringify(icons)};

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

${appBody}

ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(CollectionApp));
`;

// Transpile JSX and minify. Classic runtime: React.createElement (no auto-import).
const { code: minified } = transformSync(source, {
  loader: 'jsx',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  minify: true,
  target: 'es2018',
});

// Guard against accidental </script> in string literals breaking the HTML parser.
const safeMinified = minified.replace(/<\/script>/gi, '<\\/script>');

// Error overlay — runs immediately (before React loads via defer).
// Catches runtime errors during app mount and shows them in #root.
const errorOverlay = `window.onerror=function(msg,src,line,col){var r=document.getElementById('root');if(r){r.style.cssText='display:flex;align-items:center;justify-content:center;height:100vh;padding:2rem;font-family:monospace;background:#0e0e12;color:#ff6b6b;';r.innerHTML='<div style="max-width:600px"><h2 style="margin-bottom:1rem">App failed to load<\\/h2><pre style="white-space:pre-wrap;font-size:.85em;opacity:.8">'+msg+(src?'\\n'+src+':'+line+':'+col:'')+'<\\/pre><\\/div>';}return false;};`;

// App deferred via DOMContentLoaded so it runs after defer'd React/ReactDOM CDN scripts.
const appScript = `${errorOverlay}
document.addEventListener('DOMContentLoaded',function(){
${safeMinified}
});`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
  <title>The Collector's Compendium</title>
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230e0e12'/%3E%3Ctext x='16' y='23' font-family='Georgia,serif' font-size='20' fill='%23c9a55c' text-anchor='middle'%3EC%3C/text%3E%3C/svg%3E" />
  <link rel="preconnect" href="https://unpkg.com" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;1,9..144,300;1,9..144,400&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <script defer src="https://unpkg.com/react@18.3.1/umd/react.production.min.js"></script>
  <script defer src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.production.min.js"></script>
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
  <script>${appScript}</script>
</body>
</html>
`;

writeFileSync(OUT, html, 'utf8');
console.log(`✓ index.html regenerated (${Buffer.byteLength(html)} bytes, esbuild precompiled)`);

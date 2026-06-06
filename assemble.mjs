#!/usr/bin/env node
/**
 * assemble.mjs — one-time setup script
 * Assembles collection.jsx from _col_part1.txt + _col_part2.txt,
 * rebuilds index.html, and cleans up temp files.
 *
 * Run once from the repo root:
 *   node assemble.mjs
 *
 * Then commit everything:
 *   git add -A && git commit -m "Sync: storage fix, dimensions, export fix" && git push
 *
 * After committing you can delete this file.
 */

import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dir = dirname(fileURLToPath(import.meta.url));

const p1 = join(__dir, '_col_part1.txt');
const p2 = join(__dir, '_col_part2.txt');

if (!existsSync(p1)) { console.error('❌  Missing _col_part1.txt'); process.exit(1); }
if (!existsSync(p2)) { console.error('❌  Missing _col_part2.txt'); process.exit(1); }

const part1 = readFileSync(p1, 'utf8');
const part2 = readFileSync(p2, 'utf8');

// Strip the leading comment line from part1 if present
const clean1 = part1.startsWith('////')
  ? part1.slice(part1.indexOf('\n') + 1)
  : part1;

const full = clean1 + part2;
writeFileSync(join(__dir, 'collection.jsx'), full, 'utf8');
console.log(`✓  collection.jsx written  (${(full.length / 1024).toFixed(1)} KB)`);

// Rebuild index.html
execSync('node build.mjs', { cwd: __dir, stdio: 'inherit' });

// Clean up temp parts
unlinkSync(p1);
unlinkSync(p2);
console.log('✓  Temp files cleaned up');
console.log('');
console.log('All done. Ready to commit:');
console.log('  git add -A && git commit -m "Sync: storage fix, dimensions, export fix" && git push');
console.log('');
console.log('(You can delete assemble.mjs after committing.)');

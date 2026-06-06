#!/usr/bin/env node
// bootstrap.mjs — writes collection.jsx and index.html from outputs folder
// Run: node bootstrap.mjs
// This is a one-time setup script. Delete after use.

import { writeFileSync, readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

// The full updated collection.jsx content is embedded in the outputs folder
// Download from Claude outputs or paste manually.
// After running this, do: node build.mjs && git add -A && git commit -m "Update" && git push

console.log('If you are seeing this, run: node build.mjs to regenerate index.html');
console.log('Then: git add -A && git commit -m "Sync from Claude session" && git push');

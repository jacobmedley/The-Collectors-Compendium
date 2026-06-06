#!/bin/bash
# sync.sh — pull latest collection.jsx + index.html from GitHub and rebuild
# Run once from the repo root: bash sync.sh

set -e

REPO="https://raw.githubusercontent.com/jacobmedley/The-Collectors-Compendium/main"

echo "Pulling collection.jsx..."
curl -fsSL "$REPO/collection.jsx" -o collection.jsx

echo "Pulling index.html..."
curl -fsSL "$REPO/index.html" -o index.html

echo "Pulling build.mjs..."
curl -fsSL "$REPO/build.mjs" -o build.mjs

echo "Pulling CLAUDE.md..."
curl -fsSL "$REPO/CLAUDE.md" -o CLAUDE.md

echo ""
echo "Done. Files are now in sync with the live site."
echo "To rebuild index.html from collection.jsx after local edits: node build.mjs"

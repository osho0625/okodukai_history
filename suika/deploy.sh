#!/bin/bash
# Deploy script: copies web/ + assets into docs/ for GitHub Pages

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
DOCS="$SCRIPT_DIR/docs"

# Clean and create docs/
rm -rf "$DOCS"
mkdir -p "$DOCS/engine"
mkdir -p "$DOCS/data"

# Copy web source
cp "$SCRIPT_DIR/web/index.html" "$DOCS/"
cp "$SCRIPT_DIR/web/main.js" "$DOCS/"
cp "$SCRIPT_DIR/web/engine/"*.js "$DOCS/engine/"

# Copy game assets
cp "$SCRIPT_DIR"/image*.gif "$DOCS/" 2>/dev/null || true
cp "$SCRIPT_DIR/data/"* "$DOCS/data/"

# Fix asset path (web version uses '../' to reach parent, docs version is flat)
sed -i "s|AssetLoader('../')|AssetLoader('./')|g" "$DOCS/main.js" 2>/dev/null || \
  sed -i '' "s|AssetLoader('../')|AssetLoader('./')|g" "$DOCS/main.js"

echo "Deploy complete: $DOCS"
echo "Files:"
find "$DOCS" -type f | wc -l

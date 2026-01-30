#!/usr/bin/env bash
# Auto-rebrand: Replace moltbot/clawd with OZOO

set -e

echo "🔍 Searching for moltbot/clawd..."

find . -type f \( \
  -name "*.ts" -o -name "*.js" -o -name "*.swift" -o \
  -name "*.md" -o -name "*.json" -o -name "*.yaml" \
\) \
  -not -path "*/node_modules/*" \
  -not -path "*/apps-backup-*/*" \
  -not -path "*/.git/*" \
  -not -path "*/pnpm-lock.yaml" \
  2>/dev/null | while read -r file; do

  if grep -q "moltbot\|clawd" "$file" 2>/dev/null; then
    echo "  ✏️  $file"
    sed -i '' -e 's/moltbot/OZOO/g' -e 's/Moltbot/OZOO/g' -e 's/MOLTBOT/OZOO/g' -e 's/clawd/OZOO/g' -e 's/Clawd/OZOO/g' -e 's/CLAWD/OZOO/g' "$file"
  fi
done

echo ""
echo "✅ Done!"

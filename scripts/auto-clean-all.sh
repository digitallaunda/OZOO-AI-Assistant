#!/usr/bin/env bash
# Master script: Run all auto-cleanup tasks

set -e

echo "╔═══════════════════════════════════════╗"
echo "║   🚀 AUTO-CLEAN ALL                   ║"
echo "╚═══════════════════════════════════════╝"
echo ""

# 1. Rebrand text content
echo "1️⃣  Running auto-rebrand..."
bash scripts/auto-rebrand.sh
echo ""

# 2. Rename files
echo "2️⃣  Running auto-rename..."
bash scripts/auto-rename.sh
echo ""

# 3. Final verification
echo "3️⃣  Final verification..."
COUNT=$(find . -name "*.ts" -o -name "*.md" | xargs grep -il "moltbot\|clawd" 2>/dev/null | grep -v node_modules | grep -v apps-backup | wc -l | tr -d ' ')

echo ""
echo "╔═══════════════════════════════════════╗"
if [ "$COUNT" -eq 0 ]; then
  echo "║   ✅ 100% CLEAN!                      ║"
else
  echo "║   ⚠️  Found $COUNT issues             ║"
fi
echo "╚═══════════════════════════════════════╝"
echo ""
echo "✅ All auto-cleanup tasks complete!"

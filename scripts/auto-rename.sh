#!/usr/bin/env bash
# Auto-rename: Rename files/folders with old brand names

set -e

echo "🔍 Finding files to rename..."

# Find and rename files
find . -depth \( \
  -name "*moltbot*" -o \
  -name "*Moltbot*" -o \
  -name "*clawd*" -o \
  -name "*Clawd*" \
\) \
  -not -path "*/node_modules/*" \
  -not -path "*/apps-backup-*/*" \
  -not -path "*/.git/*" \
  2>/dev/null | while read -r oldpath; do

  # Get directory and filename
  dir=$(dirname "$oldpath")
  old=$(basename "$oldpath")

  # Replace brand names in filename
  new=$(echo "$old" | sed \
    -e 's/moltbot/ozoo/g' \
    -e 's/Moltbot/Ozoo/g' \
    -e 's/MOLTBOT/OZOO/g' \
    -e 's/clawd/ozoo/g' \
    -e 's/Clawd/Ozoo/g' \
    -e 's/CLAWD/OZOO/g')

  if [ "$old" != "$new" ]; then
    newpath="$dir/$new"
    echo "  📝 Renaming: $oldpath → $newpath"
    mv "$oldpath" "$newpath"
  fi
done

echo ""
echo "✅ Done! All files renamed"

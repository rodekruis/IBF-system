#!/bin/bash

# Script to copy only used SVG icons to the EspoCRM extension
# This optimizes the extension package by including only necessary icons

WORKSPACE_DIR="c:/Users/MaartenvV/OneDrive - Rode Kruis/Documenten/GitHub/IBF-system/interfaces/IBF-dashboard"

# Check if dist/svg exists (after build), otherwise use source svg directory
if [ -d "dist/svg" ]; then
    SVG_SOURCE_DIR="dist/svg"
elif [ -d "$WORKSPACE_DIR/svg" ]; then
    SVG_SOURCE_DIR="$WORKSPACE_DIR/svg"
else
    SVG_SOURCE_DIR="svg"  # fallback
fi

# Use parameter for target directory, or fallback to hardcoded EspoCRM path
if [ -n "$1" ]; then
    ESPOCRM_SVG_DIR="$1"
else
    ESPOCRM_SVG_DIR="c:/Users/MaartenvV/OneDrive - Rode Kruis/Documenten/GitHub/IBF-system/interfaces/espocrm/files/client/custom/modules/ibf-dashboard/svg"
fi

echo "🔍 Analyzing SVG icon usage in IBF Dashboard web component..."
echo "   Source: $SVG_SOURCE_DIR"
echo "   Target: $ESPOCRM_SVG_DIR"

# Ensure target directory exists
mkdir -p "$ESPOCRM_SVG_DIR"

# Create a list of all actually used Ionic icons based on analysis
# Icons found in the codebase from main.ts and component templates
USED_ICONS=(
    "apps"
    "person"
    "eye"
    "eye-off"
    "information-circle-outline"
    "arrow-forward"
    "arrow-back"
    "warning"
    "close-circle"
    "chevron-back-outline"
    "chevron-down-outline"
    "chevron-up-outline"
    "checkbox"
    "square-outline"
    "radio-button-on-outline"
    "radio-button-off-outline"
)

echo "📊 Found ${#USED_ICONS[@]} unique Ionic icons used in the web component:"
printf '%s\n' "${USED_ICONS[@]}" | sort

# Create EspoCRM SVG directory if it doesn't exist
mkdir -p "$ESPOCRM_SVG_DIR"

# Clear existing SVG files in EspoCRM directory
echo "🧹 Clearing existing SVG files from EspoCRM directory..."
rm -f "$ESPOCRM_SVG_DIR"/*.svg

copied_count=0
missing_icons=()

echo "📋 Copying only used SVG icons to EspoCRM extension..."

for icon in "${USED_ICONS[@]}"; do
    # Try different variants (outline, sharp, filled)
    variants=("$icon-outline.svg" "$icon-sharp.svg" "$icon.svg")
    found=false
    
    for variant in "${variants[@]}"; do
        source_file="$SVG_SOURCE_DIR/$variant"
        if [ -f "$source_file" ]; then
            cp "$source_file" "$ESPOCRM_SVG_DIR/"
            echo "✅ Copied: $variant"
            ((copied_count++))
            found=true
            break
        fi
    done
    
    if [ "$found" = false ]; then
        missing_icons+=("$icon")
        echo "❌ Missing: $icon (no variants found)"
    fi
done

echo ""
echo "📈 Optimization Summary:"
echo "  • Total SVG files in source directory: $(ls -1 "$SVG_SOURCE_DIR"/*.svg 2>/dev/null | wc -l)"
echo "  • Icons identified as used in code: ${#USED_ICONS[@]}"
echo "  • SVG files copied to EspoCRM: $copied_count"
echo "  • Missing icon files: ${#missing_icons[@]}"

if [ ${#missing_icons[@]} -gt 0 ]; then
    echo ""
    echo "⚠️  Missing icon files (may need to be obtained separately):"
    printf '%s\n' "${missing_icons[@]}"
fi

# Calculate space savings
source_size=$(du -sh "$SVG_SOURCE_DIR" | cut -f1)
espocrm_size=$(du -sh "$ESPOCRM_SVG_DIR" | cut -f1)

echo ""
echo "💾 Space optimization:"
echo "  • Original SVG directory size: $source_size"
echo "  • Optimized SVG directory size: $espocrm_size"

# Create a manifest file listing the optimized icons
manifest_file="$ESPOCRM_SVG_DIR/icon-manifest.txt"
echo "# IBF Dashboard Optimized SVG Icons" > "$manifest_file"
echo "# Generated on $(date)" >> "$manifest_file"
echo "# Only includes icons actually used by the web component" >> "$manifest_file"
echo "" >> "$manifest_file"
ls -1 "$ESPOCRM_SVG_DIR"/*.svg | xargs -n1 basename >> "$manifest_file"

echo "📄 Created icon manifest: $manifest_file"
echo ""
echo "✨ SVG optimization complete! The EspoCRM extension now includes only the necessary icons."
echo "   This should significantly reduce the extension package size and deployment time."

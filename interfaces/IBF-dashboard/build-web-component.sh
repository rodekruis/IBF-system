#!/bin/bash

# IBF Dashboard Web Component Builder for Unix/Linux/macOS
# This script implements identical functionality to build-web-component.ps1

# Default values
ZIP_MODE=false
SHOW_HELP=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --zip|-z)
            ZIP_MODE=true
            shift
            ;;
        --help|-h)
            SHOW_HELP=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Show help if requested
if [ "$SHOW_HELP" = true ]; then
    echo -e "\e[32mIBF Dashboard Web Component Builder\e[0m"
    echo ""
    echo -e "\e[33mUsage:\e[0m"
    echo "  build-web-component.sh          Build web component (fast, no ZIP)"
    echo "  build-web-component.sh --zip    Build web component with ZIP package"
    echo "  build-web-component.sh --help   Show this help message"
    echo ""
    echo -e "\e[33mOptions:\e[0m"
    echo "  --zip, -z    Create ZIP package (slower, for distribution)"
    echo "  --help, -h   Show this help message"
    echo ""
    exit 0
fi

echo -e "\e[32mBuilding IBF Dashboard Web Component...\e[0m"
if [ "$ZIP_MODE" = true ]; then
    echo -e "\e[36mZIP packaging: ENABLED\e[0m"
else
    echo -e "\e[33mZIP packaging: DISABLED (use --zip flag to enable)\e[0m"
fi

# Function to get version from package.json
get_package_version() {
    if [ -f "package.json" ]; then
        # Try to parse version using various tools
        if command -v jq &> /dev/null; then
            jq -r '.version' package.json 2>/dev/null || echo "0.0.0"
        elif command -v node &> /dev/null; then
            node -pe "JSON.parse(require('fs').readFileSync('package.json', 'utf8')).version" 2>/dev/null || echo "0.0.0"
        elif command -v python3 &> /dev/null; then
            python3 -c "import json; print(json.load(open('package.json'))['version'])" 2>/dev/null || echo "0.0.0"
        elif command -v python &> /dev/null; then
            python -c "import json; print(json.load(open('package.json'))['version'])" 2>/dev/null || echo "0.0.0"
        else
            # Fallback to grep/sed
            grep '"version"' package.json | sed 's/.*"version": *"\([^"]*\)".*/\1/' 2>/dev/null || echo "0.0.0"
        fi
    else
        echo "0.0.0"
    fi
}

# Get version from package.json
VERSION=$(get_package_version)
echo -e "\e[36mBuilding version: $VERSION\e[0m"

# Function to safely remove files with retry logic
remove_item_safely() {
    local path="$1"
    local max_attempts=3
    local delay_seconds=2
    
    for ((attempt=1; attempt<=max_attempts; attempt++)); do
        if [ -e "$path" ]; then
            if rm -rf "$path" 2>/dev/null; then
                echo -e "   \e[90mSuccessfully removed: $path\e[0m"
                return 0
            else
                if [ $attempt -eq $max_attempts ]; then
                    echo -e "   \e[33mWarning: Could not remove $path after $max_attempts attempts. Continuing anyway...\e[0m"
                    return 1
                fi
                echo -e "   \e[33mAttempt $attempt failed to remove $path, retrying in $delay_seconds seconds...\e[0m"
                sleep $delay_seconds
            fi
        else
            return 0
        fi
    done
}

# Clean previous build
echo -e "\e[33mCleaning previous builds...\e[0m"

remove_item_safely "dist/web-component"
remove_item_safely "dist/ibf-dashboard-bundle*.js"

# Only clean ZIP files if we're going to create new ones
if [ "$ZIP_MODE" = true ]; then
    remove_item_safely "dist/ibf-dashboard-web-component*.zip"
fi

# Build the web component
echo -e "\e[33mBuilding web component...\e[0m"
npx ng run app:build-web-component

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "\e[32mBuild successful, creating bundle...\e[0m"
    
    # Create dist directory if it doesn't exist
    mkdir -p dist
    
    # Find JavaScript files in the browser directory
    BROWSER_PATH="dist/web-component/browser"
    if [ -d "$BROWSER_PATH" ]; then
        RUNTIME_FILE=$(find "$BROWSER_PATH" -name "runtime*.js" | head -1)
        POLYFILLS_FILE=$(find "$BROWSER_PATH" -name "polyfills*.js" | head -1)
        MAIN_FILE=$(find "$BROWSER_PATH" -name "main*.js" | head -1)
        
        # Concatenate files manually
        echo -e "\e[33mConcatenating files into single versioned bundle...\e[0m"
        
        BUNDLE_CONTENT=""
        if [ -n "$RUNTIME_FILE" ] && [ -f "$RUNTIME_FILE" ]; then
            echo -e "   \e[90mAdding: $(basename "$RUNTIME_FILE")\e[0m"
            BUNDLE_CONTENT="$(cat "$RUNTIME_FILE")"
        fi
        if [ -n "$POLYFILLS_FILE" ] && [ -f "$POLYFILLS_FILE" ]; then
            echo -e "   \e[90mAdding: $(basename "$POLYFILLS_FILE")\e[0m"
            if [ -n "$BUNDLE_CONTENT" ]; then
                BUNDLE_CONTENT="$BUNDLE_CONTENT"$'\n'"$(cat "$POLYFILLS_FILE")"
            else
                BUNDLE_CONTENT="$(cat "$POLYFILLS_FILE")"
            fi
        fi
        if [ -n "$MAIN_FILE" ] && [ -f "$MAIN_FILE" ]; then
            echo -e "   \e[90mAdding: $(basename "$MAIN_FILE")\e[0m"
            if [ -n "$BUNDLE_CONTENT" ]; then
                BUNDLE_CONTENT="$BUNDLE_CONTENT"$'\n'"$(cat "$MAIN_FILE")"
            else
                BUNDLE_CONTENT="$(cat "$MAIN_FILE")"
            fi
        fi
        
        # Add version comment at the top of the bundle
        CURRENT_DATE=$(date '+%Y-%m-%d %H:%M:%S')
        VERSION_COMMENT="/* IBF Dashboard Web Component v$VERSION - Built on $CURRENT_DATE */"
        BUNDLE_CONTENT="$VERSION_COMMENT"$'\n'"$BUNDLE_CONTENT"
        
        # Create versioned bundle file names
        BUNDLE_FILE_NAME="ibf-dashboard-bundle-v$VERSION.js"
        MINIFIED_BUNDLE_FILE_NAME="ibf-dashboard-bundle-v$VERSION.min.js"
        
        # Write bundle to versioned file
        echo "$BUNDLE_CONTENT" > "dist/$BUNDLE_FILE_NAME"
        
        # Copy the bundle as minified version (we'll compress it manually if needed)
        cp "dist/$BUNDLE_FILE_NAME" "dist/$MINIFIED_BUNDLE_FILE_NAME"
        
        # Also create the non-versioned files for backward compatibility
        cp "dist/$BUNDLE_FILE_NAME" "dist/ibf-dashboard-bundle.js"
        cp "dist/$MINIFIED_BUNDLE_FILE_NAME" "dist/ibf-dashboard-bundle.min.js"
        
        # Copy assets to dist root for easier access
        echo -e "\e[33mCopying assets...\e[0m"
        if [ -d "$BROWSER_PATH/assets" ]; then
            cp -r "$BROWSER_PATH/assets" "dist/" 2>/dev/null || echo -e "   \e[90mNo assets to copy\e[0m"
        fi
        
        # Copy SVG icons (Ionic icons)
        echo -e "\e[33mCopying SVG icons...\e[0m"
        if [ -d "$BROWSER_PATH/svg" ]; then
            cp -r "$BROWSER_PATH/svg" "dist/" 2>/dev/null || echo -e "   \e[90mNo SVG icons to copy\e[0m"
        fi
        
        # Create a README file with usage instructions
        cat > "dist/README.md" << EOF
# IBF Dashboard Web Component v$VERSION

Built on: $CURRENT_DATE

## Files included:
- $BUNDLE_FILE_NAME - Main web component bundle (with version)
- $MINIFIED_BUNDLE_FILE_NAME - Minified web component bundle (with version)
- ibf-dashboard-bundle.js - Main bundle (backward compatibility)
- ibf-dashboard-bundle.min.js - Minified bundle (backward compatibility)
- assets/ - Required assets (images, fonts, etc.)
- svg/ - Ionic SVG icons

## Usage:

### Basic Usage:
\`\`\`html
<script src="$MINIFIED_BUNDLE_FILE_NAME"></script>
<ibf-dashboard country-code="ETH" embed-platform="generic"></ibf-dashboard>
\`\`\`

### With Custom Height:
\`\`\`html
<script src="$MINIFIED_BUNDLE_FILE_NAME"></script>
<ibf-dashboard 
  country-code="ETH" 
  embed-platform="generic"
  style="height: 600px;">
</ibf-dashboard>
\`\`\`

### Available Attributes:
- country-code: ISO3 country code (e.g., "ETH", "KEN", "UGA")
- embed-platform: Platform identifier (e.g., "generic", "espocrm")
- height: Component height (use CSS or style attribute)

## Version: $VERSION
EOF
        
        # Create ZIP file only if --zip flag is provided
        if [ "$ZIP_MODE" = true ]; then
            echo -e "\e[33mCreating versioned ZIP package...\e[0m"
            ZIP_FILE_NAME="ibf-dashboard-web-component-v$VERSION.zip"
            
            # Remove existing zip if it exists
            if [ -f "dist/$ZIP_FILE_NAME" ]; then
                rm -f "dist/$ZIP_FILE_NAME"
            fi
            
            # Create zip file with all necessary files
            FILES_TO_ZIP=(
                "dist/$BUNDLE_FILE_NAME"
                "dist/$MINIFIED_BUNDLE_FILE_NAME"
                "dist/ibf-dashboard-bundle.js"
                "dist/ibf-dashboard-bundle.min.js"
                "dist/README.md"
            )
            
            # Add assets and svg directories if they exist
            if [ -d "dist/assets" ]; then
                FILES_TO_ZIP+=("dist/assets")
            fi
            if [ -d "dist/svg" ]; then
                FILES_TO_ZIP+=("dist/svg")
            fi
            
            # Create ZIP using available zip command
            if command -v zip &> /dev/null; then
                if zip -r "dist/$ZIP_FILE_NAME" "${FILES_TO_ZIP[@]}" > /dev/null 2>&1; then
                    echo -e "   \e[32mZIP package created: $ZIP_FILE_NAME\e[0m"
                    ZIP_MESSAGE="ZIP package: dist/$ZIP_FILE_NAME"
                    if [ -f "dist/$ZIP_FILE_NAME" ]; then
                        ZIP_SIZE_KB=$(du -k "dist/$ZIP_FILE_NAME" | cut -f1)
                        ZIP_SIZE_MB=$(echo "scale=2; $ZIP_SIZE_KB/1024" | bc 2>/dev/null || echo "scale=2; $ZIP_SIZE_KB/1024" | awk '{printf "%.2f", $1/1024}')
                        ZIP_SIZE_MESSAGE="ZIP size: ${ZIP_SIZE_MB} MB"
                    else
                        ZIP_SIZE_MESSAGE="ZIP size: N/A"
                    fi
                else
                    echo -e "   \e[33mWarning: Could not create ZIP file using zip command\e[0m"
                    ZIP_MESSAGE="ZIP package: Failed to create"
                    ZIP_SIZE_MESSAGE="ZIP size: N/A"
                fi
            else
                echo -e "   \e[33mWarning: zip command not found, cannot create ZIP file\e[0m"
                ZIP_MESSAGE="ZIP package: zip command not available"
                ZIP_SIZE_MESSAGE=""
            fi
        else
            echo -e "\e[90mSkipping ZIP package creation (use --zip flag to enable)\e[0m"
            ZIP_MESSAGE="ZIP package: Skipped (use --zip flag to enable)"
            ZIP_SIZE_MESSAGE=""
        fi
        
        echo ""
        echo -e "\e[32mWeb component built successfully!\e[0m"
        echo -e "\e[36mVersion: v$VERSION\e[0m"
        echo -e "\e[36mVersioned bundle: dist/$BUNDLE_FILE_NAME\e[0m"
        echo -e "\e[36mVersioned minified: dist/$MINIFIED_BUNDLE_FILE_NAME\e[0m"
        echo -e "\e[36m$ZIP_MESSAGE\e[0m"
        
        # Get file sizes
        if [ -f "dist/$BUNDLE_FILE_NAME" ]; then
            BUNDLE_SIZE_KB=$(du -k "dist/$BUNDLE_FILE_NAME" | cut -f1)
            BUNDLE_SIZE_MB=$(echo "scale=2; $BUNDLE_SIZE_KB/1024" | bc 2>/dev/null || awk "BEGIN {printf \"%.2f\", $BUNDLE_SIZE_KB/1024}")
            echo -e "\e[36mBundle size: ${BUNDLE_SIZE_MB} MB\e[0m"
        fi
        
        if [ -n "$ZIP_SIZE_MESSAGE" ]; then
            echo -e "\e[36m$ZIP_SIZE_MESSAGE\e[0m"
        fi
        
        echo ""
        echo -e "\e[32mUsage:\e[0m"
        echo -e "\e[90m   <script src=\"$MINIFIED_BUNDLE_FILE_NAME\"></script>\e[0m"
        echo -e "\e[90m   <ibf-dashboard country-code=\"ETH\" embed-platform=\"generic\"></ibf-dashboard>\e[0m"
        
    else
        echo -e "\e[31mBrowser output directory not found: $BROWSER_PATH\e[0m"
        exit 1
    fi
    
else
    echo -e "\e[31mBuild failed!\e[0m"
    echo -e "\e[33mCheck the Angular build logs above for details\e[0m"
    exit 1
fi

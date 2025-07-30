#!/bin/bash

# IBF Dashboard Web Component Builder for Unix/Linux/macOS
# This script implements identical functionality to build-web-component.ps1

# Default values
ZIP_MODE=false
SHOW_HELP=false
VERSION_INCREMENT=""
NO_VERSION_UPDATE=false

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
        --version-patch)
            VERSION_INCREMENT="patch"
            shift
            ;;
        --version-minor)
            VERSION_INCREMENT="minor"
            shift
            ;;
        --version-major)
            VERSION_INCREMENT="major"
            shift
            ;;
        --no-version-update)
            NO_VERSION_UPDATE=true
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
    echo "  build-web-component.sh                    Build web component (patch version increment)"
    echo "  build-web-component.sh --zip              Build web component with ZIP package"
    echo "  build-web-component.sh --version-patch    Increment patch version (0.0.X)"
    echo "  build-web-component.sh --version-minor    Increment minor version (0.X.0)"
    echo "  build-web-component.sh --version-major    Increment major version (X.0.0)"
    echo "  build-web-component.sh --no-version-update Build without changing version"
    echo "  build-web-component.sh --help             Show this help message"
    echo ""
    echo -e "\e[33mOptions:\e[0m"
    echo "  --zip, -z              Create ZIP package (slower, for distribution)"
    echo "  --version-patch        Increment patch version (default behavior)"
    echo "  --version-minor        Increment minor version"
    echo "  --version-major        Increment major version"
    echo "  --no-version-update    Skip version increment"
    echo "  --help, -h             Show this help message"
    echo ""
    echo -e "\e[33mVersion Management:\e[0m"
    echo "  By default, the script increments the patch version (0.0.X) on each build."
    echo "  The new version is automatically injected into the web component and"
    echo "  logged to the browser console when the component loads."
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

# Function to increment version number in package.json
increment_version() {
    local increment_type="${1:-patch}"  # patch, minor, or major
    
    echo -e "\e[33mIncrementing version ($increment_type)...\e[0m"
    
    # Get current version
    local current_version=$(get_package_version)
    echo -e "   Current version: $current_version"
    
    # Parse version components
    local version_regex="^([0-9]+)\.([0-9]+)\.([0-9]+).*"
    if [[ $current_version =~ $version_regex ]]; then
        local major="${BASH_REMATCH[1]}"
        local minor="${BASH_REMATCH[2]}"
        local patch="${BASH_REMATCH[3]}"
        
        # Increment based on type
        case "$increment_type" in
            "major")
                major=$((major + 1))
                minor=0
                patch=0
                ;;
            "minor")
                minor=$((minor + 1))
                patch=0
                ;;
            "patch"|*)
                patch=$((patch + 1))
                ;;
        esac
        
        local new_version="${major}.${minor}.${patch}"
        echo -e "   New version: $new_version"
        
        # Update package.json using multiple methods for reliability
        if command -v jq >/dev/null 2>&1; then
            # Method 1: Using jq (most reliable)
            jq ".version = \"$new_version\"" package.json > package.json.tmp && mv package.json.tmp package.json
            echo -e "   \e[90mUpdated via jq\e[0m"
        elif command -v node >/dev/null 2>&1; then
            # Method 2: Using node
            node -e "
                const fs = require('fs');
                const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
                pkg.version = '$new_version';
                fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
            "
            echo -e "   \e[90mUpdated via node\e[0m"
        else
            # Method 3: Using sed (fallback) - create temp file to avoid permission issues
            sed "s/\"version\": *\"[^\"]*\"/\"version\": \"$new_version\"/" package.json > package.json.tmp
            if [ -f package.json.tmp ]; then
                mv package.json.tmp package.json
                echo -e "   \e[90mUpdated via sed\e[0m"
            else
                echo -e "   \e[31m❌ sed update failed\e[0m"
                return 1
            fi
        fi
        
        # Verify the update worked
        local updated_version=$(get_package_version)
        if [ "$updated_version" = "$new_version" ]; then
            echo -e "   \e[32m✅ Version successfully updated to $new_version\e[0m"
            return 0
        else
            echo -e "   \e[31m❌ Version update failed. Still showing: $updated_version\e[0m"
            return 1
        fi
    else
        echo -e "   \e[31m❌ Could not parse version: $current_version\e[0m"
        return 1
    fi
}

# Function to update environment files with new version
update_environment_files() {
    local new_version="$1"
    local version_with_v="v$new_version"
    
    echo -e "\e[33mUpdating environment files with version $version_with_v...\e[0m"
    
    # List of environment files to update
    local env_files=(
        "src/environments/environment.ts"
        "src/environments/environment.development.ts"
        "src/environments/environment.production.ts"
        "src/environments/environment.stage.ts"
        "src/environments/environment.test.ts"
        "src/environments/environment.ci.ts"
    )
    
    local updated_count=0
    
    for env_file in "${env_files[@]}"; do
        if [ -f "$env_file" ]; then
            # Update ibfSystemVersion in the environment file
            if sed -i.bak "s/ibfSystemVersion: *'v[^']*'/ibfSystemVersion: '$version_with_v'/g" "$env_file" 2>/dev/null; then
                # Remove backup file if sed succeeded
                rm -f "$env_file.bak" 2>/dev/null
                echo -e "   \e[32m✅ Updated $env_file\e[0m"
                updated_count=$((updated_count + 1))
            else
                echo -e "   \e[33m⚠️  Could not update $env_file (file may not exist or no permission)\e[0m"
            fi
        else
            echo -e "   \e[90m⏭️  Skipped $env_file (file does not exist)\e[0m"
        fi
    done
    
    echo -e "   \e[36mUpdated $updated_count environment files\e[0m"
    return 0
}

# Get version from package.json
VERSION=$(get_package_version)
echo -e "\e[36mCurrent version: $VERSION\e[0m"

# Handle version increment
if [ "$NO_VERSION_UPDATE" = true ]; then
    echo -e "\e[90mSkipping version update (--no-version-update specified)\e[0m"
elif [ -n "$VERSION_INCREMENT" ]; then
    # User specified explicit increment type
    if increment_version "$VERSION_INCREMENT"; then
        VERSION=$(get_package_version)
        update_environment_files "$VERSION"
    else
        echo -e "\e[31m❌ Failed to increment version. Exiting.\e[0m"
        exit 1
    fi
else
    # Default behavior: increment patch version
    echo -e "\e[90mAuto-incrementing patch version...\e[0m"
    if increment_version "patch"; then
        VERSION=$(get_package_version)
        update_environment_files "$VERSION"
    else
        echo -e "\e[31m❌ Failed to increment version. Exiting.\e[0m"
        exit 1
    fi
fi

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
echo -e "\e[33mBuilding web component with EspoCRM configuration...\e[0m"
npm run build:web-component:espocrm

# Check if build was successful
if [ $? -eq 0 ]; then
    echo -e "\e[32mBuild successful, preparing modular files...\e[0m"
    
    # Create dist directory if it doesn't exist
    mkdir -p dist
    
    # Find JavaScript files in the browser directory
    BROWSER_PATH="dist/web-component/browser"
    if [ -d "$BROWSER_PATH" ]; then
        echo -e "\e[33mSkipping bundle creation - using modular approach (main.js + chunks)...\e[0m"
        
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
        
        # Copy styles
        echo -e "\e[33mCopying styles...\e[0m"
        if [ -f "$BROWSER_PATH/styles.css" ]; then
            cp "$BROWSER_PATH/styles.css" "dist/" 2>/dev/null || echo -e "   \e[90mNo styles to copy\e[0m"
        fi
        
        # Create a README file with usage instructions
        CURRENT_DATE=$(date '+%Y-%m-%d %H:%M:%S')
        cat > "dist/README.md" << EOF
# IBF Dashboard Web Component v$VERSION

Built on: $CURRENT_DATE

## Modular Approach
This build uses the modular approach with main.js + chunks instead of a single bundle file.

## Files included:
- web-component/browser/main.js - Main Angular web component entry point
- web-component/browser/polyfills.js - Browser polyfills  
- web-component/browser/chunk-*.js - Dynamically loaded modules (~100 chunk files)
- web-component/browser/styles.css - Component styling
- assets/ - Required assets (images, fonts, i18n translations, etc.)
- svg/ - Ionic SVG icons

## Usage:

### Basic Usage (ES6 Modules):
\`\`\`html
<link rel="stylesheet" href="web-component/browser/styles.css">
<script src="web-component/browser/polyfills.js"></script>
<script type="module" src="web-component/browser/main.js"></script>

<ibf-dashboard 
  country-code="ETH" 
  platform="generic"
  api-base-url="https://ibf-api.rodekruis.nl">
</ibf-dashboard>
\`\`\`

### EspoCRM Integration:
\`\`\`html
<ibf-dashboard 
  country-code="ETH" 
  platform="espocrm"
  api-base-url="https://ibf-api.rodekruis.nl"
  theme="auto"
  language="en">
</ibf-dashboard>
\`\`\`

### Available Attributes:
- country-code: ISO3 country code (e.g., "ETH", "KEN", "UGA")
- platform: Platform identifier ("generic", "espocrm", "dhis2")
- api-base-url: IBF API endpoint URL
- theme: "light", "dark", or "auto"
- language: Language code (e.g., "en", "es", "fr")
- features: JSON array of enabled features

## Notes:
- Chunks are loaded dynamically as needed
- All assets must be served from the same origin or properly configured
- The base href should point to the assets directory for proper asset resolution

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
            
            # Create zip file with all necessary modular files
            FILES_TO_ZIP=(
                "dist/web-component"
                "dist/README.md"
            )
            
            # Add assets and svg directories if they exist
            if [ -d "dist/assets" ]; then
                FILES_TO_ZIP+=("dist/assets")
            fi
            if [ -d "dist/svg" ]; then
                FILES_TO_ZIP+=("dist/svg")
            fi
            if [ -f "dist/styles.css" ]; then
                FILES_TO_ZIP+=("dist/styles.css")
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
        
        # Copy files to EspoCRM extension directory
        echo -e "\e[33mCopying files to EspoCRM extension...\e[0m"
        ESPOCRM_MODULE_DIR="../espocrm/files/client/custom/modules/ibf-dashboard"
        ESPOCRM_ASSETS_DIR="$ESPOCRM_MODULE_DIR/assets"
        ESPOCRM_VIEW_DIR="../espocrm/files/client/custom/modules/ibf-dashboard/src/views"
        ESPOCRM_MANIFEST="../espocrm/manifest.json"
        
        if [ -d "$ESPOCRM_MODULE_DIR" ]; then
            # Create necessary directories
            mkdir -p "$ESPOCRM_ASSETS_DIR"
            
            # Copy main JS files to assets directory (matches deployUrl/)
            echo -e "   \e[90mCopying main JS files to assets directory...\e[0m"
            cp "$BROWSER_PATH/main.js" "$ESPOCRM_ASSETS_DIR/"
            cp "$BROWSER_PATH/polyfills.js" "$ESPOCRM_ASSETS_DIR/"
            cp "$BROWSER_PATH"/chunk-*.js "$ESPOCRM_ASSETS_DIR/" 2>/dev/null || echo -e "   \e[90mNo chunk files to copy\e[0m"
            
            # Copy CSS file to assets directory (matches deployUrl/)
            if [ -f "$BROWSER_PATH/styles.css" ]; then
                echo -e "   \e[90mCopying CSS file to assets directory...\e[0m"
                cp "$BROWSER_PATH/styles.css" "$ESPOCRM_ASSETS_DIR/styles.css"
            fi
            
            # Copy assets directory contents to match deployUrl structure
            if [ -d "$BROWSER_PATH/assets" ]; then
                echo -e "   \e[90mCopying assets to match deployUrl structure...\e[0m"
                # Copy assets to /assets/ subdirectory (matches deployUrl/assets/)
                cp -r "$BROWSER_PATH/assets"/* "$ESPOCRM_ASSETS_DIR/" 2>/dev/null || echo -e "   \e[90mNo additional assets to copy\e[0m"
            fi
            
            # Copy SVG icons to match deployUrl structure  
            if [ -d "$BROWSER_PATH/svg" ]; then
                echo -e "   \e[90mCopying SVG icons to match deployUrl structure...\e[0m"
                # Copy SVG to /assets/svg/ (matches deployUrl/svg/)
                mkdir -p "$ESPOCRM_ASSETS_DIR/svg"
                
                # Run SVG optimization script
                if [ -f "./optimize-svg-icons.sh" ]; then
                    bash ./optimize-svg-icons.sh "$ESPOCRM_ASSETS_DIR/svg"
                else
                    # Fallback to copying all SVG files if optimization script doesn't exist
                    echo -e "   \e[33mOptimization script not found, copying all SVG files...\e[0m"
                    cp -r "$BROWSER_PATH/svg"/* "$ESPOCRM_ASSETS_DIR/svg/" 2>/dev/null || echo -e "   \e[90mNo SVG icons to copy\e[0m"
                fi
            fi
            
            # Update EspoCRM view with current version
            if [ -f "$ESPOCRM_VIEW_DIR/ibfdashboard.js" ]; then
                echo -e "   \e[90mUpdating EspoCRM view with version $VERSION...\e[0m"
                # Use temp files to avoid permission issues on Windows/WSL
                sed "s/this\.extensionVersion = '[^']*'/this.extensionVersion = '$VERSION'/g" "$ESPOCRM_VIEW_DIR/ibfdashboard.js" > "$ESPOCRM_VIEW_DIR/ibfdashboard.js.tmp"
                sed "s/this\.extensionBuildDate = '[^']*'/this.extensionBuildDate = '$(date '+%Y-%m-%d')'/g" "$ESPOCRM_VIEW_DIR/ibfdashboard.js.tmp" > "$ESPOCRM_VIEW_DIR/ibfdashboard.js.tmp2"
                mv "$ESPOCRM_VIEW_DIR/ibfdashboard.js.tmp2" "$ESPOCRM_VIEW_DIR/ibfdashboard.js"
                rm -f "$ESPOCRM_VIEW_DIR/ibfdashboard.js.tmp" 2>/dev/null
            fi
            
            # Note: EspoCRM manifest version is managed separately and should not be auto-updated
            # The EspoCRM extension has its own versioning lifecycle independent of the web component
            echo -e "   \e[90mEspoCRM manifest version is managed independently (not auto-updated)\e[0m"
            
            echo -e "   \e[32mSuccessfully copied files to EspoCRM extension\e[0m"
            echo -e "   \e[36mEspoCRM extension files updated (manifest version preserved)\e[0m"
        else
            echo -e "   \e[33mWarning: EspoCRM extension directory not found at $ESPOCRM_MODULE_DIR\e[0m"
            echo -e "   \e[33mSkipping EspoCRM file copy (this is normal if not working with EspoCRM)\e[0m"
        fi

        echo ""
        echo -e "\e[32mWeb component built successfully (modular approach)!\e[0m"
        echo -e "\e[36mVersion: v$VERSION\e[0m"
        echo -e "\e[36mModular files: dist/web-component/browser/\e[0m"
        echo -e "\e[36m$ZIP_MESSAGE\e[0m"
        
        # Get modular files sizes
        if [ -f "$BROWSER_PATH/main.js" ]; then
            MAIN_SIZE_KB=$(du -k "$BROWSER_PATH/main.js" | cut -f1)
            MAIN_SIZE_MB=$(echo "scale=2; $MAIN_SIZE_KB/1024" | bc 2>/dev/null || awk "BEGIN {printf \"%.2f\", $MAIN_SIZE_KB/1024}")
            echo -e "\e[36mMain.js size: ${MAIN_SIZE_MB} MB\e[0m"
        fi
        
        # Count chunk files
        CHUNK_COUNT=$(find "$BROWSER_PATH" -name "chunk-*.js" | wc -l)
        if [ "$CHUNK_COUNT" -gt 0 ]; then
            echo -e "\e[36mChunk files: ${CHUNK_COUNT} files\e[0m"
        fi
        
        if [ -n "$ZIP_SIZE_MESSAGE" ]; then
            echo -e "\e[36m$ZIP_SIZE_MESSAGE\e[0m"
        fi
        
        echo ""
        echo -e "\e[32mUsage (Modular):\e[0m"
        echo -e "\e[90m   <link rel=\"stylesheet\" href=\"dist/web-component/browser/styles.css\">\e[0m"
        echo -e "\e[90m   <script src=\"dist/web-component/browser/polyfills.js\"></script>\e[0m"
        echo -e "\e[90m   <script type=\"module\" src=\"dist/web-component/browser/main.js\"></script>\e[0m"
        echo -e "\e[90m   <ibf-dashboard country-code=\"ETH\" platform=\"generic\"></ibf-dashboard>\e[0m"
        
    else
        echo -e "\e[31mBrowser output directory not found: $BROWSER_PATH\e[0m"
        exit 1
    fi
    
else
    echo -e "\e[31mBuild failed!\e[0m"
    echo -e "\e[33mCheck the Angular build logs above for details\e[0m"
    exit 1
fi

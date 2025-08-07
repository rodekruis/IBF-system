#!/bin/bash

# EspoCRM IBF Dashboard Extension Packager (Bash)
# This script creates a zip package that can be uploaded to EspoCRM as an extension
#
# Usage:
#   ./create-extension.sh           # Use current version from manifest.json
#   ./create-extension.sh --patch   # Auto-increment patch version (1.0.0 -> 1.0.1)
#   ./create-extension.sh --minor   # Auto-increment minor version (1.0.0 -> 1.1.0)  
#   ./create-extension.sh --major   # Auto-increment major version (1.0.0 -> 2.0.0)

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

EXTENSION_NAME="ibf-dashboard-extension"

# Parse command line arguments
PATCH=false
MINOR=false
MAJOR=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --patch)
            PATCH=true
            shift
            ;;
        --minor)
            MINOR=true
            shift
            ;;
        --major)
            MAJOR=true
            shift
            ;;
        *)
            echo -e "${RED}Unknown parameter: $1${NC}"
            echo "Usage: $0 [--patch|--minor|--major]"
            exit 1
            ;;
    esac
done

# Load current manifest
if [[ ! -f "manifest.json" ]]; then
    echo -e "${RED}Error: manifest.json not found in current directory${NC}"
    exit 1
fi

echo -e "${GRAY}Using pure bash for JSON processing${NC}"

# Get current version using pure bash JSON parsing
CURRENT_VERSION=""
while IFS= read -r line; do
    # Look for version line and extract value
    if [[ $line =~ \"version\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
        CURRENT_VERSION="${BASH_REMATCH[1]}"
        break
    fi
done < "manifest.json"

if [[ -z "$CURRENT_VERSION" ]]; then
    echo -e "${RED}Error: Could not find version in manifest.json${NC}"
    exit 1
fi

# Handle version incrementing
if [[ "$PATCH" == true ]] || [[ "$MINOR" == true ]] || [[ "$MAJOR" == true ]]; then
    IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
    MAJOR_NUM=${VERSION_PARTS[0]}
    MINOR_NUM=${VERSION_PARTS[1]}
    PATCH_NUM=${VERSION_PARTS[2]}
    
    if [[ "$MAJOR" == true ]]; then
        ((MAJOR_NUM++))
        MINOR_NUM=0
        PATCH_NUM=0
        NEW_VERSION="$MAJOR_NUM.$MINOR_NUM.$PATCH_NUM"
        echo -e "${CYAN}Auto-incrementing MAJOR version: $CURRENT_VERSION -> $NEW_VERSION${NC}"
    elif [[ "$MINOR" == true ]]; then
        ((MINOR_NUM++))
        PATCH_NUM=0
        NEW_VERSION="$MAJOR_NUM.$MINOR_NUM.$PATCH_NUM"
        echo -e "${CYAN}Auto-incrementing MINOR version: $CURRENT_VERSION -> $NEW_VERSION${NC}"
    elif [[ "$PATCH" == true ]]; then
        ((PATCH_NUM++))
        NEW_VERSION="$MAJOR_NUM.$MINOR_NUM.$PATCH_NUM"
        echo -e "${CYAN}Auto-incrementing PATCH version: $CURRENT_VERSION -> $NEW_VERSION${NC}"
    fi
    
    # Update manifest with new version using pure bash
    RELEASE_DATE=$(date +%Y-%m-%d)
    
    # Create updated manifest content
    {
        while IFS= read -r line; do
            if [[ $line =~ ^([[:space:]]*)\"version\"[[:space:]]*:[[:space:]]*\"[^\"]+\"(.*)$ ]]; then
                echo "${BASH_REMATCH[1]}\"version\": \"$NEW_VERSION\"${BASH_REMATCH[2]}"
            elif [[ $line =~ ^([[:space:]]*)\"releaseDate\"[[:space:]]*:[[:space:]]*\"[^\"]+\"(.*)$ ]]; then
                echo "${BASH_REMATCH[1]}\"releaseDate\": \"$RELEASE_DATE\"${BASH_REMATCH[2]}"
            else
                echo "$line"
            fi
        done < "manifest.json"
    } > "manifest.json.tmp" && mv "manifest.json.tmp" "manifest.json"
    
    echo -e "${GREEN}Updated manifest.json with new version and release date${NC}"
    echo ""
    
    VERSION="$NEW_VERSION"
else
    VERSION="$CURRENT_VERSION"
    echo -e "${GRAY}Using current version from manifest.json: $VERSION${NC}"
fi

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_FILE="$SCRIPT_DIR/$EXTENSION_NAME-v$VERSION.zip"

echo -e "${GREEN}Creating EspoCRM IBF Dashboard Extension Package${NC}"
echo -e "${GREEN}==================================================${NC}"
echo -e "${CYAN}Extension: IBF Dashboard${NC}"
echo -e "${CYAN}Version: $VERSION${NC}"
echo -e "${CYAN}Output: $OUTPUT_FILE${NC}"
echo ""

# Remove existing package if it exists
if [[ -f "$OUTPUT_FILE" ]]; then
    echo -e "${YELLOW}Removing existing package: $OUTPUT_FILE${NC}"
    rm -f "$OUTPUT_FILE"
fi

# Create temporary directory for packaging
TEMP_DIR="temp_package"
if [[ -d "$TEMP_DIR" ]]; then
    rm -rf "$TEMP_DIR"
fi
mkdir -p "$TEMP_DIR/files"

echo -e "${YELLOW}Preparing extension package...${NC}"

# Copy manifest.json to root of package
cp manifest.json "$TEMP_DIR/"

# Copy only specified extension files and directories
echo -e "${YELLOW}Copying extension files...${NC}"

# Define files and directories to include in the extension package
INCLUDE_DIRS=("files")
INCLUDE_FILES=("manifest.json")

echo -e "${GRAY}   Including directories: ${INCLUDE_DIRS[*]}${NC}"
echo -e "${GRAY}   Including files: ${INCLUDE_FILES[*]}${NC}"

# Define the extension folders using correct EspoCRM extension structure
echo -e "${YELLOW}Setting up EspoCRM extension structure...${NC}"

# Copy files using EspoCRM extension structure (files/ and scripts/ at root)
echo -e "${GRAY}   Copying extension files...${NC}"

# Copy included directories
for dir in "${INCLUDE_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
        if [[ "$dir" == "files" ]]; then
            # Files directory goes directly to root
            cp -r "$dir"/* "$TEMP_DIR/files/"
            FILE_COUNT=$(find "$TEMP_DIR/files" -type f | wc -l)
            echo -e "${GREEN}   Copied $FILE_COUNT files from $dir/ to files/${NC}"
        else
            # Other directories maintain their structure
            mkdir -p "$TEMP_DIR/$dir"
            cp -r "$dir"/* "$TEMP_DIR/$dir/"
            FILE_COUNT=$(find "$TEMP_DIR/$dir" -type f | wc -l)
            echo -e "${GREEN}   Copied $FILE_COUNT files from $dir/ to $dir/${NC}"
        fi
    else
        echo -e "${YELLOW}   Warning: Directory $dir not found, skipping${NC}"
    fi
done

# Copy included files to root
for file in "${INCLUDE_FILES[@]}"; do
    if [[ -f "$file" ]]; then
        cp "$file" "$TEMP_DIR/$file"
        echo -e "${GREEN}   Copied $file${NC}"
    else
        echo -e "${YELLOW}   Warning: File $file not found, skipping${NC}"
    fi
done

echo -e "${YELLOW}Creating zip package with Linux-compatible paths...${NC}"

# Create ZIP archive
cd "$TEMP_DIR"

# Find all files and add them to ZIP with proper paths
find . -type f | while read -r file; do
    # Remove leading ./ from path
    clean_path="${file#./}"
    echo -e "${GRAY}   Adding: $clean_path${NC}"
done

# Create ZIP file using cross-platform approach
# Try different ZIP creation methods in order of preference

ZIP_CREATED=false

# Method 1: Try native zip command (available on most Unix systems)
if command -v zip &> /dev/null; then
    echo -e "${GRAY}   Using native zip command...${NC}"
    zip -r "../$(basename "$OUTPUT_FILE")" . -x "*.DS_Store*" "*.git*" "*ibf-dashboard-extension-v*.zip" "*.sh" "*.md"
    ZIP_EXIT_CODE=$?
    if [[ $ZIP_EXIT_CODE -eq 0 ]]; then
        ZIP_CREATED=true
        echo -e "${GREEN}   ZIP created successfully with native zip command${NC}"
    fi
fi

# Method 2: Try using WSL zip command if on Windows
if [[ "$ZIP_CREATED" == false ]] && [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    if command -v wsl &> /dev/null; then
        echo -e "${GRAY}   Trying WSL zip command...${NC}"
        # Convert Windows path to WSL path and use zip
        WSL_TEMP_DIR=$(wsl wslpath -u "$(pwd)")
        WSL_OUTPUT_FILE=$(wsl wslpath -u "../$(basename "$OUTPUT_FILE")")
        wsl bash -c "cd '$WSL_TEMP_DIR' && zip -r '$WSL_OUTPUT_FILE' . -x '*.DS_Store*' '*.git*'"
        ZIP_EXIT_CODE=$?
        if [[ $ZIP_EXIT_CODE -eq 0 ]]; then
            ZIP_CREATED=true
            echo -e "${GREEN}   ZIP created successfully with WSL zip command${NC}"
        fi
    fi
fi

# Method 3: Use tar as fallback (available everywhere)
if [[ "$ZIP_CREATED" == false ]]; then
    echo -e "${GRAY}   Using tar as fallback (will create .tar.gz instead of .zip)...${NC}"
    TAR_OUTPUT_FILE="../$(basename "$OUTPUT_FILE" .zip).tar.gz"
    tar -czf "$TAR_OUTPUT_FILE" --exclude="*.DS_Store*" --exclude="*.git*" .
    ZIP_EXIT_CODE=$?
    if [[ $ZIP_EXIT_CODE -eq 0 ]]; then
        ZIP_CREATED=true
        OUTPUT_FILE="$SCRIPT_DIR/$(basename "$TAR_OUTPUT_FILE")"
        echo -e "${YELLOW}   Created .tar.gz file instead of .zip (EspoCRM can handle both)${NC}"
    fi
fi

# Final fallback: Create a detailed error message
if [[ "$ZIP_CREATED" == false ]]; then
    echo -e "${RED}Error: Could not create archive with any available method${NC}"
    echo -e "${YELLOW}Please install one of the following:${NC}"
    echo -e "${WHITE}  - zip command: apt install zip (Ubuntu/Debian) or brew install zip (macOS)${NC}"
    echo -e "${WHITE}  - WSL with zip: wsl --install then wsl sudo apt install zip${NC}"
    echo -e "${WHITE}  - Or manually create ZIP from temp_package directory${NC}"
    cd ..
    echo -e "${CYAN}Manual ZIP creation:${NC}"
    echo -e "${WHITE}  1. Navigate to: $(pwd)/${TEMP_DIR}${NC}"
    echo -e "${WHITE}  2. Select all files and create ZIP manually${NC}"
    echo -e "${WHITE}  3. Name it: $(basename "$OUTPUT_FILE")${NC}"
    exit 1
fi

# ZIP creation result is already handled above
echo -e "${GREEN}Archive created successfully${NC}"

cd ..

# Cleanup
rm -rf "$TEMP_DIR"

# Verify package was created
if [[ -f "$OUTPUT_FILE" ]]; then
    FILE_SIZE_KB=$(du -k "$OUTPUT_FILE" | cut -f1)
    echo -e "${GREEN}Package created successfully!${NC}"
    echo -e "${WHITE}File: $OUTPUT_FILE${NC}"
    echo -e "${WHITE}Size: $FILE_SIZE_KB KB${NC}"
    echo ""
    echo -e "${CYAN}Installation Instructions:${NC}"
    echo -e "${WHITE}1. Go to your EspoCRM instance${NC}"
    echo -e "${WHITE}2. Navigate to Administration > Extensions${NC}"
    echo -e "${WHITE}3. Click Upload and select: $OUTPUT_FILE${NC}"
    echo -e "${WHITE}4. Click Install to install the extension${NC}"
    echo -e "${WHITE}5. Clear cache if prompted${NC}"
    echo ""
    echo -e "${GREEN}The IBF Dashboard will appear in the main navigation menu.${NC}"
else
    echo -e "${RED}Error: Package creation failed!${NC}"
    exit 1
fi

#!/bin/bash

# EspoCRM Custom Entity Packager (Locate-based)
# This script uses the 'locate' command to find custom entity files
# and packages them into a zip file with correct directory structure

# Usage: ./package-custom-entities-locate.sh [entity_name] [espocrm_root] [output_zip]

set -e

# Default values
ENTITY_NAME="$1"
ESPOCRM_ROOT="${2:-/var/www/espocrm/data/espocrm}"
OUTPUT_ZIP="${3:-${ENTITY_NAME:-custom-entities}-$(date +%Y%m%d-%H%M%S).zip}"
TEMP_DIR="temp_packaging_$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}EspoCRM Custom Entity Packager (Locate-based)${NC}"
echo "============================================="
echo ""

# Check if locate command is available
if ! command -v locate &> /dev/null; then
    echo -e "${RED}Error: 'locate' command not found${NC}"
    echo "Please install 'locate' or use the find-based version"
    echo "Ubuntu: sudo apt-get install mlocate && sudo updatedb"
    exit 1
fi

# Function to detect all custom entities
detect_all_custom_entities() {
    echo -e "${BLUE}Detecting all custom entities using locate...${NC}"
    
    local entities=()
    
    # Find entity definition files
    while IFS= read -r file; do
        if [[ "$file" == */custom/Espo/Custom/Resources/metadata/entityDefs/*.json ]]; then
            entity_name=$(basename "$file" .json)
            # Skip common core entities
            case "$entity_name" in
                User|Team|Role|Account|Contact|Lead|Opportunity|Case|Email|Call|Meeting|Task|Document|Campaign|TargetList|EmailTemplate|Attachment|Note|Portal|Import|Export)
                    ;;
                *)
                    entities+=("$entity_name")
                    ;;
            esac
        fi
    done < <(locate "*/custom/Espo/Custom/Resources/metadata/entityDefs/*.json" 2>/dev/null)
    
    # Remove duplicates
    local unique_entities=($(printf '%s\n' "${entities[@]}" | sort -u))
    
    printf '%s\n' "${unique_entities[@]}"
}

# Function to find files for a specific entity using locate
find_entity_files_locate() {
    local entity="$1"
    local files=()
    
    echo -e "${YELLOW}Finding files for entity: $entity using locate...${NC}"
    
    # Use locate to find files related to the entity
    while IFS= read -r file; do
        # Only include files that are in the EspoCRM root and in custom directories
        if [[ "$file" == "$ESPOCRM_ROOT"* ]] && [[ "$file" == */custom/* ]]; then
            # Convert to relative path
            rel_path="${file#$ESPOCRM_ROOT/}"
            files+=("$rel_path")
        fi
    done < <(locate "$entity" 2>/dev/null | grep -E "(custom|client)" | grep -v ".git" | grep -v "node_modules")
    
    # Also search for lowercase entity names (for client-side files)
    local entity_lower=$(echo "$entity" | tr '[:upper:]' '[:lower:]')
    if [ "$entity_lower" != "$entity" ]; then
        while IFS= read -r file; do
            if [[ "$file" == "$ESPOCRM_ROOT"* ]] && [[ "$file" == */custom/* ]]; then
                rel_path="${file#$ESPOCRM_ROOT/}"
                # Add only if not already in the list
                if [[ ! " ${files[@]} " =~ " ${rel_path} " ]]; then
                    files+=("$rel_path")
                fi
            fi
        done < <(locate "$entity_lower" 2>/dev/null | grep -E "(custom|client)" | grep -v ".git" | grep -v "node_modules")
    fi
    
    # Remove duplicates and sort
    local unique_files=($(printf '%s\n' "${files[@]}" | sort -u))
    
    printf '%s\n' "${unique_files[@]}"
}

# Function to copy files maintaining directory structure
copy_files_to_temp() {
    local entity="$1"
    shift
    local files=("$@")
    
    echo -e "${GREEN}Copying ${#files[@]} files for $entity...${NC}"
    
    local copied_count=0
    for file in "${files[@]}"; do
        local source_file="$ESPOCRM_ROOT/$file"
        local dest_file="$TEMP_DIR/files/$file"
        
        if [ -f "$source_file" ]; then
            # Create directory structure
            local dest_dir=$(dirname "$dest_file")
            mkdir -p "$dest_dir"
            
            # Copy file
            cp "$source_file" "$dest_file"
            echo "  ✓ $file"
            ((copied_count++))
        elif [ -d "$source_file" ]; then
            # Copy entire directory
            local dest_dir="$TEMP_DIR/files/$file"
            mkdir -p "$(dirname "$dest_dir")"
            cp -r "$source_file" "$dest_dir"
            echo "  ✓ $file/ (directory)"
            ((copied_count++))
        else
            echo "  ✗ $file (not found)"
        fi
    done
    
    echo -e "${GREEN}  Copied $copied_count files successfully${NC}"
}

# Function to create manifest.json
create_manifest() {
    echo -e "${BLUE}Creating manifest.json...${NC}"
    
    local manifest="$TEMP_DIR/manifest.json"
    local timestamp=$(date +"%Y-%m-%d")
    local entity_list=""
    
    if [ -n "$ENTITY_NAME" ]; then
        entity_list="$ENTITY_NAME"
    else
        entity_list="Multiple entities"
    fi
    
    cat > "$manifest" << EOF
{
    "name": "Custom Entities Package - $entity_list",
    "description": "Packaged custom entities ($entity_list) exported from EspoCRM installation",
    "author": "EspoCRM Custom Entity Packager",
    "php": [
        ">=7.4.0"
    ],
    "version": "1.0.0",
    "acceptableVersions": [
        ">=7.0.0"
    ],
    "releaseDate": "$timestamp",
    "license": "MIT",
    "tags": [
        "custom",
        "entities",
        "export"
    ]
}
EOF
    
    echo "Created manifest.json"
}

# Main execution
if [ -z "$ENTITY_NAME" ]; then
    echo -e "${YELLOW}No specific entity provided. Detecting all custom entities...${NC}"
    echo ""
    
    # Detect all custom entities
    custom_entities=($(detect_all_custom_entities))
    
    if [ ${#custom_entities[@]} -eq 0 ]; then
        echo -e "${YELLOW}No custom entities found${NC}"
        exit 0
    fi
    
    echo -e "${GREEN}Found ${#custom_entities[@]} custom entities:${NC}"
    printf '  - %s\n' "${custom_entities[@]}"
    echo ""
    
    # Process each entity
    mkdir -p "$TEMP_DIR"
    
    for entity in "${custom_entities[@]}"; do
        echo -e "${BLUE}Processing entity: $entity${NC}"
        
        # Find all files for this entity
        entity_files=($(find_entity_files_locate "$entity"))
        
        if [ ${#entity_files[@]} -eq 0 ]; then
            echo -e "${YELLOW}  No files found for $entity${NC}"
            continue
        fi
        
        echo -e "${GREEN}  Found ${#entity_files[@]} files for $entity${NC}"
        
        # Copy files to temp directory
        copy_files_to_temp "$entity" "${entity_files[@]}"
        echo ""
    done
    
else
    echo -e "${YELLOW}Processing specific entity: $ENTITY_NAME${NC}"
    echo ""
    
    # Validate EspoCRM root directory
    if [ ! -d "$ESPOCRM_ROOT" ]; then
        echo -e "${RED}Error: EspoCRM root directory '$ESPOCRM_ROOT' not found${NC}"
        echo "Usage: $0 [entity_name] [espocrm_root_path] [output_zip_name]"
        exit 1
    fi
    
    # Create temporary directory
    mkdir -p "$TEMP_DIR"
    
    # Find all files for the specified entity
    entity_files=($(find_entity_files_locate "$ENTITY_NAME"))
    
    if [ ${#entity_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}No files found for entity: $ENTITY_NAME${NC}"
        echo "Make sure the entity exists and updatedb has been run recently"
        rm -rf "$TEMP_DIR"
        exit 1
    fi
    
    echo -e "${GREEN}Found ${#entity_files[@]} files for $ENTITY_NAME${NC}"
    echo ""
    
    # Copy files to temp directory
    copy_files_to_temp "$ENTITY_NAME" "${entity_files[@]}"
fi

# Create manifest
create_manifest

# Generate file list
echo -e "${BLUE}Generating file list...${NC}"
find "$TEMP_DIR/files" -type f | while read -r file; do
    rel_path="${file#$TEMP_DIR/files/}"
    echo "$rel_path"
done | sort > "$TEMP_DIR/extension-files.txt"

echo "Total files to package: $(wc -l < "$TEMP_DIR/extension-files.txt")"

# Create the ZIP file
echo -e "${BLUE}Creating ZIP package...${NC}"

cd "$TEMP_DIR"
zip -r "../$OUTPUT_ZIP" . -x "*.DS_Store" "*/.git/*" "*/node_modules/*"
cd ..

# Cleanup
rm -rf "$TEMP_DIR"

# Final output
if [ -f "$OUTPUT_ZIP" ]; then
    echo -e "${GREEN}✓ Package created successfully!${NC}"
    echo ""
    echo -e "${YELLOW}Package Details:${NC}"
    echo "  File: $OUTPUT_ZIP"
    echo "  Size: $(du -h "$OUTPUT_ZIP" | cut -f1)"
    if [ -n "$ENTITY_NAME" ]; then
        echo "  Entity: $ENTITY_NAME"
    else
        echo "  Entities: ${#custom_entities[@]}"
    fi
    echo ""
    echo -e "${BLUE}To install this package:${NC}"
    echo "1. Go to EspoCRM Administration > Extensions"
    echo "2. Upload the ZIP file: $OUTPUT_ZIP"
    echo "3. Click Install"
    echo "4. Clear cache and rebuild"
    echo ""
    echo -e "${BLUE}Example usage:${NC}"
    echo "  Package specific entity: $0 CBranch"
    echo "  Package all entities: $0"
    echo "  Custom paths: $0 CBranch /path/to/espocrm custom-name.zip"
else
    echo -e "${RED}✗ Failed to create package${NC}"
    exit 1
fi

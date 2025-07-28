#!/bin/bash

# EspoCRM Custom Entity Packager
# This script finds custom entities and packages all their related files into a zip file
# with the correct directory structure for EspoCRM extensions

# Usage: ./package-custom-entities.sh [espocrm_root_path] [output_zip_name]

set -e

# Default values
ESPOCRM_ROOT="${1:-/var/www/espocrm/data/espocrm}"
OUTPUT_ZIP="${2:-custom-entities-$(date +%Y%m%d-%H%M%S).zip}"
TEMP_DIR="temp_packaging_$(date +%s)"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}EspoCRM Custom Entity Packager${NC}"
echo "=================================="
echo ""

# Validate EspoCRM root directory
if [ ! -d "$ESPOCRM_ROOT" ]; then
    echo -e "${RED}Error: EspoCRM root directory '$ESPOCRM_ROOT' not found${NC}"
    echo "Usage: $0 [espocrm_root_path] [output_zip_name]"
    echo "Example: $0 /var/www/espocrm/data/espocrm custom-entities.zip"
    exit 1
fi

if [ ! -d "$ESPOCRM_ROOT/custom" ]; then
    echo -e "${RED}Error: Custom directory '$ESPOCRM_ROOT/custom' not found${NC}"
    echo "This doesn't appear to be a valid EspoCRM installation"
    exit 1
fi

echo -e "${YELLOW}EspoCRM Root:${NC} $ESPOCRM_ROOT"
echo -e "${YELLOW}Output ZIP:${NC} $OUTPUT_ZIP"
echo ""

# Create temporary directory
mkdir -p "$TEMP_DIR"

# Function to detect custom entities
detect_custom_entities() {
    echo -e "${BLUE}Detecting custom entities...${NC}"
    
    local entities=()
    
    # Look for custom entity definitions
    if [ -d "$ESPOCRM_ROOT/custom/Espo/Custom/Resources/metadata/entityDefs" ]; then
        for entity_file in "$ESPOCRM_ROOT/custom/Espo/Custom/Resources/metadata/entityDefs"/*.json; do
            if [ -f "$entity_file" ]; then
                entity_name=$(basename "$entity_file" .json)
                entities+=("$entity_name")
            fi
        done
    fi
    
    # Also check scopes directory
    if [ -d "$ESPOCRM_ROOT/custom/Espo/Custom/Resources/metadata/scopes" ]; then
        for scope_file in "$ESPOCRM_ROOT/custom/Espo/Custom/Resources/metadata/scopes"/*.json; do
            if [ -f "$scope_file" ]; then
                entity_name=$(basename "$scope_file" .json)
                # Add to entities if not already present
                if [[ ! " ${entities[@]} " =~ " ${entity_name} " ]]; then
                    entities+=("$entity_name")
                fi
            fi
        done
    fi
    
    # Remove common EspoCRM core entities that might appear in custom
    local core_entities=("User" "Team" "Role" "Account" "Contact" "Lead" "Opportunity" "Case" "Email" "Call" "Meeting" "Task" "Document" "Campaign" "TargetList" "EmailTemplate")
    local custom_entities=()
    
    for entity in "${entities[@]}"; do
        is_core=false
        for core in "${core_entities[@]}"; do
            if [ "$entity" = "$core" ]; then
                is_core=true
                break
            fi
        done
        if [ "$is_core" = false ]; then
            custom_entities+=("$entity")
        fi
    done
    
    printf '%s\n' "${custom_entities[@]}"
}

# Function to find all files for an entity
find_entity_files() {
    local entity="$1"
    local files=()
    
    echo -e "${YELLOW}Finding files for entity: $entity${NC}"
    
    # Common paths to search for entity files
    local search_paths=(
        "custom/Espo/Custom/Controllers/${entity}.php"
        "custom/Espo/Custom/Services/${entity}.php"
        "custom/Espo/Custom/Repositories/${entity}.php"
        "custom/Espo/Custom/Hooks/${entity}"
        "custom/Espo/Custom/Resources/metadata/entityDefs/${entity}.json"
        "custom/Espo/Custom/Resources/metadata/scopes/${entity}.json"
        "custom/Espo/Custom/Resources/metadata/clientDefs/${entity}.json"
        "custom/Espo/Custom/Resources/metadata/recordDefs/${entity}.json"
        "custom/Espo/Custom/Resources/metadata/aclDefs/${entity}.json"
        "custom/Espo/Custom/Resources/layouts/${entity}"
        "custom/Espo/Custom/Resources/i18n"
        "client/custom/src/views/${entity,,}"
        "client/custom/src/views/${entity,,}.js"
        "client/custom/res/templates/${entity,,}"
    )
    
    # Find files using locate-like approach but with find
    while IFS= read -r -d '' file; do
        # Convert absolute path to relative path from ESPOCRM_ROOT
        rel_path="${file#$ESPOCRM_ROOT/}"
        files+=("$rel_path")
    done < <(find "$ESPOCRM_ROOT" -type f \( -name "*${entity}*" -o -path "*/${entity}/*" -o -path "*/${entity,,}/*" \) -path "*/custom/*" -print0 2>/dev/null)
    
    # Also search for translation files
    while IFS= read -r -d '' file; do
        rel_path="${file#$ESPOCRM_ROOT/}"
        if [[ ! " ${files[@]} " =~ " ${rel_path} " ]]; then
            files+=("$rel_path")
        fi
    done < <(find "$ESPOCRM_ROOT/custom/Espo/Custom/Resources/i18n" -type f -name "${entity}.json" -print0 2>/dev/null)
    
    printf '%s\n' "${files[@]}"
}

# Function to copy files maintaining directory structure
copy_files_to_temp() {
    local entity="$1"
    shift
    local files=("$@")
    
    echo -e "${GREEN}Copying ${#files[@]} files for $entity...${NC}"
    
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
        elif [ -d "$source_file" ]; then
            # Copy entire directory
            local dest_dir="$TEMP_DIR/files/$file"
            mkdir -p "$(dirname "$dest_dir")"
            cp -r "$source_file" "$dest_dir"
            echo "  ✓ $file/ (directory)"
        fi
    done
}

# Function to generate file list for extension
generate_file_list() {
    echo -e "${BLUE}Generating file list...${NC}"
    
    local file_list="$TEMP_DIR/extension-files.txt"
    
    # Find all files in the temp directory and create relative paths
    find "$TEMP_DIR/files" -type f | while read -r file; do
        rel_path="${file#$TEMP_DIR/files/}"
        echo "$rel_path"
    done | sort > "$file_list"
    
    echo "Generated file list: $file_list"
    echo "Total files: $(wc -l < "$file_list")"
}

# Function to create manifest.json for extension
create_manifest() {
    echo -e "${BLUE}Creating manifest.json...${NC}"
    
    local manifest="$TEMP_DIR/manifest.json"
    local timestamp=$(date +"%Y-%m-%d")
    
    cat > "$manifest" << EOF
{
    "name": "Custom Entities Package",
    "description": "Packaged custom entities exported from EspoCRM installation",
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
echo -e "${BLUE}Starting custom entity detection...${NC}"

# Detect custom entities
custom_entities=($(detect_custom_entities))

if [ ${#custom_entities[@]} -eq 0 ]; then
    echo -e "${YELLOW}No custom entities found in $ESPOCRM_ROOT${NC}"
    exit 0
fi

echo -e "${GREEN}Found ${#custom_entities[@]} custom entities:${NC}"
printf '  - %s\n' "${custom_entities[@]}"
echo ""

# Process each entity
for entity in "${custom_entities[@]}"; do
    echo -e "${BLUE}Processing entity: $entity${NC}"
    
    # Find all files for this entity
    entity_files=($(find_entity_files "$entity"))
    
    if [ ${#entity_files[@]} -eq 0 ]; then
        echo -e "${YELLOW}  No files found for $entity${NC}"
        continue
    fi
    
    echo -e "${GREEN}  Found ${#entity_files[@]} files for $entity${NC}"
    
    # Copy files to temp directory
    copy_files_to_temp "$entity" "${entity_files[@]}"
    echo ""
done

# Generate file list
generate_file_list

# Create manifest
create_manifest

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
    echo "  Entities: ${#custom_entities[@]}"
    echo ""
    echo -e "${BLUE}To install this package:${NC}"
    echo "1. Go to EspoCRM Administration > Extensions"
    echo "2. Upload the ZIP file: $OUTPUT_ZIP"
    echo "3. Click Install"
    echo "4. Clear cache and rebuild"
else
    echo -e "${RED}✗ Failed to create package${NC}"
    exit 1
fi

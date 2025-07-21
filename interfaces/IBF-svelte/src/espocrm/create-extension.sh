#!/bin/bash

#!/bin/bash

# EspoCRM IBF Portal Extension Packager
# 
# Creates extension package following official EspoCRM patterns:
# - Simple AfterInstall.php for post-installation tasks  
# - Simple AfterUninstall.php for cleanup logging
# - No manual file management - EspoCRM handles this automatically
#
# Extension Structure:
# ├── manifest.json (extension metadata)
# ├── scripts/
# │   ├── AfterInstall.php (cache clearing, logging)
# │   └── AfterUninstall.php (cleanup logging)  
# └── files/ (all extension files - automatically tracked by EspoCRM)

EXTENSION_NAME="ibf-dashboard-extension"
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
OUTPUT_FILE="${EXTENSION_NAME}-v${VERSION}.zip"

echo "🚀 Creating EspoCRM IBF Dashboard Extension Package"
echo "=================================================="
echo "Extension: IBF Dashboard"
echo "Version: $VERSION"
echo "Output: $OUTPUT_FILE"
echo ""

# Remove existing package if it exists
if [ -f "$OUTPUT_FILE" ]; then
    echo "🗑️  Removing existing package: $OUTPUT_FILE"
    rm "$OUTPUT_FILE"
fi

# Create temporary directory for packaging
TEMP_DIR="temp_package"
if [ -d "$TEMP_DIR" ]; then
    rm -rf "$TEMP_DIR"
fi

echo "📁 Creating package structure..."
mkdir -p "$TEMP_DIR"

# Copy manifest.json to root of package
cp manifest.json "$TEMP_DIR/"

# Copy all extension files maintaining directory structure
echo "📄 Copying extension files..."

# Client-side files
mkdir -p "$TEMP_DIR/files/client/custom/src/controllers"
mkdir -p "$TEMP_DIR/files/client/custom/src/views/dashlets" 
mkdir -p "$TEMP_DIR/files/client/custom/res/templates"

cp client/custom/src/controllers/ibf-dashboard.js "$TEMP_DIR/files/client/custom/src/controllers/"
cp client/custom/src/views/ibf-dashboard.js "$TEMP_DIR/files/client/custom/src/views/"
cp client/custom/src/views/dashlets/ibf-dashbboard.js "$TEMP_DIR/files/client/custom/src/views/dashlets/"
cp client/custom/res/templates/ibf-dashboard.tpl "$TEMP_DIR/files/client/custom/res/templates/"

# Application metadata files
mkdir -p "$TEMP_DIR/files/application/Espo/Custom/Resources/metadata/app"
mkdir -p "$TEMP_DIR/files/application/Espo/Custom/Resources/metadata/clientDefs"
mkdir -p "$TEMP_DIR/files/application/Espo/Custom/Resources/i18n/en_US"

cp application/Espo/Custom/Resources/metadata/app/navbar.json "$TEMP_DIR/files/application/Espo/Custom/Resources/metadata/app/"
cp application/Espo/Custom/Resources/metadata/app/routes.json "$TEMP_DIR/files/application/Espo/Custom/Resources/metadata/app/"
cp application/Espo/Custom/Resources/metadata/clientDefs/IbfDashboard.json "$TEMP_DIR/files/application/Espo/Custom/Resources/metadata/clientDefs/"
cp application/Espo/Custom/Resources/i18n/en_US/Global.json "$TEMP_DIR/files/application/Espo/Custom/Resources/i18n/en_US/"

# Custom backend files
mkdir -p "$TEMP_DIR/files/custom/Espo/Custom/Controllers"
mkdir -p "$TEMP_DIR/files/custom/Espo/Custom/Resources/metadata/dashlets"

cp custom/Espo/Custom/Controllers/ibfAuth.php "$TEMP_DIR/files/custom/Espo/Custom/Controllers/"
cp custom/Espo/Custom/Resources/metadata/dashlets/IbfDashboard.json "$TEMP_DIR/files/custom/Espo/Custom/Resources/metadata/dashlets/"
cp custom/Espo/Custom/Resources/routes.json "$TEMP_DIR/files/custom/Espo/Custom/Resources/"

echo "📦 Creating zip package..."

# Create the zip file
cd "$TEMP_DIR"
zip -r "../$OUTPUT_FILE" . > /dev/null
cd ..

# Cleanup
rm -rf "$TEMP_DIR"

# Verify package was created
if [ -f "$OUTPUT_FILE" ]; then
    FILE_SIZE=$(du -h "$OUTPUT_FILE" | cut -f1)
    echo "✅ Package created successfully!"
    echo "📄 File: $OUTPUT_FILE"
    echo "📏 Size: $FILE_SIZE"
    echo ""
    echo "🎯 Installation Instructions:"
    echo "1. Go to your EspoCRM instance"
    echo "2. Navigate to Administration > Extensions"
    echo "3. Click 'Upload' and select: $OUTPUT_FILE"
    echo "4. Click 'Install' to install the extension"
    echo "5. Clear cache if prompted"
    echo ""
    echo "The IBF Dashboard will appear in the main navigation menu."
else
    echo "❌ Error: Package creation failed!"
    exit 1
fi

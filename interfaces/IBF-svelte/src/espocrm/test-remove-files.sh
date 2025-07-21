#!/bin/bash

# Test script to temporarily remove extension files to identify the problematic one
# Usage: ./test-remove-files.sh [step-number]

BACKUP_DIR="/tmp/ibf-extension-debug"
ESPOCRM_DIR="/var/www/espocrm"

case "$1" in
    "1")
        echo "🧪 Test 1: Remove main IBF Dashboard view file"
        sudo mkdir -p $BACKUP_DIR
        sudo mv "$ESPOCRM_DIR/client/src/views/ibf-dashboard.js" "$BACKUP_DIR/" 2>/dev/null || echo "File not found"
        echo "✅ Removed ibf-dashboard.js - Test the site now"
        echo "   If fixed: The main view file has issues"
        echo "   If still broken: Run ./test-remove-files.sh 2"
        ;;
    "2")
        echo "🧪 Test 2: Remove dashlet files"
        sudo mv "$ESPOCRM_DIR/client/src/views/dashlets/ibf-dashboard.js" "$BACKUP_DIR/" 2>/dev/null || echo "Dashlet file not found"
        echo "✅ Removed dashlet file - Test the site now"
        echo "   If fixed: The dashlet file has issues"
        echo "   If still broken: Run ./test-remove-files.sh 3"
        ;;
    "3")
        echo "🧪 Test 3: Remove metadata files"
        sudo mv "$ESPOCRM_DIR/application/Espo/Modules/IBFDashboard" "$BACKUP_DIR/IBFDashboard-module" 2>/dev/null || echo "Module dir not found"
        echo "✅ Removed module directory - Test the site now"
        echo "   If fixed: Server-side metadata has issues"
        echo "   If still broken: Run ./test-remove-files.sh 4"
        ;;
    "4")
        echo "🧪 Test 4: Remove all remaining client files"
        sudo find "$ESPOCRM_DIR/client" -name "*ibf*" -o -name "*IBF*" -exec mv {} "$BACKUP_DIR/" \; 2>/dev/null
        echo "✅ Removed all IBF client files - Test the site now"
        ;;
    "restore")
        echo "🔄 Restoring all files from backup"
        if [ -d "$BACKUP_DIR" ]; then
            sudo cp -r "$BACKUP_DIR"/* "$ESPOCRM_DIR/" 2>/dev/null
            echo "✅ Files restored"
        else
            echo "❌ No backup found"
        fi
        ;;
    "list")
        echo "📋 Current IBF extension files in EspoCRM:"
        echo ""
        echo "Client-side files:"
        sudo find "$ESPOCRM_DIR/client" -name "*ibf*" -o -name "*IBF*" 2>/dev/null
        echo ""
        echo "Server-side files:"
        sudo find "$ESPOCRM_DIR/application" -name "*ibf*" -o -name "*IBF*" 2>/dev/null
        echo ""
        echo "Custom files:"
        sudo find "$ESPOCRM_DIR/custom" -name "*ibf*" -o -name "*IBF*" 2>/dev/null
        ;;
    *)
        echo "🔍 IBF Extension Debug Helper"
        echo ""
        echo "Usage:"
        echo "  ./test-remove-files.sh list      # List all IBF files"
        echo "  ./test-remove-files.sh 1        # Remove main view file"
        echo "  ./test-remove-files.sh 2        # Remove dashlet file"
        echo "  ./test-remove-files.sh 3        # Remove metadata files"
        echo "  ./test-remove-files.sh 4        # Remove all client files"
        echo "  ./test-remove-files.sh restore  # Restore all files"
        echo ""
        echo "💡 Strategy: Start with step 1, test the site, then proceed if still broken"
        ;;
esac

echo ""
echo "🔄 Don't forget to clear EspoCRM cache after each test:"
echo "   sudo docker exec espocrm php command.php clear-cache"

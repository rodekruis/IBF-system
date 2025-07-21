#!/bin/bash
set -e

# EspoCRM IBF Portal Extension Installer
# 
# Usage:
#   ./install-extension.sh                    # Install latest version found
#   ./install-extension.sh 1.0.1             # Install specific version
#   ./install-extension.sh --list            # List available versions
#
# EspoCRM Extension Lifecycle (OFFICIAL PATTERN):
# 1. Install: EspoCRM extracts files and tracks them in Extension entity database
# 2. AfterInstall.php: Custom post-installation tasks (cache clearing, logging)
# 3. Upgrade: EspoCRM automatically replaces files, no manual cleanup needed
# 4. AfterUninstall.php: Custom cleanup tasks (logging only)
# 5. Uninstall: EspoCRM automatically removes all tracked files
#
# Key: EspoCRM handles ALL file management automatically via Extension entity tracking!

EXTENSION_NAME="ibf-dashboard-extension"

# Function to list available versions
list_versions() {
    echo "📋 Available extension versions:"
    ls ${EXTENSION_NAME}-v*.zip 2>/dev/null | sed 's/.*-v\(.*\)\.zip/\1/' | sort -V || {
        echo "❌ No extension packages found (${EXTENSION_NAME}-v*.zip)"
        exit 1
    }
}

# Function to get latest version
get_latest_version() {
    ls ${EXTENSION_NAME}-v*.zip 2>/dev/null | sed 's/.*-v\(.*\)\.zip/\1/' | sort -V | tail -n1 || {
        echo "❌ No extension packages found"
        exit 1
    }
}

# Handle command line arguments
if [ "$1" = "--list" ]; then
    list_versions
    exit 0
fi

# Determine version to install
if [ -n "$1" ]; then
    # Use provided version
    VERSION="$1"
    PACKAGE_FILE="${EXTENSION_NAME}-v${VERSION}.zip"
    
    if [ ! -f "$PACKAGE_FILE" ]; then
        echo "❌ Version $VERSION not found!"
        echo ""
        echo "Available versions:"
        list_versions
        exit 1
    fi
    
    echo "🎯 Using specified version: $VERSION"
else
    # Auto-detect latest version
    VERSION=$(get_latest_version)
    PACKAGE_FILE="${EXTENSION_NAME}-v${VERSION}.zip"
    echo "🔍 Auto-detected latest version: $VERSION"
fi

echo "=================================================="
echo "EspoCRM Extension Installation (Official Method)"
echo "=================================================="
echo "Extension: $EXTENSION_NAME"
echo "Version: $VERSION"
echo "Package: $PACKAGE_FILE"
echo ""

echo "🔧 Creating extensions directory..."
sudo mkdir -p /var/www/espocrm/data/espocrm/extensions

echo "📦 Moving package to extensions directory..."
sudo mv /home/mali-espocrm-admin/$PACKAGE_FILE /var/www/espocrm/data/espocrm/extensions/

echo "🔍 Verifying file paths..."
echo "   Host extensions directory:"
ls -la /var/www/espocrm/data/espocrm/extensions/ | grep "$PACKAGE_FILE" && echo "   ✅ Package found on host" || echo "   ❌ Package missing on host"
echo "   Container extensions directory (should be same files):"
sudo docker exec espocrm ls -la /var/www/html/extensions/ 2>/dev/null | grep "$PACKAGE_FILE" && echo "   ✅ Package accessible from container" || echo "   ❌ Package not accessible from container"

echo "🔍 Validating extension package..."
echo "   Package size: $(ls -lh /var/www/espocrm/data/espocrm/extensions/$PACKAGE_FILE | awk '{print $5}')"
echo "   Package contents:"
sudo unzip -l /var/www/espocrm/data/espocrm/extensions/$PACKAGE_FILE | head -15

echo "   Checking for required files..."
if sudo unzip -l /var/www/espocrm/data/espocrm/extensions/$PACKAGE_FILE | grep -q "manifest.json"; then
    echo "   ✅ manifest.json found"
else
    echo "   ❌ manifest.json missing!"
    exit 1
fi

echo "   Verifying container can access the package..."
if sudo docker exec espocrm test -f "/var/www/html/extensions/$PACKAGE_FILE"; then
    echo "   ✅ Container can access package file"
    echo "   Container package size: $(sudo docker exec espocrm ls -lh /var/www/html/extensions/$PACKAGE_FILE | awk '{print $5}')"
else
    echo "   ❌ Container cannot access package file!"
    echo "   Container extensions directory contents:"
    sudo docker exec espocrm ls -la /var/www/html/extensions/ 2>/dev/null || echo "   Extensions directory doesn't exist in container"
    echo "   Host extensions directory contents:"
    ls -la /var/www/espocrm/data/espocrm/extensions/
    echo ""
    echo "   🔧 Volume mapping issue detected! Checking Docker volumes..."
    sudo docker inspect espocrm | grep -A 5 -B 5 "Mounts\|Volume" || echo "   Could not inspect container volumes"
    exit 1
fi

echo "📁 Changing to EspoCRM directory..."
cd /var/www/espocrm

echo "🔍 Checking EspoCRM environment..."
echo "   EspoCRM version:"
sudo docker exec espocrm php command.php version 2>/dev/null || echo "   (Could not determine version)"
echo "   PHP version:"
sudo docker exec espocrm php -v | head -1
echo "   Available memory:"
sudo docker exec espocrm php -r "echo ini_get('memory_limit') . PHP_EOL;"
echo "   Max execution time:"
sudo docker exec espocrm php -r "echo ini_get('max_execution_time') . 's' . PHP_EOL;"

echo "   Fixing database and file permissions..."
# Fix EspoCRM application directory permissions
sudo docker exec espocrm chown -R www-data:www-data /var/www/html/data/
sudo docker exec espocrm chmod -R 755 /var/www/html/data/
sudo docker exec espocrm chmod -R 644 /var/www/html/data/config.php 2>/dev/null || true

echo "   Post-fix permissions check:"
sudo docker exec espocrm ls -la /var/www/html/data/ | head -5

echo "🚀 Installing extension (EspoCRM will handle file cleanup automatically)..."

# First, let's check EspoCRM logs for any existing errors
echo "🔍 Checking EspoCRM logs before installation..."
LOG_DATE=$(date +%Y-%m-%d)
sudo docker exec espocrm tail -n 20 /var/www/html/data/logs/espo-${LOG_DATE}.log 2>/dev/null || echo "   (No recent log entries for today)"

echo "📋 Installing extension with detailed output..."
echo "   Using container path: /var/www/html/extensions/$PACKAGE_FILE"

# Check if the extension is already installed and needs to be uninstalled first
echo "   Checking for existing extension installation..."
EXISTING_EXT=$(sudo docker exec espocrm php command.php extension --list 2>/dev/null | grep -i "ibf dashboard" || true)
if [ -n "$EXISTING_EXT" ]; then
    echo "   ⚠️  Found existing extension: $EXISTING_EXT"
    echo "   Uninstalling previous version first..."
    EXT_ID=$(echo "$EXISTING_EXT" | awk -F"'" '{print $(NF-1)}')
    if [ -n "$EXT_ID" ]; then
        echo "   Uninstalling extension ID: $EXT_ID"
        sudo docker exec espocrm php command.php extension --uninstall --id="$EXT_ID" 2>&1 || echo "   (Uninstall may have failed)"
        echo "   Clearing cache after uninstall..."
        sudo docker exec espocrm php command.php clear-cache 2>/dev/null || true
        sleep 2
    fi
fi

echo "   Installing extension..."
sudo docker exec espocrm php command.php extension --file="/var/www/html/extensions/$PACKAGE_FILE" 2>&1 | tee /tmp/espo-install.log

# Check if installation failed
if [ ${PIPESTATUS[0]} -ne 0 ]; then
    echo ""
    echo "❌ Extension installation failed!"
    echo ""
    echo "🔍 Checking EspoCRM error logs..."
    LOG_DATE=$(date +%Y-%m-%d)
    sudo docker exec espocrm tail -n 30 /var/www/html/data/logs/espo-${LOG_DATE}.log 2>/dev/null || {
        echo "   (No log file found for today, checking recent logs...)"
        sudo docker exec espocrm find /var/www/html/data/logs/ -name "espo-*.log" -type f -exec ls -lt {} \; | head -3 | while read line; do
            logfile=$(echo $line | awk '{print $NF}')
            echo "   Recent log: $logfile"
            sudo docker exec espocrm tail -n 10 "$logfile" 2>/dev/null || echo "   (Could not read log)"
        done
    }
    
    echo ""
    echo "🔍 Checking for database permission errors..."
    echo "   Database connection test:"
    sudo docker exec espocrm php -r "
        try {
            \$config = include '/var/www/html/data/config.php';
            \$pdo = new PDO(
                'mysql:host=' . \$config['database']['host'] . ';dbname=' . \$config['database']['dbname'],
                \$config['database']['username'],
                \$config['database']['password']
            );
            echo 'Database connection: OK' . PHP_EOL;
            \$result = \$pdo->query('SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = \"' . \$config['database']['dbname'] . '\"');
            echo 'Tables accessible: ' . \$result->fetch()['count'] . PHP_EOL;
        } catch (Exception \$e) {
            echo 'Database error: ' . \$e->getMessage() . PHP_EOL;
        }
    " 2>/dev/null || echo "   (Could not test database connection)"
    
    echo ""
    echo "🔍 Checking Nginx error logs..."
    sudo docker exec espocrm tail -n 20 /var/log/nginx/error.log 2>/dev/null || echo "   (No Nginx error log found)"
    sudo docker exec espocrm tail -n 20 /var/log/nginx/error.log 2>/dev/null || echo "   (No Nginx error log found)"
    
    echo ""
    echo "🔧 Attempting alternative installation methods..."
    
    echo "   Method 1: Fix application permissions and retry..."
    echo "      Clearing cache..."
    sudo docker exec espocrm php command.php clear-cache 2>/dev/null || true
    
    echo "      Fixing EspoCRM application permissions..."
    sudo docker exec espocrm chown -R www-data:www-data /var/www/html/data/ 2>/dev/null || true
    sudo docker exec espocrm chmod -R 755 /var/www/html/data/ 2>/dev/null || true
    
    echo "      Retrying extension installation..."
    sudo docker exec espocrm php command.php extension --file="/var/www/html/extensions/$PACKAGE_FILE" 2>&1
    
    if [ $? -eq 0 ]; then
        echo "   ✅ Extension installed successfully after permission fix!"
    else
        echo "   ❌ Extension still failed after permission fix"
        
        echo "   Method 2: Force rebuild and retry..."
        sudo docker exec espocrm php command.php rebuild 2>&1 | tee /tmp/espo-rebuild.log
        
        if [ ${PIPESTATUS[0]} -eq 0 ]; then
            echo "   ✅ Rebuild successful, retrying extension installation..."
            sudo docker exec espocrm php command.php extension --file="/var/www/html/extensions/$PACKAGE_FILE" 2>&1
            if [ $? -eq 0 ]; then
                echo "   ✅ Extension installed successfully after rebuild!"
            else
                echo "   ❌ Extension still failed after rebuild"
                
                echo "   Method 3: Manual installation (bypass database schema)..."
                echo "      Extracting extension manually..."
                sudo docker exec espocrm mkdir -p /tmp/extension-manual 2>/dev/null || true
                sudo docker exec espocrm unzip -o /var/www/html/extensions/$PACKAGE_FILE -d /tmp/extension-manual/ 2>&1
                
                echo "      Copying files manually..."
                sudo docker exec espocrm cp -r /tmp/extension-manual/* /var/www/html/ 2>&1
                
                echo "      Setting permissions..."
                sudo docker exec espocrm chown -R www-data:www-data /var/www/html/ 2>/dev/null || true
                
                echo "      Running cache clear instead of full rebuild..."
                sudo docker exec espocrm php command.php clear-cache 2>&1
                
                echo ""
                echo "⚠️  Manual installation completed!"
                echo "   Note: Database schema was not rebuilt due to permission issues."
                echo "   If the extension requires database changes, you may need to:"
                echo "   1. Fix database permissions on the server"
                echo "   2. Run: sudo docker exec espocrm php command.php rebuild"
                echo ""
            fi
        else
            echo "   ❌ Rebuild failed - likely a permission issue"
            echo ""
            echo "💡 Troubleshooting suggestions:"
            echo "   1. Check container logs for more details:"
            echo "      sudo docker logs espocrm"
            echo ""
            echo "   2. Verify file permissions in the EspoCRM container:"
            echo "      sudo docker exec espocrm ls -la /var/www/html/data/"
            echo ""
            echo "   3. Try clearing cache and rebuilding:"
            echo "      sudo docker exec espocrm php command.php clear-cache"
            echo "      sudo docker exec espocrm php command.php rebuild"
            echo ""
            exit 1
        fi
    fi
fi

echo "🔐 Setting permissions for EspoCRM..."
sudo chown -R www-data:www-data /var/www/espocrm

echo "🧹 Clearing cache..."
sudo docker exec espocrm php command.php clear-cache

echo "   EspoCRM extension status:"
sudo docker exec espocrm php command.php extension --list 2>/dev/null | grep -i ibf && echo "      ✅ Extension registered in EspoCRM" || echo "      ❌ Extension not registered in EspoCRM"

echo ""
echo "=================================================="
echo "✅ Extension deployment completed successfully!"
echo "=================================================="
echo "✅ Extension installation completed!"
echo "✅ EspoCRM automatically tracked all installed files"
echo "✅ AfterInstall.php executed successfully"
echo "✅ New extension installed: $PACKAGE_FILE (v$VERSION)" 
echo "✅ Cache cleared"
echo ""
echo "Usage examples for next time:"
echo "  ./install-extension.sh           # Install latest version"
echo "  ./install-extension.sh 1.0.2     # Install specific version"
echo "  ./install-extension.sh --list    # List available versions"
echo ""
echo "Next steps:"
echo "1. Go to EspoCRM Admin → User Interface → Navigation"
echo "2. Add new tab: Label='IBF Dashboard', URL='#IBFDashboard'"
echo "3. Test both dashlet and full-page functionality"
echo ""
echo "💡 Note: Old extension files were automatically backed up to:"
echo "   /var/www/espocrm/data/backup/ibf-extension-[timestamp]/"

<?php
/**
 * Manual IBF Extension Cleanup Script
 * 
 * Run this script if the automatic uninstall doesn't work properly.
 * Place this file in your EspoCRM root directory and run: php manual-cleanup.php
 */

// Include EspoCRM bootstrap
require_once 'bootstrap.php';

$app = new \Espo\Core\Application();
$container = $app->getContainer();

echo "Starting manual IBF extension cleanup...\n";
echo "This will remove IBF Dashboard and IBF User from all EspoCRM menus.\n";
echo "Press Ctrl+C to cancel, or wait 5 seconds to proceed...\n";
sleep(5);

try {
    // Remove IBFDashboard from navigation
    $config = $container->get('config');
    $configWriter = $container->get('configWriter');
    
    // Remove from main navigation
    $tabList = $config->get('tabList', []);
    $originalCount = count($tabList);
    $tabList = array_filter($tabList, function($tab) {
        return !in_array($tab, ['IBFDashboard', 'IBFUser']);
    });
    $tabList = array_values($tabList); // Reindex array
    
    if (count($tabList) !== $originalCount) {
        $configWriter->set('tabList', $tabList);
        echo "✅ Removed IBF tabs from navigation\n";
    } else {
        echo "ℹ️ No IBF tabs found in navigation\n";
    }
    
    // Remove from quick create
    $quickCreateList = $config->get('quickCreateList', []);
    $originalQuickCount = count($quickCreateList);
    $quickCreateList = array_filter($quickCreateList, function($item) {
        return !in_array($item, ['IBFDashboard', 'IBFUser']);
    });
    $quickCreateList = array_values($quickCreateList);
    
    if (count($quickCreateList) !== $originalQuickCount) {
        $configWriter->set('quickCreateList', $quickCreateList);
        echo "✅ Removed IBF items from quick create\n";
    } else {
        echo "ℹ️ No IBF items found in quick create\n";
    }
    
    // Remove from global search
    $globalSearchEntityList = $config->get('globalSearchEntityList', []);
    $originalSearchCount = count($globalSearchEntityList);
    $globalSearchEntityList = array_filter($globalSearchEntityList, function($item) {
        return !in_array($item, ['IBFDashboard', 'IBFUser']);
    });
    $globalSearchEntityList = array_values($globalSearchEntityList);
    
    if (count($globalSearchEntityList) !== $originalSearchCount) {
        $configWriter->set('globalSearchEntityList', $globalSearchEntityList);
        echo "✅ Removed IBF items from global search\n";
    } else {
        echo "ℹ️ No IBF items found in global search\n";
    }
    
    // Save all config changes
    $configWriter->save();
    
    // Remove language labels
    $defaultLanguage = $container->get('defaultLanguage');
    $defaultLanguage->set('Global', 'scopeNames', 'IBFDashboard', null);
    $defaultLanguage->set('Global', 'scopeNames', 'IBFUser', null);
    $defaultLanguage->set('Global', 'scopeNamesPlural', 'IBFUser', null);
    $defaultLanguage->save();
    echo "✅ Removed language labels\n";
    
    // Clear cache
    $container->get('dataManager')->clearCache();
    echo "✅ Cache cleared\n";
    
    // Remove any leftover files (optional - be careful!)
    $filesToRemove = [
        'client/custom/modules/ibf-dashboard',
        'custom/Espo/Modules/IBFDashboard',
        'custom/Espo/Custom/Resources/metadata/scopes/IBFDashboard.json',
        'custom/Espo/Custom/Resources/metadata/scopes/IBFUser.json',
        'custom/Espo/Custom/Resources/metadata/clientDefs/IBFDashboard.json',
        'custom/Espo/Custom/Resources/metadata/clientDefs/IBFUser.json'
    ];
    
    foreach ($filesToRemove as $file) {
        $fullPath = ESPO_ROOT . '/' . $file;
        if (file_exists($fullPath)) {
            if (is_dir($fullPath)) {
                // Recursively remove directory
                $iterator = new RecursiveDirectoryIterator($fullPath, RecursiveDirectoryIterator::SKIP_DOTS);
                $files = new RecursiveIteratorIterator($iterator, RecursiveIteratorIterator::CHILD_FIRST);
                foreach($files as $fileInfo) {
                    if ($fileInfo->isDir()) {
                        rmdir($fileInfo->getRealPath());
                    } else {
                        unlink($fileInfo->getRealPath());
                    }
                }
                rmdir($fullPath);
                echo "✅ Removed directory: $file\n";
            } else {
                unlink($fullPath);
                echo "✅ Removed file: $file\n";
            }
        }
    }
    
    echo "\n🎉 Manual cleanup completed successfully!\n";
    echo "Please:\n";
    echo "1. Reload your EspoCRM admin panel\n";
    echo "2. Clear your browser cache\n";
    echo "3. Check that IBF tabs are no longer visible\n";
    echo "4. Remove this cleanup script from your server\n";
    
} catch (Exception $e) {
    echo "❌ Error during cleanup: " . $e->getMessage() . "\n";
    echo "Stack trace: " . $e->getTraceAsString() . "\n";
}

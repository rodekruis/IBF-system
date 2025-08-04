<?php

class AfterUninstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Log that uninstall script is running
        error_log('IBF Dashboard: AfterUninstall.php script started');
        
        try {
            // Remove IBF Dashboard tab from navbar
            $this->removeIBFDashboardTab();
            
            // Remove IBFUser entity and related data
            //$this->removeIBFUserEntity();
            
            // Remove administration section
            $this->removeAdministrationSection();
            
            // Remove server-side module files
            $this->removeModuleFiles();
            
            // Clear cache to ensure changes take effect
            $this->clearCache();
            
            error_log('IBF Dashboard: AfterUninstall.php script completed successfully');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: AfterUninstall.php script failed: ' . $e->getMessage());
            error_log('IBF Dashboard: Stack trace: ' . $e->getTraceAsString());
        }
    }

    protected function removeIBFDashboardTab()
    {
        try {
            error_log('IBF Dashboard: Removing IBFDashboard tab from navbar');
            
            $config = $this->container->get('config');
            
            // Get current tab list from application settings
            $tabList = $config->get('tabList', []);
            error_log('IBF Dashboard: Current tabList: ' . json_encode($tabList));
            
            // Remove IBF Dashboard tab if it exists
            $updatedTabList = [];
            $removed = false;
            foreach ($tabList as $tab) {
                // Skip IBF Dashboard entries
                if ($tab === 'IBFDashboard') {
                    $removed = true;
                    error_log('IBF Dashboard: Found and removing IBFDashboard tab');
                    continue;
                }
                $updatedTabList[] = $tab;
            }
            
            // Update the configuration if changes were made
            if ($removed) {
                // Try to get configWriter, fallback to creating it if not available
                try {
                    $configWriter = $this->container->get('configWriter');
                } catch (\Exception $e) {
                    // Use injectableFactory to create configWriter
                    $injectableFactory = $this->container->get('injectableFactory');
                    $configWriter = $injectableFactory->create('Espo\\Core\\Utils\\Config\\ConfigWriter');
                }
                
                $configWriter->set('tabList', $updatedTabList);
                $configWriter->save();
                
                error_log('IBF Dashboard: Updated tabList: ' . json_encode($updatedTabList));
                
                // Remove tab label from language files
                $this->removeTabLabel();
            } else {
                error_log('IBF Dashboard: IBFDashboard tab not found in tabList');
            }
            
        } catch (\Exception $e) {
            // Log error but don't fail uninstallation
            error_log('IBF Dashboard: Failed to remove tab from navbar: ' . $e->getMessage());
            error_log('IBF Dashboard: Stack trace: ' . $e->getTraceAsString());
        }
    }

    protected function removeTabLabel()
    {
        try {
            error_log('IBF Dashboard: Removing IBFDashboard tab labels from language files');
            
            $language = $this->container->get('language');
            $defaultLanguage = $this->container->get('defaultLanguage');
            
            // Remove label from default language by setting it to null
            $defaultLanguage->set('Global', 'scopeNames', 'IBFDashboard', null);
            $defaultLanguage->save();
            
            // Remove label from current language if different
            if ($language->getLanguage() !== $defaultLanguage->getLanguage()) {
                $language->set('Global', 'scopeNames', 'IBFDashboard', null);
                $language->save();
            }
            
            error_log('IBF Dashboard: Successfully removed IBFDashboard tab labels');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove tab label: ' . $e->getMessage());
        }
    }

    protected function removeIBFUserEntity()
    {
        try {
            error_log('IBF Dashboard: Removing IBFUser entity and related data');
            
            $config = $this->container->get('config');
            
            // Try to get configWriter
            try {
                $configWriter = $this->container->get('configWriter');
            } catch (\Exception $e) {
                $injectableFactory = $this->container->get('injectableFactory');
                $configWriter = $injectableFactory->create('Espo\\Core\\Utils\\Config\\ConfigWriter');
            }
            
            // Remove IBFUser from tabList if present
            $tabList = $config->get('tabList', []);
            $updatedTabList = array_filter($tabList, function($tab) {
                return $tab !== 'IBFUser';
            });
            
            if (count($updatedTabList) !== count($tabList)) {
                $configWriter->set('tabList', array_values($updatedTabList));
                error_log('IBF Dashboard: Removed IBFUser from tabList');
            }
            
            // Remove IBFUser from quick create list
            $quickCreateList = $config->get('quickCreateList', []);
            $updatedQuickCreateList = array_filter($quickCreateList, function($item) {
                return $item !== 'IBFUser';
            });
            
            if (count($updatedQuickCreateList) !== count($quickCreateList)) {
                $configWriter->set('quickCreateList', array_values($updatedQuickCreateList));
                error_log('IBF Dashboard: Removed IBFUser from quickCreateList');
            }
            
            // Remove from global search
            $globalSearchEntityList = $config->get('globalSearchEntityList', []);
            $updatedGlobalSearchList = array_filter($globalSearchEntityList, function($item) {
                return $item !== 'IBFUser';
            });
            
            if (count($updatedGlobalSearchList) !== count($globalSearchEntityList)) {
                $configWriter->set('globalSearchEntityList', array_values($updatedGlobalSearchList));
                error_log('IBF Dashboard: Removed IBFUser from globalSearchEntityList');
            }
            
            // Save all configuration changes
            $configWriter->save();
            
            // Remove language labels for IBFUser
            try {
                $language = $this->container->get('language');
                $defaultLanguage = $this->container->get('defaultLanguage');
                
                // Remove IBFUser labels
                $defaultLanguage->set('Global', 'scopeNames', 'IBFUser', null);
                $defaultLanguage->set('Global', 'scopeNamesPlural', 'IBFUser', null);
                $defaultLanguage->save();
                
                if ($language->getLanguage() !== $defaultLanguage->getLanguage()) {
                    $language->set('Global', 'scopeNames', 'IBFUser', null);
                    $language->set('Global', 'scopeNamesPlural', 'IBFUser', null);
                    $language->save();
                }
                
                error_log('IBF Dashboard: Removed IBFUser language labels');
                
            } catch (\Exception $e) {
                error_log('IBF Dashboard: Failed to remove IBFUser language labels: ' . $e->getMessage());
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove IBFUser entity: ' . $e->getMessage());
        }
    }

    protected function removeAdministrationSection()
    {
        try {
            error_log('IBF Dashboard: Removing administration section references');
            
            $config = $this->container->get('config');
            
            // Try to get configWriter, fallback to creating it if not available
            try {
                $configWriter = $this->container->get('configWriter');
            } catch (\Exception $e) {
                // Use injectableFactory to create configWriter
                $injectableFactory = $this->container->get('injectableFactory');
                $configWriter = $injectableFactory->create('Espo\\Core\\Utils\\Config\\ConfigWriter');
            }
            
            // Remove any admin panel configurations related to IBF
            // Since we're using adminPanel.json metadata, there's no manual admin items to remove
            // The administration section will be automatically removed when the module is uninstalled
            
            error_log('IBF Dashboard: Administration section cleanup completed');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove administration section: ' . $e->getMessage());
        }
    }

    /**
     * Remove server-side module files (EspoCRM doesn't do this automatically)
     * WARNING: This will permanently delete all IBFDashboard module files
     */
    protected function removeModuleFiles()
    {
        try {
            error_log('IBF Dashboard: Removing server-side module files');
            
            // Get the correct EspoCRM root path using multiple approaches
            $espoCrmRoot = $this->getEspoCrmRootPath();
            
            // Path to the IBFDashboard module directory
            $modulePath = $espoCrmRoot . '/custom/Espo/Modules/IBFDashboard';
            
            if (is_dir($modulePath)) {
                $this->removeDirectoryRecursive($modulePath);
                error_log('IBF Dashboard: Successfully removed module directory: ' . $modulePath);
            } else {
                error_log('IBF Dashboard: Module directory not found: ' . $modulePath);
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove module files: ' . $e->getMessage());
            error_log('IBF Dashboard: Stack trace: ' . $e->getTraceAsString());
        }
    }

    /**
     * Get EspoCRM root path using container services with fallbacks
     */
    protected function getEspoCrmRootPath()
    {
        try {
            // First try: get from config
            $config = $this->container->get('config');
            $rootPath = $config->get('applicationPath');
            if ($rootPath && is_dir($rootPath)) {
                return rtrim($rootPath, '/');
            }
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Could not get root path from config: ' . $e->getMessage());
        }

        // Second try: calculate from current script location
        // This script is in: /path/to/espocrm/data/cache/extensions/temp/scripts/AfterUninstall.php
        // So we need to go up several levels to reach EspoCRM root
        $currentDir = __DIR__;
        $possibleRoot = dirname(dirname(dirname(dirname($currentDir))));
        
        // Verify this is EspoCRM root by checking for key files
        if (is_file($possibleRoot . '/index.php') && is_file($possibleRoot . '/bootstrap.php')) {
            return rtrim($possibleRoot, '/');
        }

        // Third try: use a more generic approach
        $possibleRoot = dirname(dirname(dirname(dirname(dirname($currentDir)))));
        if (is_file($possibleRoot . '/index.php') && is_file($possibleRoot . '/bootstrap.php')) {
            return rtrim($possibleRoot, '/');
        }

        // Final fallback: use relative path
        return realpath(dirname(__DIR__) . '/../../../../..');
    }

    /**
     * Recursively remove a directory and all its contents
     */
    protected function removeDirectoryRecursive($dir)
    {
        if (!is_dir($dir)) {
            return;
        }
        
        $files = array_diff(scandir($dir), ['.', '..']);
        
        foreach ($files as $file) {
            $filePath = $dir . '/' . $file;
            
            if (is_dir($filePath)) {
                $this->removeDirectoryRecursive($filePath);
            } else {
                unlink($filePath);
                error_log('IBF Dashboard: Removed file: ' . $filePath);
            }
        }
        
        rmdir($dir);
        error_log('IBF Dashboard: Removed directory: ' . $dir);
    }

    protected function clearCache()
    {
        try {
            error_log('IBF Dashboard: Clearing cache');
            
            $this->container->get('dataManager')->clearCache();
            
            error_log('IBF Dashboard: Cache cleared successfully');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to clear cache: ' . $e->getMessage());
        }
    }
}

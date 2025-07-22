<?php

class AfterUninstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Remove IBF Dashboard tab from navbar
        $this->removeIBFDashboardTab();
        
        // Remove administration section
        $this->removeAdministrationSection();
        
        // Clear cache to ensure changes take effect
        $this->clearCache();
    }

    protected function removeIBFDashboardTab()
    {
        try {
            $config = $this->container->get('config');
            
            // Get current tab list from application settings
            $tabList = $config->get('tabList', []);
            
            // Remove IBF Dashboard tab if it exists
            $updatedTabList = [];
            foreach ($tabList as $tab) {
                // Skip IBF Dashboard entries
                if ($tab === 'IBFDashboard') {
                    continue;
                }
                $updatedTabList[] = $tab;
            }
            
            // Update the configuration if changes were made
            if (count($updatedTabList) !== count($tabList)) {
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
                
                // Remove tab label from language files
                $this->removeTabLabel();
            }
            
        } catch (\Exception $e) {
            // Log error but don't fail uninstallation
            error_log('IBF Dashboard: Failed to remove tab from navbar: ' . $e->getMessage());
        }
    }

    protected function removeTabLabel()
    {
        try {
            $language = $this->container->get('language');
            $defaultLanguage = $this->container->get('defaultLanguage');
            
            // Remove label from default language by setting it to null
            // Language::set(scope, category, name, value)
            $defaultLanguage->set('Global', 'scopeNames', 'IBFDashboard', null);
            $defaultLanguage->save();
            
            // Remove label from current language if different
            if ($language->getLanguage() !== $defaultLanguage->getLanguage()) {
                $language->set('Global', 'scopeNames', 'IBFDashboard', null);
                $language->save();
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove tab label: ' . $e->getMessage());
        }
    }

    protected function removeAdministrationSection()
    {
        try {
            $config = $this->container->get('config');
            
            // Try to get configWriter, fallback to creating it if not available
            try {
                $configWriter = $this->container->get('configWriter');
            } catch (\Exception $e) {
                // Use injectableFactory to create configWriter
                $injectableFactory = $this->container->get('injectableFactory');
                $configWriter = $injectableFactory->create('Espo\\Core\\Utils\\Config\\ConfigWriter');
            }
            
            // Since we're using adminPanel.json metadata, there's no manual admin items to remove
            // The administration section will be automatically removed when the module is uninstalled
            // Just clear the cache to ensure proper cleanup
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove administration section: ' . $e->getMessage());
        }
    }

    protected function clearCache()
    {
        try {
            $this->container->get('dataManager')->clearCache();
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to clear cache: ' . $e->getMessage());
        }
    }
}

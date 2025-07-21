<?php

class AfterUninstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Remove IBF Dashboard tab from navbar
        $this->removeIBFDashboardTab();
        
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
                // Also check for array format with URL
                if (is_array($tab) && isset($tab['url']) && $tab['url'] === 'https://ibf-pivot-crm.510.global/#IBFDashboard') {
                    continue;
                }
                $updatedTabList[] = $tab;
            }
            
            // Update the configuration if changes were made
            if (count($updatedTabList) !== count($tabList)) {
                $configWriter = $this->container->get('configWriter');
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
            
            // Remove label from default language
            $labelData = $defaultLanguage->get('Global', 'scopeNames') ?: [];
            unset($labelData['IBFDashboard']);
            $defaultLanguage->set('Global', 'scopeNames', $labelData);
            
            // Remove label from current language if different
            if ($language !== $defaultLanguage) {
                $labelData = $language->get('Global', 'scopeNames') ?: [];
                unset($labelData['IBFDashboard']);
                $language->set('Global', 'scopeNames', $labelData);
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to remove tab label: ' . $e->getMessage());
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

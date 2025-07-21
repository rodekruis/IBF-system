<?php

class AfterInstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Add IBF Dashboard tab to navbar
        $this->addIBFDashboardTab();
        
        // Clear cache to ensure changes take effect
        $this->clearCache();
    }

    protected function addIBFDashboardTab()
    {
        try {
            $config = $this->container->get('config');
            $entityManager = $this->container->get('entityManager');
            
            // Get current tab list from application settings
            $tabList = $config->get('tabList', []);
            
            // Check if IBF Dashboard tab already exists
            $ibfTabExists = false;
            foreach ($tabList as $tab) {
                if (is_array($tab) && isset($tab['url']) && $tab['url'] === 'https://ibf-pivot-crm.510.global/#IBFDashboard') {
                    $ibfTabExists = true;
                    break;
                }
                // Also check for simple string format
                if ($tab === 'IBFDashboard') {
                    $ibfTabExists = true;
                    break;
                }
            }
            
            // Add IBF Dashboard tab if it doesn't exist
            if (!$ibfTabExists) {
                // Add the IBF Dashboard tab - EspoCRM will recognize this as a custom controller
                $tabList[] = 'IBFDashboard';
                
                // Update the configuration
                $configWriter = $this->container->get('configWriter');
                $configWriter->set('tabList', $tabList);
                $configWriter->save();
                
                // Also set the tab label in language files
                $this->setTabLabel();
            }
            
        } catch (\Exception $e) {
            // Log error but don't fail installation
            error_log('IBF Dashboard: Failed to add tab to navbar: ' . $e->getMessage());
        }
    }

    protected function setTabLabel()
    {
        try {
            $language = $this->container->get('language');
            $defaultLanguage = $this->container->get('defaultLanguage');
            
            // Set label for default language
            $labelData = $defaultLanguage->get('Global', 'scopeNames') ?: [];
            $labelData['IBFDashboard'] = 'IBF Dashboard';
            $defaultLanguage->set('Global', 'scopeNames', $labelData);
            
            // Set label for current language if different
            if ($language !== $defaultLanguage) {
                $labelData = $language->get('Global', 'scopeNames') ?: [];
                $labelData['IBFDashboard'] = 'IBF Dashboard';
                $language->set('Global', 'scopeNames', $labelData);
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to set tab label: ' . $e->getMessage());
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

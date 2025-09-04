<?php

class AfterInstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;

        // Set default IBF configuration values
        $this->setDefaultIBFConfiguration();

        // Create Anticipatory Action team and role
        $this->createAnticipationTeamAndRole();

        // Add IBF Dashboard tab to navbar
        $this->addIBFDashboardTab();

        // Add administration panel section
        $this->addAdministrationSection();

        // Create map-related database tables
        $this->createMapTables();

        // Clear cache to ensure changes take effect
        $this->clearCache();

        // Sync Early Actions from IBF API
        $this->syncEarlyActionsFromIBF();

        // Rebuild client resources to include custom views
        $this->rebuildClientResources();

        // Note: Database schema will be automatically updated by EspoCRM
        // after installation completes and maintenance mode is lifted
        error_log('IBF Dashboard: Installation completed successfully.');
        error_log('IBF Dashboard: IMPORTANT - Please complete installation by:');
        error_log('IBF Dashboard: 1. Go to Administration > Rebuild to load entity layouts properly');
        error_log('IBF Dashboard: 2. Clear cache if layouts still don\'t appear');
        error_log('IBF Dashboard: 3. Check file permissions on /var/www/html if rebuild fails');
    }

    protected function addIBFDashboardTab()
    {
        try {
            $config = $this->container->get('config');

            // Try to get configWriter, fallback to config if not available
            try {
                $configWriter = $this->container->get('configWriter');
            } catch (\Exception $e) {
                // Use injectableFactory to create configWriter
                $injectableFactory = $this->container->get('injectableFactory');
                $configWriter = $injectableFactory->create('Espo\\Core\\Utils\\Config\\ConfigWriter');
            }

            // Get current tab list from application settings
            $tabList = $config->get('tabList', []);

            // Add essential entity tabs if they don't exist
            $entitiesToAdd = ['IBFDashboard', 'EarlyWarning', 'EarlyAction'];
            $tabsAdded = false;

            foreach ($entitiesToAdd as $entity) {
                if (!in_array($entity, $tabList)) {
                    $tabList[] = $entity;
                    $tabsAdded = true;
                    error_log("IBF Dashboard: Added $entity to navigation tabs");
                }
            }

            if ($tabsAdded) {
                // Update the configuration
                $configWriter->set('tabList', $tabList);
                $configWriter->save();

                // Also set the tab labels in language files
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
            // Get the language manager
            $language = $this->container->get('language');
            $defaultLanguage = $this->container->get('defaultLanguage');

            // Set the scope name for IBFDashboard using the correct 4-parameter method
            // Language::set(scope, category, name, value)
            $defaultLanguage->set('Global', 'scopeNames', 'IBFDashboard', 'IBF Dashboard');
            $defaultLanguage->save();

            // Also set for current language if different
            if ($language->getLanguage() !== $defaultLanguage->getLanguage()) {
                $language->set('Global', 'scopeNames', 'IBFDashboard', 'IBF Dashboard');
                $language->save();
            }

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to set tab label: ' . $e->getMessage());
        }
    }

    protected function addAdministrationSection()
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

            // Since we're using adminPanel.json metadata, we don't need to manually add admin items
            // The administration section will be automatically recognized from metadata
            // Just ensure the metadata is properly loaded by clearing cache

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to add administration section: ' . $e->getMessage());
        }
    }

    protected function clearCache()
    {
        try {
            $dataManager = $this->container->get('dataManager');

            // Clear cache only - avoid rebuild during installation to prevent permission issues
            $dataManager->clearCache();

            // Create a flag file to remind about required rebuild
            file_put_contents(
                'data/cache/application/rebuild-required.flag',
                "IBF Dashboard extension installed. Please run Administration > Rebuild for module layouts to take effect.\n"
            );

            error_log('IBF Dashboard: Cache cleared successfully. Database rebuild skipped during installation to avoid permission issues.');
            error_log('IBF Dashboard: Please manually rebuild the system via Administration > Rebuild after installation to load layouts properly.');

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to clear cache: ' . $e->getMessage());
        }
    }

    protected function rebuildDatabase()
    {
        // Skip database rebuild during installation to avoid maintenance mode issues
        // EspoCRM will automatically handle schema updates for properly defined entities
        // after installation is complete
        try {
            // Just validate that the dataManager is available for post-install operations
            $dataManager = $this->container->get('dataManager');
            error_log('IBF Dashboard: Database schema will be updated automatically by EspoCRM');
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Note - Database schema will be updated on next system rebuild: ' . $e->getMessage());
        }
    }

    protected function createAnticipationTeamAndRole()
    {
        try {
            $entityManager = $this->container->get('entityManager');

            // 1. Create "Anticipatory Action" team if it doesn't exist
            $existingTeam = $entityManager->getRepository('Team')
                ->where(['name' => 'Anticipatory Action'])
                ->findOne();

            if (!$existingTeam) {
                $team = $entityManager->createEntity('Team', [
                    'name' => 'Anticipatory Action',
                    'description' => 'Team for users with access to IBF Dashboard and Anticipatory Action features'
                ]);

                error_log('IBF Dashboard: Created Anticipatory Action team');
            } else {
                $team = $existingTeam;
                error_log('IBF Dashboard: Anticipatory Action team already exists');
            }

            // 2. Create "Anticipatory Action Moderators" team if it doesn't exist
            $existingModeratorTeam = $entityManager->getRepository('Team')
                ->where(['name' => 'Anticipatory Action Moderators'])
                ->findOne();

            if (!$existingModeratorTeam) {
                $moderatorTeam = $entityManager->createEntity('Team', [
                    'name' => 'Anticipatory Action Moderators',
                    'description' => 'Team for users who can manage IBF Users and moderate IBF Dashboard access'
                ]);

                error_log('IBF Dashboard: Created Anticipatory Action Moderators team');
            } else {
                $moderatorTeam = $existingModeratorTeam;
                error_log('IBF Dashboard: Anticipatory Action Moderators team already exists');
            }

            // 3. Create "IBF Dashboard Access" role if it doesn't exist
            $existingRole = $entityManager->getRepository('Role')
                ->where(['name' => 'IBF Dashboard Access'])
                ->findOne();

            if (!$existingRole) {
                $role = $entityManager->createEntity('Role', [
                    'name' => 'IBF Dashboard Access',
                    'description' => 'Role granting access to IBF Dashboard and related entities',
                    'data' => [
                        // IBF Dashboard scope permissions
                        'IBFDashboard' => [
                            'create' => 'no',
                            'read' => 'yes',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'no'
                        ],
                        // IBF User management (team level access)
                        'IBFUser' => [
                            'create' => 'no',
                            'read' => 'team',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'no'
                        ],
                        // Early Warning entities (read access for team members)
                        'EarlyWarning' => [
                            'create' => 'no',
                            'read' => 'team',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'no'
                        ],
                        // Early Action entities (read access for team members)
                        'EarlyAction' => [
                            'create' => 'no',
                            'read' => 'team',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'no'
                        ],
                        // Allow access to own user record
                        'User' => [
                            'create' => 'no',
                            'read' => 'own',
                            'edit' => 'own',
                            'delete' => 'no',
                            'stream' => 'no'
                        ]
                    ]
                ]);

                error_log('IBF Dashboard: Created IBF Dashboard Access role');
            } else {
                $role = $existingRole;
                error_log('IBF Dashboard: IBF Dashboard Access role already exists');
            }

            // 4. Create "IBF User Moderator" role if it doesn't exist
            $existingModeratorRole = $entityManager->getRepository('Role')
                ->where(['name' => 'IBF User Moderator'])
                ->findOne();

            if (!$existingModeratorRole) {
                $moderatorRole = $entityManager->createEntity('Role', [
                    'name' => 'IBF User Moderator',
                    'description' => 'Role granting full management access to IBF Users (except password fields)',
                    'data' => [
                        // IBF Dashboard scope permissions
                        'IBFDashboard' => [
                            'create' => 'no',
                            'read' => 'yes',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'no'
                        ],
                        // IBF User management (full CRUD access)
                        'IBFUser' => [
                            'create' => 'yes',
                            'read' => 'all',
                            'edit' => 'all',
                            'delete' => 'yes',
                            'stream' => 'yes'
                        ],
                        // Early Warning entities (full CRUD access for moderators)
                        'EarlyWarning' => [
                            'create' => 'yes',
                            'read' => 'all',
                            'edit' => 'all',
                            'delete' => 'yes',
                            'stream' => 'yes'
                        ],
                        // Early Action entities (full CRUD access for moderators)
                        'EarlyAction' => [
                            'create' => 'yes',
                            'read' => 'all',
                            'edit' => 'all',
                            'delete' => 'yes',
                            'stream' => 'yes'
                        ],
                        // Allow access to own user record
                        'User' => [
                            'create' => 'no',
                            'read' => 'own',
                            'edit' => 'own',
                            'delete' => 'no',
                            'stream' => 'no'
                        ]
                    ]
                ]);

                error_log('IBF Dashboard: Created IBF User Moderator role');
            } else {
                $moderatorRole = $existingModeratorRole;
                error_log('IBF Dashboard: IBF User Moderator role already exists');
            }

            // 5. Assign "IBF Dashboard Access" role to "Anticipatory Action" team
            if ($team && $role) {
                $teamRoleRelation = $entityManager->getRepository('Team')
                    ->getRelation($team, 'roles')
                    ->where(['id' => $role->get('id')])
                    ->findOne();

                if (!$teamRoleRelation) {
                    $entityManager->getRepository('Team')
                        ->getRelation($team, 'roles')
                        ->relate($role);

                    error_log('IBF Dashboard: Assigned IBF Dashboard Access role to Anticipatory Action team');
                }
            }

            // 6. Assign "IBF User Moderator" role to "Anticipatory Action Moderators" team
            if ($moderatorTeam && $moderatorRole) {
                $moderatorTeamRoleRelation = $entityManager->getRepository('Team')
                    ->getRelation($moderatorTeam, 'roles')
                    ->where(['id' => $moderatorRole->get('id')])
                    ->findOne();

                if (!$moderatorTeamRoleRelation) {
                    $entityManager->getRepository('Team')
                        ->getRelation($moderatorTeam, 'roles')
                        ->relate($moderatorRole);

                    error_log('IBF Dashboard: Assigned IBF User Moderator role to Anticipatory Action Moderators team');
                }
            }

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to create team and role: ' . $e->getMessage());
        }
    }

    protected function setDefaultIBFConfiguration()
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

            $needsSave = false;

            // Set default IBF Backend API URL if not already configured
            if (!$config->get('ibfBackendApiUrl')) {
                $configWriter->set('ibfBackendApiUrl', 'https://ibf-pivot.510.global/api');
                $needsSave = true;
                error_log('IBF Dashboard: Set default IBF Backend API URL');
            }

            // Set default Geoserver URL if not already configured
            if (!$config->get('ibfGeoserverUrl')) {
                $configWriter->set('ibfGeoserverUrl', 'https://ibf.510.global/geoserver/ibf-system/wms');
                $needsSave = true;
                error_log('IBF Dashboard: Set default Geoserver URL');
            }

            // Set default dashboard URL if not already configured
            if (!$config->get('ibfDashboardUrl')) {
                $configWriter->set('ibfDashboardUrl', 'https://ibf-pivot.510.global');
                $needsSave = true;
                error_log('IBF Dashboard: Set default dashboard URL');
            }

            // Set default enabled countries if not already configured
            if (!$config->get('ibfEnabledCountries')) {
                $configWriter->set('ibfEnabledCountries', ['ETH', 'UGA', 'ZMB', 'KEN']);
                $needsSave = true;
                error_log('IBF Dashboard: Set default enabled countries');
            }

            // Set default disaster types if not already configured
            if (!$config->get('ibfDisasterTypes')) {
                $configWriter->set('ibfDisasterTypes', ['drought', 'floods', 'heavy-rainfall']);
                $needsSave = true;
                error_log('IBF Dashboard: Set default disaster types');
            }

            // Set default country if not already configured
            if (!$config->get('ibfDefaultCountry')) {
                $configWriter->set('ibfDefaultCountry', 'ETH');
                $needsSave = true;
                error_log('IBF Dashboard: Set default country');
            }

            // Set default user settings if not already configured
            if (!$config->has('ibfAutoCreateUsers')) {
                $configWriter->set('ibfAutoCreateUsers', true);
                $needsSave = true;
                error_log('IBF Dashboard: Set default auto-create users setting');
            }

            if (!$config->has('ibfRequireUserMapping')) {
                $configWriter->set('ibfRequireUserMapping', false);
                $needsSave = true;
                error_log('IBF Dashboard: Set default require user mapping setting');
            }

            if ($needsSave) {
                $configWriter->save();
                error_log('IBF Dashboard: Default configuration values saved successfully');
            } else {
                error_log('IBF Dashboard: All configuration values already set, no changes needed');
            }

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to set default configuration: ' . $e->getMessage());
        }
    }

    protected function createMapTables()
    {
        try {
            $entityManager = $this->container->get('entityManager');
            $pdo = $entityManager->getPDO();

            // Create region_geometry table for storing shapefile data
            $createTableQuery = "
                CREATE TABLE IF NOT EXISTS region_geometry (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    pcode VARCHAR(255) UNIQUE NOT NULL,
                    geometry_data LONGTEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    INDEX idx_pcode (pcode)
                ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            ";

            $pdo->exec($createTableQuery);
            error_log('IBF Dashboard: Created region_geometry table for map data');

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to create map tables: ' . $e->getMessage());
        }
    }

    /**
     * Sync Early Actions from IBF API during installation
     */
    protected function syncEarlyActionsFromIBF()
    {
        try {
            error_log('IBF Dashboard: Starting Early Actions sync from IBF API...');

            // Get required dependencies from container
            $entityManager = $this->container->get('entityManager');
            $config = $this->container->get('config');
            $log = $this->container->get('log');

            // Manually create the sync service with dependencies
            $syncService = new \Espo\Modules\IBFDashboard\Services\EarlyActionSync();
            $syncService->inject('entityManager', $entityManager);
            $syncService->inject('config', $config);
            $syncService->inject('log', $log);

            // Perform the sync
            $result = $syncService->syncAllEarlyActions();

            if ($result['success']) {
                error_log('IBF Dashboard: Early Actions sync completed successfully - ' . $result['message']);
            } else {
                error_log('IBF Dashboard: Early Actions sync failed - ' . $result['message']);
                if (!empty($result['errors'])) {
                    foreach ($result['errors'] as $error) {
                        error_log('IBF Dashboard: Sync error - ' . $error);
                    }
                }
            }

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Exception during Early Actions sync: ' . $e->getMessage());
            error_log('IBF Dashboard: Early Actions sync will be skipped during installation. You can manually trigger it later from the admin panel.');
        }
    }

    /**
     * Rebuild client resources to include custom views
     */
    protected function rebuildClientResources()
    {
        try {
            error_log('IBF Dashboard: Rebuilding client resources for custom views...');

            $dataManager = $this->container->get('dataManager');

            // Clear and rebuild client cache to include our custom JavaScript files
            $dataManager->clearCache();
            $dataManager->rebuild(['clientDefs', 'metadata']);

            error_log('IBF Dashboard: Client resources rebuilt successfully');

        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to rebuild client resources: ' . $e->getMessage());
        }
    }
}

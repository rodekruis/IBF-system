<?php

class AfterInstall
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Rebuild database schema to ensure IBFUser table has correct fields
        $this->rebuildDatabase();
        
        // Create Anticipatory Action team and role
        $this->createAnticipationTeamAndRole();
        
        // Add IBF Dashboard tab to navbar
        $this->addIBFDashboardTab();
        
        // Add administration panel section
        $this->addAdministrationSection();
        
        // Clear cache to ensure changes take effect
        $this->clearCache();
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
            
            // Check if IBF Dashboard tab already exists
            if (!in_array('IBFDashboard', $tabList)) {
                // Add the IBF Dashboard tab - EspoCRM will recognize this as a custom controller
                $tabList[] = 'IBFDashboard';
                
                // Update the configuration
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
            $this->container->get('dataManager')->clearCache();
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to clear cache: ' . $e->getMessage());
        }
    }

    protected function rebuildDatabase()
    {
        try {
            // Get schema manager to rebuild database tables
            $schemaManager = $this->container->get('schemaManager');
            
            // Rebuild the IBFUser entity to ensure proper table structure
            $schemaManager->rebuildDatabase(['IBFUser']);
            
            error_log('IBF Dashboard: Database schema rebuilt for IBFUser entity');
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to rebuild database schema: ' . $e->getMessage());
            // Try alternative method
            try {
                $dataManager = $this->container->get('dataManager');
                $dataManager->rebuild(['IBFUser']);
                error_log('IBF Dashboard: Database rebuilt using dataManager');
            } catch (\Exception $e2) {
                error_log('IBF Dashboard: Failed alternative database rebuild: ' . $e2->getMessage());
            }
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
}

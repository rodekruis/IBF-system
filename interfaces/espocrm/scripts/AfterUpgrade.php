<?php

class AfterUpgrade
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Fix IBFUser table schema if needed
        $this->fixIBFUserTableSchema();
        
        // Ensure EarlyWarning and EarlyAction tables exist and are up to date
        $this->ensureEarlyWarningTableSchema();
        $this->ensureEarlyActionTableSchema();
        
        // Ensure all IBFUsers are assigned to Anticipatory Action team
        $this->ensureIBFUsersInAnticipationTeam();
        
        // Ensure Anticipatory Action team has proper permissions
        $this->ensureAnticipationTeamPermissions();
        
        // Create backup of existing entity data before major changes
        $this->backupEntityDataIfNeeded();
        
        // Update custom entities if schema version changed
        $this->updateCustomEntitiesIfNeeded();
        
        // Force metadata rebuild after updates
        $this->rebuildMetadataAfterUpgrade();
        
        // Ensure entity tabs are added to navigation
        $this->addEntityTabsToNavigation();
        
        // Sync Early Actions from IBF API (for new/updated actions)
        $this->syncEarlyActionsFromIBF();
    }

    protected function fixIBFUserTableSchema()
    {
        try {
            $entityManager = $this->container->get('entityManager');
            
            // Try to get schema manager, but handle gracefully if not available
            try {
                $schemaManager = $this->container->get('schemaManager');
            } catch (\Exception $e) {
                error_log('IBF Dashboard: Schema manager not available during upgrade, skipping table check: ' . $e->getMessage());
                return;
            }
            
            // Check if IBFUser table exists
            if (!$schemaManager->hasTable('i_b_f_user')) {
                // Table doesn't exist, let EspoCRM create it
                error_log('IBF Dashboard: IBFUser table does not exist, will be created by schema rebuild');
                return;
            }
            
            // Get current table schema
            $connection = $entityManager->getPDO();
            $columns = $connection->query("DESCRIBE i_b_f_user")->fetchAll(PDO::FETCH_COLUMN);
            
            $missingColumns = [];
            $requiredColumns = ['email', 'password', 'allowed_countries', 'allowed_disaster_types', 'is_active', 'last_ibf_login', 'ibf_token', 'auto_created'];
            
            foreach ($requiredColumns as $column) {
                if (!in_array($column, $columns)) {
                    $missingColumns[] = $column;
                }
            }
            
            if (empty($missingColumns)) {
                error_log('IBF Dashboard: IBFUser table schema is up to date');
                return;
            }
            
            error_log('IBF Dashboard: Adding missing columns to IBFUser table: ' . implode(', ', $missingColumns));
            
            // Add missing columns
            foreach ($missingColumns as $column) {
                switch ($column) {
                    case 'email':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN email VARCHAR(100) NULL");
                        break;
                    case 'password':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN password VARCHAR(150) NULL");
                        break;
                    case 'allowed_countries':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN allowed_countries LONGTEXT NULL");
                        break;
                    case 'allowed_disaster_types':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN allowed_disaster_types LONGTEXT NULL");
                        break;
                    case 'is_active':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN is_active TINYINT(1) DEFAULT 1");
                        break;
                    case 'last_ibf_login':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN last_ibf_login DATETIME NULL");
                        break;
                    case 'ibf_token':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN ibf_token LONGTEXT NULL");
                        break;
                    case 'auto_created':
                        $connection->exec("ALTER TABLE i_b_f_user ADD COLUMN auto_created TINYINT(1) DEFAULT 0");
                        break;
                }
            }
            
            error_log('IBF Dashboard: Successfully updated IBFUser table schema');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to fix IBFUser table schema: ' . $e->getMessage());
            
            // If we can't fix the schema, drop and recreate the table
            try {
                error_log('IBF Dashboard: Attempting to drop and recreate IBFUser table');
                $connection = $entityManager->getPDO();
                $connection->exec("DROP TABLE IF EXISTS i_b_f_user");
                error_log('IBF Dashboard: Dropped IBFUser table, will be recreated by schema rebuild');
                
            } catch (\Exception $e2) {
                error_log('IBF Dashboard: Failed to drop IBFUser table: ' . $e2->getMessage());
            }
        }
    }
    
    protected function ensureEarlyWarningTableSchema()
    {
        try {
            $entityManager = $this->container->get('entityManager');
            $connection = $entityManager->getPDO();
            
            // Check if EarlyWarning table exists
            $result = $connection->query("SHOW TABLES LIKE 'early_warning'")->fetchAll();
            
            if (empty($result)) {
                error_log('IBF Dashboard: EarlyWarning table does not exist, will be created by schema rebuild');
                return;
            }
            
            error_log('IBF Dashboard: EarlyWarning table exists, preserving existing data');
            
            // Get existing record count
            $count = $connection->query("SELECT COUNT(*) FROM early_warning")->fetchColumn();
            error_log("IBF Dashboard: Found $count existing EarlyWarning records");
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error checking EarlyWarning table: ' . $e->getMessage());
        }
    }
    
    protected function ensureEarlyActionTableSchema()
    {
        try {
            $entityManager = $this->container->get('entityManager');
            $connection = $entityManager->getPDO();
            
            // Check if EarlyAction table exists
            $result = $connection->query("SHOW TABLES LIKE 'early_action'")->fetchAll();
            
            if (empty($result)) {
                error_log('IBF Dashboard: EarlyAction table does not exist, will be created by schema rebuild');
                return;
            }
            
            error_log('IBF Dashboard: EarlyAction table exists, preserving existing data');
            
            // Get existing record count
            $count = $connection->query("SELECT COUNT(*) FROM early_action")->fetchColumn();
            error_log("IBF Dashboard: Found $count existing EarlyAction records");
            
            // Check for relationship table
            $relationResult = $connection->query("SHOW TABLES LIKE 'early_warning_early_action'")->fetchAll();
            if (!empty($relationResult)) {
                $relationCount = $connection->query("SELECT COUNT(*) FROM early_warning_early_action")->fetchColumn();
                error_log("IBF Dashboard: Found $relationCount existing EarlyWarning-EarlyAction relationships");
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error checking EarlyAction table: ' . $e->getMessage());
        }
    }
    
    protected function backupEntityDataIfNeeded()
    {
        try {
            $config = $this->container->get('config');
            $currentVersion = $config->get('ibfEntitySchemaVersion', '0.0.0');
            
            // Only create backup if this is a major version change
            if (version_compare($currentVersion, '1.0.0', '<')) {
                error_log('IBF Dashboard: Creating backup of existing entity data before upgrade');
                
                $entityManager = $this->container->get('entityManager');
                $connection = $entityManager->getPDO();
                
                // Create backup tables for existing data
                $tables = ['early_warning', 'early_action', 'early_warning_early_action'];
                
                foreach ($tables as $table) {
                    $result = $connection->query("SHOW TABLES LIKE '$table'")->fetchAll();
                    if (!empty($result)) {
                        $backupTableName = $table . '_backup_' . date('Y_m_d_H_i_s');
                        $connection->exec("CREATE TABLE $backupTableName AS SELECT * FROM $table");
                        error_log("IBF Dashboard: Created backup table: $backupTableName");
                    }
                }
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error creating entity data backup: ' . $e->getMessage());
        }
    }
    
    protected function updateCustomEntitiesIfNeeded()
    {
        try {
            $config = $this->container->get('config');
            
            // Get current entity schema version
            $currentVersion = $config->get('ibfEntitySchemaVersion', '0.0.0');
            $targetVersion = '1.2.0'; // Updated for EarlyWarning/EarlyAction entities with URL filtering
            
            if (version_compare($currentVersion, $targetVersion, '<')) {
                error_log("IBF Dashboard: Updating entity schema from $currentVersion to $targetVersion");
                
                // Update entity schema version
                try {
                    $configWriter = $this->container->get('configWriter');
                    $configWriter->set('ibfEntitySchemaVersion', $targetVersion);
                    $configWriter->save();
                    
                    error_log('IBF Dashboard: Entity schema version updated successfully');
                } catch (\Exception $e) {
                    error_log('IBF Dashboard: Could not update entity schema version: ' . $e->getMessage());
                }
            } else {
                error_log('IBF Dashboard: Entity schema is up to date');
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error checking entity schema version: ' . $e->getMessage());
        }
    }
    
    protected function rebuildMetadataAfterUpgrade()
    {
        try {
            // Force metadata and database schema rebuild
            $dataManager = $this->container->get('dataManager');
            $dataManager->rebuild(['entityDefs', 'metadata', 'clientDefs']);
            
            error_log('IBF Dashboard: Metadata and client resources rebuilt after upgrade');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error rebuilding metadata after upgrade: ' . $e->getMessage());
        }
    }
    
    protected function syncEarlyActionsFromIBF()
    {
        try {
            error_log('IBF Dashboard: Starting Early Action sync during upgrade');
            
            // Create an instance of the EarlyActionSync service
            $syncService = new \Espo\Modules\IBFDashboard\Services\EarlyActionSync();
            $syncService->setContainer($this->container);
            
            // Sync all early actions from IBF API
            $result = $syncService->syncAllEarlyActions();
            
            if ($result && isset($result['success']) && $result['success']) {
                error_log('IBF Dashboard: Early Action sync completed successfully during upgrade');
                if (isset($result['stats'])) {
                    error_log('IBF Dashboard: Sync stats: ' . json_encode($result['stats']));
                }
            } else {
                error_log('IBF Dashboard: Early Action sync failed during upgrade: ' . ($result['error'] ?? 'Unknown error'));
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error during Early Action sync: ' . $e->getMessage());
        }
    }
    
    protected function addEntityTabsToNavigation()
    {
        try {
            $config = $this->container->get('config');
            $configWriter = $this->container->get('configWriter');
            
            // Get current tab list from application settings
            $tabList = $config->get('tabList', []);
            
            // Add essential entity tabs if they don't exist
            $entitiesToAdd = ['EarlyWarning', 'EarlyAction'];
            $tabsAdded = false;
            
            foreach ($entitiesToAdd as $entity) {
                if (!in_array($entity, $tabList)) {
                    $tabList[] = $entity;
                    $tabsAdded = true;
                    error_log("IBF Dashboard: Added $entity to navigation tabs during upgrade");
                }
            }
            
            if ($tabsAdded) {
                // Update the configuration
                $configWriter->set('tabList', $tabList);
                $configWriter->save();
                error_log('IBF Dashboard: Navigation tabs updated successfully');
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error adding entity tabs to navigation: ' . $e->getMessage());
        }
    }
    
    protected function ensureIBFUsersInAnticipationTeam()
    {
        try {
            $entityManager = $this->container->get('entityManager');
            
            // Get the Anticipatory Action team
            $anticipationTeam = $entityManager->getRepository('Team')
                ->where(['name' => 'Anticipatory Action'])
                ->findOne();
                
            if (!$anticipationTeam) {
                error_log('IBF Dashboard: Anticipatory Action team not found during upgrade');
                return;
            }
            
            // Get all IBFUser records
            $ibfUsers = $entityManager->getRepository('IBFUser')->find();
            
            if (empty($ibfUsers)) {
                error_log('IBF Dashboard: No IBFUsers found, nothing to assign to team');
                return;
            }
            
            $usersAdded = 0;
            
            foreach ($ibfUsers as $ibfUser) {
                $userId = $ibfUser->get('userId');
                
                if (!$userId) {
                    error_log('IBF Dashboard: IBFUser missing userId, skipping: ' . $ibfUser->get('id'));
                    continue;
                }
                
                // Check if user exists in system
                $user = $entityManager->getEntityById('User', $userId);
                if (!$user) {
                    error_log('IBF Dashboard: User not found for IBFUser: ' . $userId);
                    continue;
                }
                
                // Check if user is already in the team
                $existingTeamUser = $entityManager->getRepository('TeamUser')
                    ->where([
                        'teamId' => $anticipationTeam->get('id'),
                        'userId' => $userId
                    ])
                    ->findOne();
                    
                if (!$existingTeamUser) {
                    // Add user to team
                    $teamUser = $entityManager->createEntity('TeamUser', [
                        'teamId' => $anticipationTeam->get('id'),
                        'userId' => $userId
                    ]);
                    
                    if ($teamUser) {
                        $usersAdded++;
                        error_log('IBF Dashboard: Added user ' . $user->get('emailAddress') . ' to Anticipatory Action team');
                    }
                }
            }
            
            if ($usersAdded > 0) {
                error_log("IBF Dashboard: Added $usersAdded IBFUsers to Anticipatory Action team during upgrade");
            } else {
                error_log('IBF Dashboard: All IBFUsers were already in Anticipatory Action team');
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to ensure IBFUsers in Anticipatory Action team: ' . $e->getMessage());
        }
    }
    
    protected function ensureAnticipationTeamPermissions()
    {
        try {
            $entityManager = $this->container->get('entityManager');
            
            // Get the Anticipatory Action team
            $anticipationTeam = $entityManager->getRepository('Team')
                ->where(['name' => 'Anticipatory Action'])
                ->findOne();
                
            if (!$anticipationTeam) {
                error_log('IBF Dashboard: Anticipatory Action team not found during upgrade');
                return;
            }
            
            // Get or create the IBF Dashboard Access role
            $role = $entityManager->getRepository('Role')
                ->where(['name' => 'IBF Dashboard Access'])
                ->findOne();
                
            if (!$role) {
                // Create the role with updated permissions
                $role = $entityManager->createEntity('Role', [
                    'name' => 'IBF Dashboard Access',
                    'description' => 'Role granting access to IBF Dashboard and related entities including EarlyWarning and EarlyAction',
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
                            'read' => 'all',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'all'
                        ],
                        // Early Action entities (read access for team members)
                        'EarlyAction' => [
                            'create' => 'no',
                            'read' => 'all',
                            'edit' => 'no',
                            'delete' => 'no',
                            'stream' => 'al'
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
                
                error_log('IBF Dashboard: Created IBF Dashboard Access role with EarlyWarning/EarlyAction permissions');
            } else {
                // Update existing role to include new permissions
                $roleData = $role->get('data') ?: [];
                
                // Add EarlyWarning permissions if missing
                if (!isset($roleData['EarlyWarning'])) {
                    $roleData['EarlyWarning'] = [
                        'create' => 'no',
                        'read' => 'team',
                        'edit' => 'no',
                        'delete' => 'no',
                        'stream' => 'all'
                    ];
                }
                
                // Add EarlyAction permissions if missing
                if (!isset($roleData['EarlyAction'])) {
                    $roleData['EarlyAction'] = [
                        'create' => 'no',
                        'read' => 'team',
                        'edit' => 'no',
                        'delete' => 'no',
                        'stream' => 'all'
                    ];
                }
                
                // Update the role
                $entityManager->saveEntity($role->set('data', $roleData));
                error_log('IBF Dashboard: Updated IBF Dashboard Access role with EarlyWarning/EarlyAction permissions');
            }
            
            // Ensure the role is assigned to the team
            $teamRoleRelation = $entityManager->getRepository('Team')
                ->getRelation($anticipationTeam, 'roles')
                ->where(['id' => $role->get('id')])
                ->findOne();
                
            if (!$teamRoleRelation) {
                $entityManager->getRepository('Team')
                    ->getRelation($anticipationTeam, 'roles')
                    ->relate($role);
                    
                error_log('IBF Dashboard: Assigned updated IBF Dashboard Access role to Anticipatory Action team');
            }
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Failed to ensure Anticipatory Action team permissions: ' . $e->getMessage());
        }
    }
}

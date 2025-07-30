<?php

class AfterUpgrade
{
    protected $container;

    public function run($container)
    {
        $this->container = $container;
        
        // Fix IBFUser table schema if needed
        $this->fixIBFUserTableSchema();
        
        // Update custom entities if schema version changed
        $this->updateCustomEntitiesIfNeeded();
        
        // Force metadata rebuild after updates
        $this->rebuildMetadataAfterUpgrade();
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
    
    protected function updateCustomEntitiesIfNeeded()
    {
        try {
            $config = $this->container->get('config');
            
            // Get current entity schema version
            $currentVersion = $config->get('ibfEntitySchemaVersion', '0.0.0');
            $targetVersion = '1.0.141'; // Update this when you change entity definitions
            
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
            $dataManager->rebuild(['entityDefs', 'metadata']);
            
            error_log('IBF Dashboard: Metadata rebuilt after upgrade');
            
        } catch (\Exception $e) {
            error_log('IBF Dashboard: Error rebuilding metadata after upgrade: ' . $e->getMessage());
        }
    }
}

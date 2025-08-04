# EspoCRM Entity Upgrade Guide

## How EspoCRM Handles Entity Upgrades

### Overview
When upgrading an EspoCRM extension with entity changes, the system:
1. Compares old vs new entity metadata
2. Updates database schema based on changes
3. May drop/recreate tables for significant field type changes
4. **Risk**: Existing data can be lost without proper upgrade scripts

## Safe Upgrade Strategy

### 1. Upgrade Scripts Protection
Our `AfterUpgrade.php` script provides:
- **Data Preservation**: Checks for existing tables before changes
- **Schema Validation**: Ensures all required columns exist
- **Backup Creation**: Creates backup tables for major version changes
- **Version Tracking**: Tracks entity schema versions to avoid redundant operations

### 2. Entity Schema Versioning
- Current version: `1.1.0` (includes EarlyWarning/EarlyAction entities)
- Previous version: `1.0.141` (IBFUser only)
- Version stored in: `config.ibfEntitySchemaVersion`

### 3. What Happens During Upgrade

#### New Installation:
```
1. Extension installs → AfterInstall.php runs
2. Entities created fresh → No data to preserve
3. Schema version set to current
```

#### Existing Installation Upgrade:
```
1. Extension upgrades → AfterUpgrade.php runs
2. Checks existing tables and data
3. Creates backups if major version change
4. Safely adds new fields/entities
5. Preserves existing records
6. Updates schema version
```

## Entity Types and Risks

### Standard Entities (EarlyWarning, EarlyAction)
- **Low Risk**: Standard field types (VARCHAR, TEXT, DATETIME, ENUM)
- **Upgrade Safe**: EspoCRM handles these changes gracefully
- **Data Preserved**: Our upgrade script ensures data safety

### Custom Field Changes
- **Medium Risk**: Changing field types (e.g., VARCHAR to TEXT)
- **High Risk**: Removing fields, changing field names
- **Mitigation**: Always backup before field type changes

### Relationship Changes
- **Low Risk**: Adding new relationships
- **High Risk**: Changing existing relationship types
- **Tables Affected**: Junction tables (e.g., `early_warning_early_action`)

## Best Practices

### Before Making Entity Changes:
1. **Test First**: Always test changes on development instance
2. **Version Bump**: Update version in `AfterUpgrade.php` 
3. **Document Changes**: Note what fields/relationships changed
4. **Backup Strategy**: Major changes should trigger backups

### Safe Entity Modifications:
```php
// ✅ SAFE: Adding new fields
"newField": {
    "type": "varchar",
    "required": false,  // Always start as optional
    "maxLength": 255
}

// ✅ SAFE: Adding new optional relationships
"newRelation": {
    "type": "belongsTo",
    "entity": "SomeEntity",
    "required": false
}

// ⚠️ RISKY: Changing field types
"existingField": {
    "type": "text",  // Changed from "varchar"
    "required": true
}

// ❌ DANGEROUS: Removing fields
// Don't remove fields in entity definitions
// Mark as deprecated instead
```

### Production Deployment Checklist:
- [ ] Test upgrade on staging environment
- [ ] Verify existing data preserved
- [ ] Check entity URLs work (e.g., `/#EarlyWarning`)
- [ ] Confirm relationships intact
- [ ] Test sync functionality
- [ ] Monitor upgrade logs for errors

## Troubleshooting

### Entity URLs Return 404
**Symptoms**: `https://domain/#EarlyWarning` returns 404
**Causes**:
- Invalid `clientDefs` configuration
- Missing entity in metadata
- Cache not cleared after upgrade

**Solutions**:
1. Check `clientDefs/EntityName.json` has proper format:
   ```json
   {
     "iconClass": "fas fa-icon",
     "color": "#color"
   }
   ```
2. Clear cache: Administration → Clear Cache
3. Rebuild metadata: Administration → Rebuild

### Data Loss After Upgrade
**Prevention**:
- Our `AfterUpgrade.php` creates automatic backups
- Backup files: `table_name_backup_YYYY_MM_DD_HH_MM_SS`

**Recovery**:
```sql
-- Restore from backup if needed
DROP TABLE current_table;
RENAME TABLE table_name_backup_2024_01_01_12_00_00 TO current_table;
```

### Schema Conflicts
**Symptoms**: Extension won't install/upgrade
**Solutions**:
1. Check logs: `data/logs/espo.log`
2. Manually fix schema conflicts
3. Use `manual-cleanup.php` for complex issues

## Current Entity Status

### EarlyWarning Entity
- **Table**: `early_warning`
- **Status**: ✅ Configured for safe upgrades
- **Fields**: name, eventName, countryCodeISO3, disasterType, etc.
- **Relationships**: hasMany EarlyAction

### EarlyAction Entity  
- **Table**: `early_action`
- **Status**: ✅ Configured for safe upgrades
- **Fields**: name, description, earlyWarningId, etc.
- **Relationships**: belongsTo EarlyWarning

### IBFUser Entity
- **Table**: `i_b_f_user`
- **Status**: ✅ Protected with custom schema fixes
- **Legacy Support**: Handles existing installations

## Monitoring Upgrades

### Log Files to Check:
- `data/logs/espo.log` - General EspoCRM logs
- PHP error logs - Extension-specific errors
- Our custom logs - Search for "IBF Dashboard:" messages

### Success Indicators:
```
IBF Dashboard: EarlyWarning table exists, preserving existing data
IBF Dashboard: Found 15 existing EarlyWarning records
IBF Dashboard: Entity schema version updated successfully
IBF Dashboard: Metadata rebuilt after upgrade
```

## Version History
- `1.1.0`: Added EarlyWarning and EarlyAction entities with relationship
- `1.0.141`: IBFUser entity with authentication features
- `1.0.0`: Initial IBF Dashboard extension

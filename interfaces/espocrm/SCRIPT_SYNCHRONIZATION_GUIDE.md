# EspoCRM Extension Script Patterns

## AfterInstall.php vs AfterUpgrade.php Synchronization Guide

### When to Update Both Scripts

#### ✅ **Always Update Both:**
1. **New Entities Added**: 
   - AfterInstall: Entity creation logic
   - AfterUpgrade: Entity detection and preservation logic

2. **Field Type Changes**:
   - AfterInstall: New field definitions  
   - AfterUpgrade: Migration logic for existing data

3. **Version Bumps**:
   - Both scripts need updated target version numbers

4. **New Services/Sync Logic**:
   - AfterInstall: Initial sync
   - AfterUpgrade: Update sync (preserve existing data)

#### ⚠️ **Sometimes Update Both:**
- Configuration changes that affect existing installations
- Optional field additions (usually safe, but be cautious)
- New relationships between entities

#### ❌ **Rarely Update Both:**
- Metadata-only changes (labels, icons, colors)
- Layout modifications
- Translation updates

### **Current Pattern (v1.1.0):**

#### AfterInstall.php:
```php
// Fresh installation setup
1. setDefaultIBFConfiguration()
2. createAnticipationTeamAndRole() 
3. addIBFDashboardTab()
4. addAdministrationSection()
5. createMapTables()
6. clearCache()
7. syncEarlyActionsFromIBF()  // Initial sync
```

#### AfterUpgrade.php:
```php
// Existing installation upgrade
1. fixIBFUserTableSchema()           // Legacy compatibility
2. ensureEarlyWarningTableSchema()   // New entity safety
3. ensureEarlyActionTableSchema()    // New entity safety
4. backupEntityDataIfNeeded()        // Data protection
5. updateCustomEntitiesIfNeeded()    // Version tracking
6. rebuildMetadataAfterUpgrade()     // Schema refresh
7. syncEarlyActionsFromIBF()         // Update sync
```

### **Checklist for Script Updates:**

#### When Adding New Entity:
- [ ] Add entity definition files
- [ ] Update AfterInstall.php (if needed for initial setup)
- [ ] Add detection logic to AfterUpgrade.php
- [ ] Update version number in AfterUpgrade.php
- [ ] Test on fresh installation
- [ ] Test on existing installation with data
- [ ] Document changes in ENTITY_UPGRADE_GUIDE.md

#### When Changing Existing Entity:
- [ ] Backup existing entity definitions
- [ ] Update entity definition files
- [ ] Add migration logic to AfterUpgrade.php (if field types change)
- [ ] Update version number
- [ ] Test data preservation
- [ ] Document breaking changes

### **Version Management Strategy:**

```php
// Use semantic versioning for entity schema
'1.0.0' // Initial IBFUser
'1.1.0' // Added EarlyWarning/EarlyAction
'1.2.0' // Next major change
'1.1.1' // Minor field addition
```

### **Common Mistakes to Avoid:**

1. **Forgetting to update AfterUpgrade.php** when adding entities
2. **Not testing upgrades** on installations with existing data  
3. **Changing field types** without migration logic
4. **Missing version bumps** causing redundant operations
5. **Not logging operations** for debugging
6. **Removing fields** instead of deprecating them

### **Testing Strategy:**

#### Fresh Installation Test:
```bash
1. Install extension
2. Check entities are created
3. Verify initial sync works
4. Check all URLs work (e.g., /#EarlyWarning)
```

#### Upgrade Test:
```bash
1. Install older version
2. Create test data
3. Upgrade to new version
4. Verify data preserved
5. Check new features work
6. Review upgrade logs
```

# EspoCRM Custom Fields Setup for IBF Integration

## Overview
The IBF Auth controller requires two custom fields in the User entity to store IBF credentials. This guide shows how to create these fields.

## Required Custom Fields

### 1. IBF Email Field (`ibfEmail`)
**Purpose**: Store the email address used for IBF system authentication
**Type**: Email
**Required**: No (will be auto-populated from user's emailAddress)

### 2. IBF Password Field (`ibfPassword`)
**Purpose**: Store the password for IBF system authentication  
**Type**: Text (or Password for security)
**Required**: No (will be auto-generated)

## Step-by-Step Creation

### Method 1: Admin UI (Recommended)

1. **Login to EspoCRM as Administrator**

2. **Go to Administration Panel**:
   - Click your profile menu (top-right)
   - Select "Administration"

3. **Navigate to Entity Manager**:
   - In Administration, click "Entity Manager"
   - Find and click on "User"

4. **Create IBF Email Field**:
   - Click "Fields" tab
   - Click "Add Field" button
   - Configure the field:
     ```
     Field Name: ibfEmail
     Label: IBF Email
     Type: Email
     Required: No
     Max Length: 255
     ```
   - Click "Save"

5. **Create IBF Password Field**:
   - Click "Add Field" button again
   - Configure the field:
     ```
     Field Name: ibfPassword  
     Label: IBF Password
     Type: Text (or Password)
     Required: No
     Max Length: 255
     ```
   - Click "Save"

6. **Update Layouts (Optional)**:
   - Click "Layouts" tab
   - Edit "Detail" layout to add the new fields if you want them visible
   - Edit "Edit" layout to add the new fields if you want them editable

7. **Clear Cache**:
   - Go to Administration > Clear Cache
   - Click "Clear Cache"

### Method 2: Direct Database (Advanced Users)

If you prefer to add the fields directly to the database:

```sql
-- Add ibfEmail field
ALTER TABLE user ADD COLUMN ibf_email VARCHAR(255) DEFAULT NULL;

-- Add ibfPassword field  
ALTER TABLE user ADD COLUMN ibf_password VARCHAR(255) DEFAULT NULL;
```

Then create the field definition files manually (see below).

### Method 3: Custom Field Definition Files

Create these files in your EspoCRM installation:

**File**: `custom/Espo/Custom/Resources/metadata/entityDefs/User.json`
```json
{
    "fields": {
        "ibfEmail": {
            "type": "email",
            "maxLength": 255,
            "view": "views/fields/email"
        },
        "ibfPassword": {
            "type": "text",
            "maxLength": 255
        }
    }
}
```

## Verification

After creating the fields, verify they work:

1. **Test Field Access**:
   ```javascript
   // In browser console on EspoCRM
   fetch('/api/v1/User/' + app.getUser().get('id'))
   .then(response => response.json())
   .then(user => {
       console.log('ibfEmail field:', user.ibfEmail);
       console.log('ibfPassword field:', user.ibfPassword);
   });
   ```

2. **Test IBF Auth Endpoint**:
   ```javascript
   // Test the improved controller
   fetch(`/api/v1/IbfAuth/action/validateToken?token=${app.getUser().get('token')}&userId=${app.getUser().get('id')}`)
   .then(response => response.json())
   .then(data => console.log('IBF Auth Result:', data));
   ```

3. **Check Logs**:
   - Look in your EspoCRM error logs for `[IBF-AUTH-INFO]` and `[IBF-AUTH-ERROR]` messages
   - Logs should show detailed information about the authentication process

## Troubleshooting

### Issue: "Custom fields do not exist" error
**Solution**: 
1. Ensure you created both `ibfEmail` and `ibfPassword` fields
2. Clear EspoCRM cache
3. Check the field names are exactly: `ibfEmail` and `ibfPassword` (case-sensitive)

### Issue: Fields created but values not saving
**Solution**:
1. Check database table has the columns: `ibf_email` and `ibf_password`
2. Verify user permissions allow updating User records
3. Check the entity definitions are correct

### Issue: Controller not logging
**Solution**:
1. Ensure error logging is enabled in PHP
2. Check PHP error log location
3. Verify the controller file is in the correct location

## Security Considerations

1. **Field Visibility**: Consider making these fields admin-only visible
2. **Password Storage**: The `ibfPassword` field stores IBF system passwords (not EspoCRM passwords)
3. **Access Control**: Ensure only authorized users can view/edit these fields
4. **Encryption**: Consider using EspoCRM's password field type for automatic encryption

## Expected Behavior After Setup

1. **First IBF Access**: 
   - User accesses IBF dashboard through EspoCRM
   - Controller creates new IBF account automatically
   - Saves IBF credentials to custom fields
   - Returns IBF token for authentication

2. **Subsequent Access**:
   - Controller finds existing IBF credentials
   - Authenticates with IBF API using stored credentials
   - Returns fresh IBF token

3. **Logging**:
   - All actions logged with `[IBF-AUTH-INFO]` and `[IBF-AUTH-ERROR]` prefixes
   - Detailed information about each step in the process

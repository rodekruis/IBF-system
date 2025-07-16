targetScope = 'resourceGroup'

// Parameters
@description('Environment name for the deployment')
param environmentName string

@description('Location for all resources')
param location string = resourceGroup().location

@description('Resource group name')
param resourceGroupName string

// Generate unique resource token based on environment, subscription and resource group
var resourceToken = toLower(uniqueString(subscription().id, resourceGroup().id, environmentName))

// Resource names using the pattern {resourcePrefix}-{resourceToken}
var appInsightsName = 'ai-${resourceToken}'
var logAnalyticsName = 'law-${resourceToken}'
var staticWebAppName = 'swa-${resourceToken}'
var keyVaultName = 'kv-${resourceToken}'

// Log Analytics Workspace
resource logAnalyticsWorkspace 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    features: {
      enableLogAccessUsingOnlyResourcePermissions: true
    }
  }
}

// Application Insights
resource applicationInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  kind: 'web'
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnalyticsWorkspace.id
    IngestionMode: 'LogAnalytics'
    publicNetworkAccessForIngestion: 'Enabled'
    publicNetworkAccessForQuery: 'Enabled'
  }
}

// Key Vault for storing secrets
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: {
    'azd-env-name': environmentName
  }
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    enableSoftDelete: true
    softDeleteRetentionInDays: 7
    publicNetworkAccess: 'Enabled'
  }
}

// Static Web App for the Svelte application
resource staticWebApp 'Microsoft.Web/staticSites@2024-04-01' = {
  name: staticWebAppName
  location: location
  tags: {
    'azd-env-name': environmentName
    'azd-service-name': 'ibf-svelte-dashboard'
  }
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {
    // Build properties for Svelte app
    buildProperties: {
      appLocation: '/' // Root directory
      apiLocation: '' // No API functions
      outputLocation: 'dist' // Vite builds to dist folder
      appBuildCommand: 'npm run build'
    }
    // Enable staging environments for preview deployments
    stagingEnvironmentPolicy: 'Enabled'
    // Allow public access
    publicNetworkAccess: 'Enabled'
  }
}

// Diagnostic Settings for Static Web App to connect to Log Analytics
resource staticWebAppDiagnostics 'Microsoft.Insights/diagnosticSettings@2021-05-01-preview' = {
  scope: staticWebApp
  name: 'default'
  properties: {
    workspaceId: logAnalyticsWorkspace.id
    logs: [
      {
        category: 'SWAFunction'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 30
        }
      }
    ]
    metrics: [
      {
        category: 'AllMetrics'
        enabled: true
        retentionPolicy: {
          enabled: true
          days: 30
        }
      }
    ]
  }
}

// Outputs for azd and other tools
@description('The URL of the Static Web App')
output AZURE_STATIC_WEB_APP_URL string = 'https://${staticWebApp.properties.defaultHostname}'

@description('Application Insights connection string')
output APPLICATIONINSIGHTS_CONNECTION_STRING string = applicationInsights.properties.ConnectionString

@description('Application Insights instrumentation key')
output APPINSIGHTS_INSTRUMENTATIONKEY string = applicationInsights.properties.InstrumentationKey

@description('Static Web App name')
output AZURE_STATIC_WEB_APP_NAME string = staticWebApp.name

@description('Key Vault URI')
output AZURE_KEY_VAULT_URI string = keyVault.properties.vaultUri

@description('Resource group name')
output AZURE_RESOURCE_GROUP string = resourceGroupName

@description('Resource group ID')
output RESOURCE_GROUP_ID string = resourceGroup().id

@description('Log Analytics workspace ID')
output AZURE_LOG_ANALYTICS_WORKSPACE_ID string = logAnalyticsWorkspace.id

// Required azd outputs
@description('Azure location')
output AZURE_LOCATION string = location

@description('Azure tenant ID')
output AZURE_TENANT_ID string = tenant().tenantId

@description('Service IBF Svelte app name')
output SERVICE_IBF_SVELTE_APP_NAME string = staticWebApp.name

@description('Service IBF Svelte app URI')
output SERVICE_IBF_SVELTE_APP_URI string = 'https://${staticWebApp.properties.defaultHostname}'

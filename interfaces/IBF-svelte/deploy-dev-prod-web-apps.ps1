# Deploy IBF Svelte Dashboard to Azure with Named Environments
# This script creates properly named Static Web Apps: 'ibf-dashboard-development', 'ibf-dashboard-test', and 'ibf-dashboard-production'
# All apps will be deployed to the same resource group: 'rg-ibf-svelte-dashboard'

Write-Host "IBF Svelte Dashboard - Named Environment Deployment" -ForegroundColor Green
Write-Host "======================================================" -ForegroundColor Green

# Check if Azure CLI is installed and logged in
try {
    $null = Get-Command az -ErrorAction Stop
} catch {
    Write-Host "Azure CLI is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if logged in to Azure
try {
    $null = az account show 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
} catch {
    Write-Host "Not logged in to Azure. Please run 'az login' first." -ForegroundColor Red
    exit 1
}

# Shared resource group settings
$rgName = "rg-ibf-svelte-dashboard"
$location = "West Europe"

# Check if resource group exists, create if needed
Write-Host "Checking resource group..." -ForegroundColor Blue
$existingRg = az group show --name $rgName --query "location" -o tsv 2>$null
if ($LASTEXITCODE -eq 0) {
    $location = $existingRg
    Write-Host "Resource Group: $rgName (already exists in $location)" -ForegroundColor Gray
} else {
    Write-Host "Creating resource group..." -ForegroundColor Blue
    Write-Host "Resource Group: $rgName" -ForegroundColor Gray
    Write-Host "Location: $location" -ForegroundColor Gray
    az group create --name $rgName --location $location
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to create shared resource group" -ForegroundColor Red
        exit 1
    }
}

# Function to deploy an environment
function Deploy-Environment {
    param(
        [string]$EnvName
    )
    
    $swaName = "ibf-dashboard-$EnvName"
    
    Write-Host ""
    Write-Host "Deploying $EnvName environment..." -ForegroundColor Blue
    Write-Host "Static Web App Name: $swaName" -ForegroundColor Gray
    Write-Host "Resource Group: $rgName" -ForegroundColor Gray
    
    # Check if Static Web App already exists
    Write-Host "Checking if Static Web App already exists..." -ForegroundColor Yellow
    $existingSwa = az staticwebapp show --name $swaName --resource-group $rgName --query "name" -o tsv 2>$null
    
    if ($LASTEXITCODE -eq 0 -and $existingSwa) {
        Write-Host "Static Web App '$swaName' already exists! Skipping infrastructure deployment." -ForegroundColor Green
        
        # Get existing Static Web App details
        $swaDetails = az staticwebapp show --name $swaName --resource-group $rgName --query "{name:name,defaultHostname:defaultHostname}" -o json | ConvertFrom-Json
        
        Write-Host "$EnvName environment already deployed!" -ForegroundColor Green
        Write-Host "Static Web App Name: $swaName" -ForegroundColor Green
        Write-Host "URL: https://$($swaDetails.defaultHostname)" -ForegroundColor Green
        
        # Get deployment token for reference
        $deploymentToken = az staticwebapp secrets list --name $swaName --resource-group $rgName --query "properties.apiKey" -o tsv
        
        Write-Host "Deployment token for existing $EnvName environment:" -ForegroundColor Cyan
        Write-Host $deploymentToken -ForegroundColor Yellow
        Write-Host ""
        
        return $true
    }
    
    # Static Web App doesn't exist, proceed with deployment
    Write-Host "Static Web App '$swaName' does not exist. Creating new infrastructure..." -ForegroundColor Yellow
    
    # Deploy Bicep template
    Write-Host "Deploying infrastructure..." -ForegroundColor Yellow
    az deployment group create `
        --resource-group $rgName `
        --template-file "./infra/main.bicep" `
        --parameters "./infra/main.parameters.$EnvName.json" `
        --verbose
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Failed to deploy infrastructure for $EnvName" -ForegroundColor Red
        return $false
    }
    
    # Get Static Web App details after successful deployment
    $swaDetails = az staticwebapp show --name $swaName --resource-group $rgName --query "{name:name,defaultHostname:defaultHostname}" -o json | ConvertFrom-Json
    
    Write-Host "$EnvName environment deployed successfully!" -ForegroundColor Green
    Write-Host "Static Web App Name: $swaName" -ForegroundColor Green
    Write-Host "URL: https://$($swaDetails.defaultHostname)" -ForegroundColor Green
    
    # Get deployment token for later use
    $deploymentToken = az staticwebapp secrets list --name $swaName --resource-group $rgName --query "properties.apiKey" -o tsv
    
    Write-Host "Deployment token for new $EnvName environment:" -ForegroundColor Cyan
    Write-Host $deploymentToken -ForegroundColor Yellow
    Write-Host ""
    
    return $true
}

# Deploy all environments
Write-Host "Starting deployment of all environments..." -ForegroundColor Blue

# Deploy development environment first
$devSuccess = Deploy-Environment -EnvName "development"

if (-not $devSuccess) {
    Write-Host "Development environment deployment failed. Continuing with other environments..." -ForegroundColor Yellow
}

# Deploy test environment
$testSuccess = Deploy-Environment -EnvName "test"

if (-not $testSuccess) {
    Write-Host "Test environment deployment failed. Continuing with production..." -ForegroundColor Yellow
}

# Deploy production environment
$prodSuccess = Deploy-Environment -EnvName "production"

if (-not $prodSuccess) {
    Write-Host "Production environment deployment failed." -ForegroundColor Red
}

# Summary
Write-Host ""
Write-Host "Deployment Summary:" -ForegroundColor Cyan
Write-Host "- Development: $(if ($devSuccess) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor $(if ($devSuccess) { 'Green' } else { 'Red' })
Write-Host "- Test: $(if ($testSuccess) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor $(if ($testSuccess) { 'Green' } else { 'Red' })
Write-Host "- Production: $(if ($prodSuccess) { 'SUCCESS' } else { 'FAILED' })" -ForegroundColor $(if ($prodSuccess) { 'Green' } else { 'Red' })

$overallSuccess = $devSuccess -and $testSuccess -and $prodSuccess
if ($overallSuccess) {
    Write-Host "All environments deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "Some deployments failed. Check the logs above." -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Configure your GitHub repository secrets with the deployment tokens shown above"
Write-Host "   - AZURE_STATIC_WEB_APPS_API_TOKEN_DEVELOPMENT (for ibf-dashboard-development)"
Write-Host "   - AZURE_STATIC_WEB_APPS_API_TOKEN_TEST (for ibf-dashboard-test)"
Write-Host "   - AZURE_STATIC_WEB_APPS_API_TOKEN_PRODUCTION (for ibf-dashboard-production)"
Write-Host "2. Update your GitHub Actions workflow to deploy to these named environments"
Write-Host "3. Test all environments"
Write-Host "4. Update your EspoCRM integration to point to the appropriate environment URL"
Write-Host ""
Write-Host "Static Web Apps in resource group ${rgName}:" -ForegroundColor Cyan
Write-Host "- ibf-dashboard-development: Check output above for development environment URL"
Write-Host "- ibf-dashboard-test: Check output above for test environment URL"
Write-Host "- ibf-dashboard-production: Check output above for production environment URL"

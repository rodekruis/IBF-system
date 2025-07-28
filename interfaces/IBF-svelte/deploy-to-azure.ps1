# IBF Svelte Dashboard - Azure Deployment Script (PowerShell)
# This script automates the deployment of the IBF Svelte Dashboard to Azure Static Web Apps

param(
    [switch]$SkipDependencies,
    [switch]$DeployInfrastructure,
    [string]$StaticWebAppName,
    [switch]$Help,
    [Parameter(Position=0)]
    [ValidateSet("development", "test", "production", "dev", "prod")]
    [string]$Environment
)

function Show-Help {
    Write-Host ""
    Write-Host "IBF Svelte Dashboard - Azure Deployment Script" -ForegroundColor Cyan
    Write-Host "=============================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "USAGE:" -ForegroundColor Yellow
    Write-Host "  .\deploy-to-azure.ps1 <Environment> [Options]" -ForegroundColor White
    Write-Host ""
    Write-Host "ENVIRONMENTS:" -ForegroundColor Yellow
    Write-Host "  development, dev    Deploy to development environment" -ForegroundColor Gray
    Write-Host "  test               Deploy to test environment" -ForegroundColor Gray
    Write-Host "  production, prod   Deploy to production environment" -ForegroundColor Gray
    Write-Host ""
    Write-Host "OPTIONS:" -ForegroundColor Yellow
    Write-Host "  -SkipDependencies     Skip npm install step" -ForegroundColor Gray
    Write-Host "  -DeployInfrastructure Deploy Azure infrastructure first" -ForegroundColor Gray
    Write-Host "  -StaticWebAppName     Specify Static Web App name to deploy to" -ForegroundColor Gray
    Write-Host "  -Help                 Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "EXAMPLES:" -ForegroundColor Yellow
    Write-Host "  .\deploy-to-azure.ps1 development" -ForegroundColor White
    Write-Host "  .\deploy-to-azure.ps1 prod -SkipDependencies" -ForegroundColor White
    Write-Host "  .\deploy-to-azure.ps1 test -DeployInfrastructure" -ForegroundColor White
    Write-Host "  .\deploy-to-azure.ps1 production -StaticWebAppName 'my-custom-swa'" -ForegroundColor White
    Write-Host ""
    Write-Host "NOTES:" -ForegroundColor Yellow
    Write-Host "  - You must be logged into Azure CLI (az login)" -ForegroundColor Gray
    Write-Host "  - Node.js and npm must be installed" -ForegroundColor Gray
    Write-Host "  - Production deployments require confirmation" -ForegroundColor Gray
    Write-Host ""
}

# Show help if requested or no environment specified
if ($Help -or (-not $Environment)) {
    Show-Help
    exit 0
}

# Configuration
$ResourceGroup = "rg-ibf-svelte-dashboard"
$Location = "westeurope"

# Environment mapping and validation
$envMapping = @{
    "dev" = "development"
    "prod" = "production"
    "development" = "development"
    "test" = "test"
    "production" = "production"
}

# Normalize environment name
$Environment = $envMapping[$Environment.ToLower()]

$EnvironmentName = "ibf-svelte-$Environment"

Write-Host ""
Write-Host "=== Deploying to: $Environment ===" -ForegroundColor Yellow
Write-Host "Static Web App will be: ibf-dashboard-$Environment" -ForegroundColor Gray
Write-Host ""

# Confirm deployment for production
if ($Environment -eq "production") {
    $confirmation = Read-Host "Are you sure you want to deploy to PRODUCTION? (y/N)"
    if ($confirmation -notmatch '^[Yy]') {
        Write-Host "Deployment cancelled." -ForegroundColor Yellow
        exit 0
    }
}

# Error handling
$ErrorActionPreference = "Stop"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Test-Prerequisites {
    Write-Status "Checking prerequisites..."
    
    # Check Azure CLI
    if (!(Get-Command az -ErrorAction SilentlyContinue)) {
        Write-Error "Azure CLI is not installed. Please install it first."
        exit 1
    }
    
    # Check npm
    if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Error "npm is not installed. Please install Node.js first."
        exit 1
    }
    
    # Check Azure login
    try {
        az account show | Out-Null
    }
    catch {
        Write-Error "Not logged into Azure. Please run 'az login' first."
        exit 1
    }
    
    Write-Success "Prerequisites check passed"
}

function Test-Subscription {
    Write-Status "Verifying Azure subscription..."
    
    $currentSubscription = az account show --query "name" --output tsv
    Write-Status "Current subscription: $currentSubscription"
    
    if ($currentSubscription -notmatch "510") {
        Write-Warning "You might not be on the correct subscription. Expected '510 - General'"
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y" -and $continue -ne "Y") {
            Write-Error "Deployment cancelled"
            exit 1
        }
    }
}

function Get-StaticWebApp {
    Write-Status "Getting available Static Web Apps..."
    
    # Set the expected static web app name based on environment
    $expectedSwaName = "ibf-dashboard-$Environment"
    
    $staticWebApps = az staticwebapp list --resource-group $ResourceGroup --query "[].name" --output tsv
    
    if (!$staticWebApps) {
        Write-Error "No Static Web Apps found in resource group $ResourceGroup"
        if ($DeployInfrastructure) {
            Deploy-Infrastructure
            $staticWebApps = az staticwebapp list --resource-group $ResourceGroup --query "[].name" --output tsv
        } else {
            $deploy = Read-Host "Would you like to deploy the infrastructure for $Environment first? (y/N)"
            if ($deploy -eq "y" -or $deploy -eq "Y") {
                Deploy-Infrastructure
                $staticWebApps = az staticwebapp list --resource-group $ResourceGroup --query "[].name" --output tsv
            } else {
                exit 1
            }
        }
    }
    
    $swaArray = $staticWebApps -split "`n" | Where-Object { $_ -ne "" }
    
    if ($StaticWebAppName) {
        if ($swaArray -contains $StaticWebAppName) {
            $script:SelectedSWA = $StaticWebAppName
            Write-Success "Using specified Static Web App: $StaticWebAppName"
        } else {
            Write-Error "Specified Static Web App '$StaticWebAppName' not found"
            exit 1
        }
    } elseif ($swaArray -contains $expectedSwaName) {
        $script:SelectedSWA = $expectedSwaName
        Write-Success "Using Static Web App for ${Environment}: $expectedSwaName"
    } elseif ($swaArray.Count -eq 1) {
        $script:SelectedSWA = $swaArray[0]
        Write-Success "Using only available Static Web App: $($script:SelectedSWA)"
    } else {
        Write-Status "Available Static Web Apps:"
        for ($i = 0; $i -lt $swaArray.Count; $i++) {
            $marker = if ($swaArray[$i] -eq $expectedSwaName) { " (recommended for $Environment)" } else { "" }
            Write-Host "  $($i + 1). $($swaArray[$i])$marker"
        }
        
        do {
            $selection = Read-Host "Enter selection (1-$($swaArray.Count))"
            $selectionNum = [int]$selection
        } while ($selectionNum -lt 1 -or $selectionNum -gt $swaArray.Count)
        
        $script:SelectedSWA = $swaArray[$selectionNum - 1]
        Write-Success "Selected Static Web App: $($script:SelectedSWA)"
    }
}

function Deploy-Infrastructure {
    Write-Status "Deploying infrastructure for $Environment environment..."
    
    # Check if parameter file exists
    $paramFile = "infra/main.parameters.$Environment.json"
    if (-not (Test-Path $paramFile)) {
        Write-Error "Parameter file not found: $paramFile"
        Write-Status "Please create this file with environment-specific settings."
        Write-Status "You can copy from infra/main.parameters.json and modify as needed."
        exit 1
    }
    
    az deployment group create `
        --resource-group $ResourceGroup `
        --template-file "infra/main.bicep" `
        --parameters $paramFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Infrastructure deployment completed for $Environment"
    } else {
        Write-Error "Infrastructure deployment failed for $Environment"
        exit 1
    }
}

function Install-Dependencies {
    if ($SkipDependencies) {
        Write-Status "Skipping dependency installation (--SkipDependencies flag used)"
        return
    }
    
    Write-Status "Installing npm dependencies..."
    npm install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Dependencies installed successfully"
    } else {
        Write-Error "Failed to install dependencies"
        exit 1
    }
}

function Build-Application {
    Write-Status "Building application for $Environment environment..."
    
    # Since configuration is now dynamic via EspoCRM settings,
    # we use the same build command for all environments
    $buildCommand = "build"
    
    Write-Status "Running: npm run $buildCommand"
    Write-Status "Note: Configuration will be set dynamically via EspoCRM settings"
    npm run $buildCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application built successfully for $Environment"
        Write-Status "Build output available in: ./dist/"
    } else {
        Write-Error "Application build failed for $Environment"
        exit 1
    }
}

function Get-DeploymentToken {
    Write-Status "Getting deployment token for $($script:SelectedSWA)..."
    
    $script:DeploymentToken = az staticwebapp secrets list `
        --name $script:SelectedSWA `
        --resource-group $ResourceGroup `
        --query "properties.apiKey" `
        --output tsv
    
    if (!$script:DeploymentToken) {
        Write-Error "Failed to get deployment token"
        exit 1
    }
    
    Write-Success "Deployment token retrieved successfully"
}

function Install-SWACli {
    Write-Status "Checking for Azure Static Web Apps CLI..."
    
    if (!(Get-Command swa -ErrorAction SilentlyContinue)) {
        Write-Status "Installing Azure Static Web Apps CLI globally..."
        npm install -g @azure/static-web-apps-cli
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "SWA CLI installed successfully"
        } else {
            Write-Error "Failed to install SWA CLI"
            exit 1
        }
    } else {
        Write-Success "SWA CLI already installed"
    }
}

function Deploy-Application {
    Write-Status "Deploying application to Azure Static Web Apps..."
    Write-Status "Target Environment: $Environment"
    Write-Status "Target SWA: $($script:SelectedSWA)"
    
    # Use production deployment for all environments in Static Web Apps
    swa deploy ./dist --deployment-token $script:DeploymentToken --env production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application deployed successfully to $Environment!"
        
        # Get the deployment URL
        $deploymentUrl = az staticwebapp show `
            --name $script:SelectedSWA `
            --resource-group $ResourceGroup `
            --query "defaultHostname" `
            --output tsv
        
        Write-Success "Deployment URL: https://$deploymentUrl"
        Update-EnvironmentConfig $deploymentUrl
        
        return $deploymentUrl
    } else {
        Write-Error "Application deployment failed for $Environment"
        exit 1
    }
}

function Update-EnvironmentConfig {
    param([string]$DeploymentUrl)
    
    Write-Status "Configuration notes for $Environment environment..."
    
    Write-Status "Configuration is now managed via EspoCRM admin settings"
    Write-Status "To configure this deployment:"
    Write-Host "   1. Login to your EspoCRM admin panel" -ForegroundColor Gray
    Write-Host "   2. Go to Administration > IBF Settings" -ForegroundColor Gray
    Write-Host "   3. Set IBF Dashboard URL to: https://$DeploymentUrl" -ForegroundColor Gray
    Write-Host "   4. Configure other IBF settings as needed" -ForegroundColor Gray
    
    Write-Success "No local environment files need updating - configuration is dynamic!"
}

function Show-DeploymentSummary {
    param([string]$DeploymentUrl)
    
    Write-Success "=== DEPLOYMENT SUMMARY ==="
    Write-Host ""
    Write-Status "Target Environment: $Environment"
    Write-Status "Static Web App: $($script:SelectedSWA)"
    Write-Status "Resource Group: $ResourceGroup"
    Write-Status "Azure Environment: $EnvironmentName"
    Write-Status "Deployment URL: https://$DeploymentUrl"
    Write-Host ""
    
    # Environment-specific deployment information
    switch ($Environment) {
        "development" {
            Write-Status "Development Environment - Use for testing features"
        }
        "test" {
            Write-Status "Test Environment - Use for staging and validation"
        }
        "production" {
            Write-Status "Production Environment - Live deployment"
        }
    }
    
    Write-Host ""
    Write-Success "Deployment completed successfully!"
    Write-Status "You can now test the application at: https://$DeploymentUrl"
    
    $openBrowser = Read-Host "Open the deployment URL in your default browser? (y/N)"
    if ($openBrowser -eq "y" -or $openBrowser -eq "Y") {
        Start-Process "https://$DeploymentUrl"
    }
}

# Main execution
try {
    Write-Success "=== IBF Svelte Dashboard - Azure Deployment ==="
    Write-Host ""
    
    Test-Prerequisites
    Test-Subscription
    Get-StaticWebApp
    Install-Dependencies
    Build-Application
    Get-DeploymentToken
    Install-SWACli
    $deploymentUrl = Deploy-Application
    Show-DeploymentSummary $deploymentUrl
    
    Write-Success "All done!"
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}

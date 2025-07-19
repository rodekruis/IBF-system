# IBF Svelte Dashboard - Azure Deployment Script (PowerShell)
# This script automates the deployment of the IBF Svelte Dashboard to Azure Static Web Apps

param(
    [switch]$SkipDependencies,
    [switch]$DeployInfrastructure,
    [string]$StaticWebAppName
)

# Configuration
$ResourceGroup = "rg-ibf-svelte-dashboard"
$EnvironmentName = "ibf-svelte-prod"
$Location = "westeurope"

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
    
    $staticWebApps = az staticwebapp list --resource-group $ResourceGroup --query "[].name" --output tsv
    
    if (!$staticWebApps) {
        Write-Error "No Static Web Apps found in resource group $ResourceGroup"
        if ($DeployInfrastructure) {
            Deploy-Infrastructure
            $staticWebApps = az staticwebapp list --resource-group $ResourceGroup --query "[].name" --output tsv
        } else {
            $deploy = Read-Host "Would you like to deploy the infrastructure first? (y/N)"
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
    } elseif ($swaArray.Count -eq 1) {
        $script:SelectedSWA = $swaArray[0]
        Write-Success "Using Static Web App: $($script:SelectedSWA)"
    } else {
        Write-Status "Multiple Static Web Apps found. Please select one:"
        for ($i = 0; $i -lt $swaArray.Count; $i++) {
            Write-Host "  $($i + 1). $($swaArray[$i])"
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
    Write-Status "Deploying infrastructure..."
    
    az deployment group create `
        --resource-group $ResourceGroup `
        --template-file "infra/main.bicep" `
        --parameters environmentName=$EnvironmentName location=$Location resourceGroupName=$ResourceGroup
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Infrastructure deployment completed"
    } else {
        Write-Error "Infrastructure deployment failed"
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
    Write-Status "Building application for production..."
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application built successfully"
        Write-Status "Build output available in: ./dist/"
    } else {
        Write-Error "Application build failed"
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
    Write-Status "Target: $($script:SelectedSWA)"
    
    swa deploy ./dist --deployment-token $script:DeploymentToken --env production
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Application deployed successfully!"
        
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
        Write-Error "Application deployment failed"
        exit 1
    }
}

function Update-EnvironmentConfig {
    param([string]$DeploymentUrl)
    
    Write-Status "Checking environment configuration..."
    
    if (Select-String -Path ".env.production" -Pattern "https://crm.510.global" -Quiet) {
        Write-Warning "Found old EspoCRM URL in .env.production"
        Write-Status "Updating to: https://ibf-pivot-crm.510.global"
        
        # Create backup
        Copy-Item ".env.production" ".env.production.backup"
        
        # Update the URL
        (Get-Content ".env.production") -replace "https://crm.510.global", "https://ibf-pivot-crm.510.global" | Set-Content ".env.production"
        
        Write-Success "Environment configuration updated"
        Write-Warning "Original configuration backed up to .env.production.backup"
    }
}

function Show-DeploymentSummary {
    param([string]$DeploymentUrl)
    
    Write-Success "=== DEPLOYMENT SUMMARY ==="
    Write-Host ""
    Write-Status "Static Web App: $($script:SelectedSWA)"
    Write-Status "Resource Group: $ResourceGroup"
    Write-Status "Environment: $EnvironmentName"
    Write-Status "Deployment URL: https://$DeploymentUrl"
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
    
    Write-Success "All done! 🚀"
}
catch {
    Write-Error "Deployment failed: $($_.Exception.Message)"
    exit 1
}

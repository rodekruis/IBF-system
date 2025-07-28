# EspoCRM Extension Deployment - Simplified and Robust
param(
    [string]$Environment
)

# Environment configuration
$Environments = @{
    "dev" = @{
        "Host" = "134.149.202.254"
        "User" = "crmadmin"
        "Name" = "Development"
    }
    "test" = @{
        "Host" = "52.232.40.194"
        "User" = "mali-espocrm-admin"  
        "Name" = "Test"
    }
}

# If no environment specified, show menu
if (-not $Environment) {
    Write-Host ""
    Write-Host "EspoCRM Extension Deployment" -ForegroundColor Green
    Write-Host "============================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Available environments:" -ForegroundColor Cyan
    Write-Host "1. Development (dev)" -ForegroundColor Gray
    Write-Host "2. Test (test)" -ForegroundColor Gray
    Write-Host ""
    
    do {
        $choice = Read-Host "Select environment to deploy to (1-2, or type name)"
        
        switch ($choice) {
            "1" { $Environment = "dev"; break }
            "2" { $Environment = "test"; break }
            { $_ -in @("dev", "test") } { 
                $Environment = $_.ToLower(); break 
            }
            default { 
                Write-Host "Invalid selection. Please choose 1-2 or type: dev, test" -ForegroundColor Red
            }
        }
    } while (-not $Environment)
}

# Validate environment
if (-not $Environments.ContainsKey($Environment.ToLower())) {
    Write-Host "Invalid environment '$Environment'. Use 'dev' or 'test'." -ForegroundColor Red
    Write-Host "Usage: .\deploy-extension.ps1 -Environment dev" -ForegroundColor Yellow
    Write-Host "       .\deploy-extension.ps1 -Environment test" -ForegroundColor Yellow
    exit 1
}

$SelectedEnv = $Environments[$Environment.ToLower()]
$VMHost = $SelectedEnv.Host
$VMUser = $SelectedEnv.User
$EnvName = $SelectedEnv.Name

$EXTENSION_NAME = "ibf-dashboard-extension"

Write-Host "EspoCRM Extension Deployment" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host "Environment: $EnvName ($Environment)" -ForegroundColor Cyan
Write-Host "Target: $VMUser@$VMHost" -ForegroundColor Cyan
Write-Host ""

# Step 1: Build extension
Write-Host "1. Building extension..." -ForegroundColor Yellow
& .\create-extension.ps1 -patch

# Step 2: Determine the actual package filename after build (version may have been incremented)
$VERSION = (Get-Content manifest.json | ConvertFrom-Json).version
$PACKAGE_FILE = "$EXTENSION_NAME-v$VERSION.zip"

Write-Host "Package created: $PACKAGE_FILE" -ForegroundColor Green

if (-not (Test-Path $PACKAGE_FILE)) {
    Write-Host "Failed to create package!" -ForegroundColor Red
    exit 1
}

# Step 2: Transfer to VM
Write-Host "2. Transferring package to VM..." -ForegroundColor Yellow
& scp $PACKAGE_FILE "$VMUser@$VMHost`:~/"

if ($LASTEXITCODE -ne 0) {
    Write-Host "Transfer failed!" -ForegroundColor Red
    exit 1
}

Write-Host "Package transferred successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Installation Instructions:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. SSH into your VM:" -ForegroundColor Yellow
Write-Host "   ssh $VMUser@$VMHost" -ForegroundColor White
Write-Host ""
Write-Host "2. Run the installation script:" -ForegroundColor Yellow
Write-Host "   ./install-extension.sh" -ForegroundColor White
Write-Host ""
Write-Host "The script will:" -ForegroundColor Gray
Write-Host "   - Move $PACKAGE_FILE to /var/www/espocrm/extensions/" -ForegroundColor Gray
Write-Host "   - Install the extension via EspoCRM command" -ForegroundColor Gray
Write-Host "   - Clear cache" -ForegroundColor Gray
Write-Host "   - Clean up the package file" -ForegroundColor Gray
Write-Host ""
Write-Host "After installation, check your EspoCRM instance for the IBF Dashboard!" -ForegroundColor Green

# EspoCRM IBF Dashboard Extension Packager (PowerShell)
# This script creates a zip package that can be uploaded to EspoCRM as an extension
#
# Usage:
#   .\create-extension.ps1           # Use current version from manifest.json
#   .\create-extension.ps1 -patch    # Auto-increment patch version (1.0.0 -> 1.0.1)
#   .\create-extension.ps1 -minor    # Auto-increment minor version (1.0.0 -> 1.1.0)  
#   .\create-extension.ps1 -major    # Auto-increment major version (1.0.0 -> 2.0.0)

param(
    [switch]$patch,
    [switch]$minor,
    [switch]$major
)

$EXTENSION_NAME = "ibf-dashboard-extension"

# Load current manifest
$manifest = Get-Content manifest.json | ConvertFrom-Json
$currentVersion = $manifest.version

# Handle version incrementing
if ($patch -or $minor -or $major) {
    $versionParts = $currentVersion.Split('.')
    $majorNum = [int]$versionParts[0]
    $minorNum = [int]$versionParts[1]  
    $patchNum = [int]$versionParts[2]
    
    if ($major) {
        $majorNum++
        $minorNum = 0
        $patchNum = 0
        $newVersion = "$majorNum.$minorNum.$patchNum"
        Write-Host "Auto-incrementing MAJOR version: $currentVersion -> $newVersion" -ForegroundColor Cyan
    } elseif ($minor) {
        $minorNum++
        $patchNum = 0
        $newVersion = "$majorNum.$minorNum.$patchNum"
        Write-Host "Auto-incrementing MINOR version: $currentVersion -> $newVersion" -ForegroundColor Cyan
    } elseif ($patch) {
        $patchNum++
        $newVersion = "$majorNum.$minorNum.$patchNum"
        Write-Host "Auto-incrementing PATCH version: $currentVersion -> $newVersion" -ForegroundColor Cyan
    }
    
    # Update manifest with new version
    $manifest.version = $newVersion
    $manifest.releaseDate = (Get-Date).ToString("yyyy-MM-dd")
    $manifest | ConvertTo-Json -Depth 10 | Set-Content manifest.json
    Write-Host "Updated manifest.json with new version and release date" -ForegroundColor Green
    Write-Host ""
    
    $VERSION = $newVersion
} else {
    $VERSION = $currentVersion
    Write-Host "Using current version from manifest.json: $VERSION" -ForegroundColor Gray
}

# Get the directory where this script is located
$SCRIPT_DIR = $PSScriptRoot
$OUTPUT_FILE = "$SCRIPT_DIR\$EXTENSION_NAME-v$VERSION.zip"

Write-Host "Creating EspoCRM IBF Dashboard Extension Package" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "Extension: IBF Dashboard" -ForegroundColor Cyan
Write-Host "Version: $VERSION" -ForegroundColor Cyan  
Write-Host "Output: $OUTPUT_FILE" -ForegroundColor Cyan
Write-Host ""

# Remove existing package if it exists
if (Test-Path $OUTPUT_FILE) {
    Write-Host "Removing existing package: $OUTPUT_FILE" -ForegroundColor Yellow
    Remove-Item $OUTPUT_FILE -Force
}

# Create temporary directory for packaging
$TEMP_DIR = "temp_package"
if (Test-Path $TEMP_DIR) {
    Remove-Item $TEMP_DIR -Recurse -Force
}
New-Item -ItemType Directory -Path $TEMP_DIR | Out-Null
New-Item -ItemType Directory -Path "$TEMP_DIR\files" | Out-Null

Write-Host "Preparing extension package..." -ForegroundColor Yellow

# Copy manifest.json to root of package
Copy-Item manifest.json "$TEMP_DIR\" -Force

# Copy all extension files maintaining directory structure automatically
Write-Host "Copying extension files..." -ForegroundColor Yellow

# Automatically discover all directories in current folder (excluding temp and output files)
$excludePatterns = @("temp_package", "*.zip", "*.ps1", "*.sh", "*.md", "*.txt")
$allFolders = Get-ChildItem -Directory | Where-Object { 
    $folderName = $_.Name
    $shouldExclude = $false
    foreach ($pattern in $excludePatterns) {
        if ($folderName -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    -not $shouldExclude
}

Write-Host "   Discovered folders to package: $($allFolders.Name -join ', ')" -ForegroundColor Gray

# Define the extension folders using correct EspoCRM extension structure
Write-Host "Setting up EspoCRM extension structure..." -ForegroundColor Yellow

# Copy files using EspoCRM extension structure (files/ and scripts/ at root)
Write-Host "   Copying extension files..." -ForegroundColor Gray

# Copy PHP files (server-side) - files/ directory goes directly to root
if (Test-Path "files") {
    Copy-Item "files\*" "$TEMP_DIR\files\" -Recurse -Force
    $phpFileCount = (Get-ChildItem "$TEMP_DIR\files" -Recurse -File -Include "*.php").Count
    Write-Host "   Copied $phpFileCount PHP files to files/" -ForegroundColor Green
}

# Copy scripts - scripts/ directory goes directly to root
if (Test-Path "scripts") {
    New-Item -ItemType Directory -Path "$TEMP_DIR\scripts" -Force | Out-Null
    Copy-Item "scripts\*" "$TEMP_DIR\scripts\" -Recurse -Force
    $scriptFileCount = (Get-ChildItem "$TEMP_DIR\scripts" -Recurse -File).Count
    Write-Host "   Copied $scriptFileCount script files to scripts/" -ForegroundColor Green
}

# Copy manifest and other root files
$rootFiles = @("manifest.json")
foreach ($file in $rootFiles) {
    if (Test-Path $file) {
        Copy-Item $file "$TEMP_DIR\$file" -Force
        Write-Host "   Copied $file" -ForegroundColor Green
    }
}

Write-Host "Creating zip package with Linux-compatible paths..." -ForegroundColor Yellow

# Create ZIP manually with correct Unix paths using .NET System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

try {
    # Remove existing file if it exists
    if (Test-Path $OUTPUT_FILE) {
        Remove-Item $OUTPUT_FILE -Force
    }
    
    # Create new ZIP archive
    $zip = [System.IO.Compression.ZipFile]::Open($OUTPUT_FILE, [System.IO.Compression.ZipArchiveMode]::Create)
    
    # Add all files from temp directory with Unix paths
    $fullTempPath = (Resolve-Path $TEMP_DIR).Path
    $allFiles = Get-ChildItem "$TEMP_DIR" -Recurse -File
    foreach ($file in $allFiles) {
        # Get relative path and convert to Unix format
        $relativePath = $file.FullName.Substring($fullTempPath.Length + 1)
        $unixPath = $relativePath -replace '\\', '/'
        
        Write-Host "   Adding: $unixPath" -ForegroundColor Gray
        
        # Create entry in ZIP with Unix path
        $entry = $zip.CreateEntry($unixPath)
        $entryStream = $entry.Open()
        $fileStream = [System.IO.File]::OpenRead($file.FullName)
        $fileStream.CopyTo($entryStream)
        $fileStream.Close()
        $entryStream.Close()
    }
    
    $zip.Dispose()
    Write-Host "ZIP created successfully with Unix-compatible paths" -ForegroundColor Green
    
} catch {
    Write-Host "Error creating ZIP: $($_.Exception.Message)" -ForegroundColor Red
    if ($zip) { $zip.Dispose() }
    exit 1
}

# Cleanup
Remove-Item $TEMP_DIR -Recurse -Force

# Verify package was created
if (Test-Path $OUTPUT_FILE) {
    $fileSize = [math]::Round((Get-Item $OUTPUT_FILE).Length / 1KB, 2)
    Write-Host "Package created successfully!" -ForegroundColor Green
    Write-Host "File: $OUTPUT_FILE" -ForegroundColor White
    Write-Host "Size: $fileSize KB" -ForegroundColor White
    Write-Host ""
    Write-Host "Installation Instructions:" -ForegroundColor Cyan
    Write-Host "1. Go to your EspoCRM instance" -ForegroundColor White
    Write-Host "2. Navigate to Administration > Extensions" -ForegroundColor White
    Write-Host "3. Click Upload and select: $OUTPUT_FILE" -ForegroundColor White
    Write-Host "4. Click Install to install the extension" -ForegroundColor White
    Write-Host "5. Clear cache if prompted" -ForegroundColor White
    Write-Host ""
    Write-Host "The IBF Dashboard will appear in the main navigation menu." -ForegroundColor Green
} else {
    Write-Host "Error: Package creation failed!" -ForegroundColor Red
    exit 1
}

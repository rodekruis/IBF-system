# IBF Dashboard Version Management Script
param(
    [Parameter(Mandatory=$false)]
    [string]$NewVersion,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("patch", "minor", "major")]
    [string]$BumpType,
    
    [Parameter(Mandatory=$false)]
    [switch]$ShowVersion
)

# Function to get current version from package.json
function Get-CurrentVersion {
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        return $packageJson.version
    }
    catch {
        Write-Host "Error: Could not read version from package.json" -ForegroundColor Red
        return "0.0.0"
    }
}

# Function to bump version
function Get-BumpedVersion {
    param(
        [string]$currentVersion,
        [string]$bumpType
    )
    
    $versionParts = $currentVersion.Split('.')
    if ($versionParts.Length -ne 3) {
        Write-Host "Error: Invalid version format. Expected major.minor.patch" -ForegroundColor Red
        return $currentVersion
    }
    
    $major = [int]$versionParts[0]
    $minor = [int]$versionParts[1]
    $patch = [int]$versionParts[2]
    
    switch ($bumpType) {
        "major" { 
            $major++
            $minor = 0
            $patch = 0
        }
        "minor" { 
            $minor++
            $patch = 0
        }
        "patch" { 
            $patch++
        }
    }
    
    return "$major.$minor.$patch"
}

# Function to update version in files
function Update-Version {
    param([string]$version)
    
    Write-Host "Updating version to: $version" -ForegroundColor Green
    
    # Update package.json
    try {
        $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
        $packageJson.version = $version
        $packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json" -Encoding UTF8
        Write-Host "   Updated package.json" -ForegroundColor Gray
    }
    catch {
        Write-Host "   Error updating package.json: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Update environment.ts
    try {
        $envPath = "src/environments/environment.ts"
        if (Test-Path $envPath) {
            $envContent = Get-Content $envPath -Raw
            $envContent = $envContent -replace "ibfSystemVersion: 'v[\d\.]+',", "ibfSystemVersion: 'v$version',"
            $envContent | Set-Content $envPath -Encoding UTF8
            Write-Host "   Updated $envPath" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "   Error updating environment.ts: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Update main web component files
    $webComponentFiles = @(
        "src/main-web-component.ts",
        "src/main-simple-web-component.ts", 
        "src/main-minimal-web-component.ts",
        "src/main-ultra-minimal-web-component.ts"
    )
    
    foreach ($file in $webComponentFiles) {
        if (Test-Path $file) {
            try {
                $content = Get-Content $file -Raw
                # Update hardcoded versions to use environment version
                $content = $content -replace "version: '[^']*'", "version: 'v$version'"
                $content | Set-Content $file -Encoding UTF8
                Write-Host "   Updated $file" -ForegroundColor Gray
            }
            catch {
                Write-Host "   Error updating $file: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
    
    Write-Host "Version update completed!" -ForegroundColor Green
}

# Main logic
if ($ShowVersion) {
    $currentVersion = Get-CurrentVersion
    Write-Host "Current version: $currentVersion" -ForegroundColor Cyan
    exit 0
}

$currentVersion = Get-CurrentVersion
Write-Host "Current version: $currentVersion" -ForegroundColor Cyan

if ($NewVersion) {
    # Validate version format
    if ($NewVersion -match '^\d+\.\d+\.\d+$') {
        Update-Version -version $NewVersion
    }
    else {
        Write-Host "Error: Invalid version format. Use major.minor.patch (e.g., 1.2.3)" -ForegroundColor Red
        exit 1
    }
}
elseif ($BumpType) {
    $newVersion = Get-BumpedVersion -currentVersion $currentVersion -bumpType $BumpType
    Update-Version -version $newVersion
}
else {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "   Set specific version:    ./update-version.ps1 -NewVersion '1.2.3'" -ForegroundColor Gray
    Write-Host "   Bump patch version:      ./update-version.ps1 -BumpType patch" -ForegroundColor Gray
    Write-Host "   Bump minor version:      ./update-version.ps1 -BumpType minor" -ForegroundColor Gray
    Write-Host "   Bump major version:      ./update-version.ps1 -BumpType major" -ForegroundColor Gray
    Write-Host "   Show current version:    ./update-version.ps1 -ShowVersion" -ForegroundColor Gray
}

#!/usr/bin/env bash

# EspoCRM Extension Deployment - Simplified and Robust
# Compatible with macOS, Linux, and WSL

set -e  # Exit on error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
GRAY='\033[0;37m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Environment configuration
declare -A ENVIRONMENTS
ENVIRONMENTS["dev,host"]="134.149.202.254"
ENVIRONMENTS["dev,user"]="crmadmin"
ENVIRONMENTS["dev,home"]="/home/crmadmin"
ENVIRONMENTS["dev,name"]="Development"
ENVIRONMENTS["test,host"]="52.232.40.194"
ENVIRONMENTS["test,user"]="mali-espocrm-admin"
ENVIRONMENTS["test,home"]="/home/mali-espocrm-admin"
ENVIRONMENTS["test,name"]="Test"

ENVIRONMENT=""

# Helper function to get environment value
get_env_value() {
    local env_key="${1},${2}"
    echo "${ENVIRONMENTS[$env_key]}"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        --vm-password)
            VM_PASSWORD="$2"
            shift 2
            ;;
        --sudo-password)
            SUDO_PASSWORD="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown parameter: $1${NC}"
            echo "Usage: $0 --environment <dev|test> [--vm-password PASSWORD] [--sudo-password PASSWORD]"
            exit 1
            ;;
    esac
done

# If no environment specified, show usage and exit
if [[ -z "$ENVIRONMENT" ]]; then
    echo ""
    echo -e "${GREEN}EspoCRM Extension Deployment${NC}"
    echo -e "${GREEN}============================${NC}"
    echo ""
    echo -e "${CYAN}Usage:${NC}"
    echo -e "${WHITE}$0 --environment <dev|test> [--vm-password PASSWORD] [--sudo-password PASSWORD]${NC}"
    echo ""
    echo -e "${CYAN}Available environments:${NC}"
    echo -e "${GRAY}  dev  - Development environment${NC}"
    echo -e "${GRAY}  test - Test environment${NC}"
    echo ""
    echo -e "${CYAN}Password options:${NC}"
    echo -e "${GRAY}  --vm-password    - SSH password (if not using SSH keys)${NC}"
    echo -e "${GRAY}  --sudo-password  - Sudo password (for test environment)${NC}"
    echo ""
    echo -e "${CYAN}Examples:${NC}"
    echo -e "${WHITE}  $0 --environment dev${NC}"
    echo -e "${WHITE}  $0 --environment test --sudo-password mypassword${NC}"
    echo ""
    echo -e "${YELLOW}Note: Passwords can also be set via environment variables:${NC}"
    echo -e "${GRAY}  export VM_PASSWORD=mypassword${NC}"
    echo -e "${GRAY}  export SUDO_PASSWORD=mysudopassword${NC}"
    echo ""
    exit 1
fi

# Convert environment to lowercase
ENVIRONMENT=$(echo "$ENVIRONMENT" | tr '[:upper:]' '[:lower:]')

# Validate environment
if [[ "$ENVIRONMENT" != "dev" && "$ENVIRONMENT" != "test" ]]; then
    echo -e "${RED}Invalid environment '$ENVIRONMENT'. Use 'dev' or 'test'.${NC}"
    echo -e "${YELLOW}Usage: $0 --environment dev${NC}"
    echo -e "${YELLOW}       $0 --environment test${NC}"
    exit 1
fi

# Get environment details using associative array
VM_HOST=$(get_env_value "$ENVIRONMENT" "host")
VM_USER=$(get_env_value "$ENVIRONMENT" "user")
VM_HOME=$(get_env_value "$ENVIRONMENT" "home")
ENV_NAME=$(get_env_value "$ENVIRONMENT" "name")

# Verify we got valid configuration
if [[ -z "$VM_HOST" || -z "$VM_USER" || -z "$VM_HOME" || -z "$ENV_NAME" ]]; then
    echo -e "${RED}Error: Invalid environment configuration for '$ENVIRONMENT'${NC}"
    echo -e "${YELLOW}Available environments: dev, test${NC}"
    exit 1
fi

EXTENSION_NAME="ibf-dashboard-extension"

echo -e "${GREEN}EspoCRM Extension Deployment${NC}"
echo -e "${GREEN}============================${NC}"
echo -e "${CYAN}Environment: $ENV_NAME ($ENVIRONMENT)${NC}"
echo -e "${CYAN}Target: $VM_USER@$VM_HOST${NC}"
echo -e "${CYAN}Home Directory: $VM_HOME${NC}"
echo ""

# Step 1: Build web component
echo -e "${YELLOW}1. Building web component...${NC}"

# Navigate to IBF-dashboard directory and build web component
DASHBOARD_DIR="../IBF-dashboard"
if [[ ! -d "$DASHBOARD_DIR" ]]; then
    echo -e "${RED}IBF-dashboard directory not found at $DASHBOARD_DIR!${NC}"
    exit 1
fi

if [[ ! -f "$DASHBOARD_DIR/build-web-component.sh" ]]; then
    echo -e "${RED}build-web-component.sh not found in $DASHBOARD_DIR!${NC}"
    exit 1
fi

# Execute the web component build script with better error handling
echo -e "${GRAY}   Building web component in $DASHBOARD_DIR${NC}"
cd "$DASHBOARD_DIR" || {
    echo -e "${RED}Failed to navigate to $DASHBOARD_DIR${NC}"
    exit 1
}

if ! ./build-web-component.sh; then
    echo -e "${RED}Failed to build web component!${NC}"
    cd - >/dev/null || true
    exit 1
fi

cd - >/dev/null || {
    echo -e "${YELLOW}Warning: Could not return to original directory${NC}"
}

echo -e "${GREEN}Web component built successfully!${NC}"

# Step 2: Build extension with better error handling
echo -e "${YELLOW}2. Building extension...${NC}"
if ! ./create-extension.sh --patch; then
    echo -e "${RED}Failed to build extension!${NC}"
    exit 1
fi

# Step 3: Determine the actual package filename after build (version may have been incremented)
# Extract version from manifest.json using cross-platform compatible method
VERSION=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[^"]*"' manifest.json | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')

if [[ -z "$VERSION" ]]; then
    echo -e "${RED}Error: Could not find version in manifest.json${NC}"
    exit 1
fi

# Check for both .zip and .tar.gz package formats
ZIP_PACKAGE="$EXTENSION_NAME-v$VERSION.zip"
TAR_PACKAGE="$EXTENSION_NAME-v$VERSION.tar.gz"

if [[ -f "$ZIP_PACKAGE" ]]; then
    PACKAGE_FILE="$ZIP_PACKAGE"
    PACKAGE_FORMAT="ZIP"
elif [[ -f "$TAR_PACKAGE" ]]; then
    PACKAGE_FILE="$TAR_PACKAGE"
    PACKAGE_FORMAT="TAR.GZ"
else
    echo -e "${RED}No package file found! Expected either:${NC}"
    echo -e "${RED}  - $ZIP_PACKAGE${NC}"
    echo -e "${RED}  - $TAR_PACKAGE${NC}"
    exit 1
fi

echo -e "${GREEN}Package created: $PACKAGE_FILE ($PACKAGE_FORMAT format)${NC}"

# Step 4: Transfer to VM
echo -e "${YELLOW}4. Transferring package to VM...${NC}"

# Check if sshpass is available for password authentication
if command -v sshpass >/dev/null 2>&1; then
    echo -e "${GRAY}   Using sshpass for password authentication${NC}"
    printf "Enter password for $VM_USER@$VM_HOST: "
    if ! read -rs VM_PASSWORD; then
        echo ""
        echo -e "${RED}Error: Failed to read password${NC}"
        exit 1
    fi
    echo ""
    
    if ! sshpass -p "$VM_PASSWORD" scp "$PACKAGE_FILE" "$VM_USER@$VM_HOST:$VM_HOME/"; then
        echo -e "${RED}Transfer failed with sshpass!${NC}"
        exit 1
    fi
else
    echo -e "${GRAY}   Using SSH key or interactive password authentication${NC}"
    if ! scp "$PACKAGE_FILE" "$VM_USER@$VM_HOST:$VM_HOME/"; then
        echo -e "${RED}Transfer failed!${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}Package transferred successfully!${NC}"

# Step 5: Execute installation script on remote VM
echo ""
echo -e "${YELLOW}5. Running installation script on remote VM...${NC}"

# For test environment, we need to handle sudo password
if [[ "$ENVIRONMENT" == "test" ]]; then
    echo -e "${GRAY}   Test environment detected - handling sudo authentication${NC}"
    printf "Enter sudo password for $VM_USER: "
    if ! read -rs SUDO_PASSWORD; then
        echo ""
        echo -e "${RED}Error: Failed to read sudo password${NC}"
        exit 1
    fi
    echo ""
    
    if command -v sshpass >/dev/null 2>&1 && [[ -n "$VM_PASSWORD" ]]; then
        echo -e "${GRAY}   Executing remote installation with sshpass and sudo password${NC}"
        if ! sshpass -p "$VM_PASSWORD" ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && echo '$SUDO_PASSWORD' | sudo -S ./install-extension.sh"; then
            INSTALL_EXIT_CODE=1
        else
            INSTALL_EXIT_CODE=0
        fi
    else
        echo -e "${GRAY}   Executing remote installation with SSH key and sudo password${NC}"
        if ! ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && echo '$SUDO_PASSWORD' | sudo -S ./install-extension.sh"; then
            INSTALL_EXIT_CODE=1
        else
            INSTALL_EXIT_CODE=0
        fi
    fi
else
    # Dev environment with passwordless sudo
    if command -v sshpass >/dev/null 2>&1 && [[ -n "$VM_PASSWORD" ]]; then
        echo -e "${GRAY}   Executing remote installation with sshpass${NC}"
        if ! sshpass -p "$VM_PASSWORD" ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && ./install-extension.sh"; then
            INSTALL_EXIT_CODE=1
        else
            INSTALL_EXIT_CODE=0
        fi
    else
        echo -e "${GRAY}   Executing remote installation with SSH key/interactive auth${NC}"
        if ! ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && ./install-extension.sh"; then
            INSTALL_EXIT_CODE=1
        else
            INSTALL_EXIT_CODE=0
        fi
    fi
fi

if [[ $INSTALL_EXIT_CODE -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}✅ Extension installation completed successfully!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Your EspoCRM instance now has the IBF Dashboard extension installed!${NC}"
    echo -e "${CYAN}You can now access the IBF Dashboard in your EspoCRM interface.${NC}"
else
    echo -e "${RED}❌ Installation failed with exit code: $INSTALL_EXIT_CODE${NC}"
    echo ""
    echo -e "${YELLOW}Manual installation instructions:${NC}"
    echo -e "${CYAN}==============================${NC}"
    echo ""
    echo -e "${YELLOW}1. SSH into your VM:${NC}"
    echo -e "${WHITE}   ssh $VM_USER@$VM_HOST${NC}"
    echo ""
    echo -e "${YELLOW}2. Navigate to home directory and run the installation script:${NC}"
    echo -e "${WHITE}   cd $VM_HOME${NC}"
    echo -e "${WHITE}   ./install-extension.sh${NC}"
    echo ""
    echo -e "${GRAY}The script will:${NC}"
    echo -e "${GRAY}   - Move $PACKAGE_FILE to /var/www/espocrm/extensions/${NC}"
    echo -e "${GRAY}   - Install the extension via EspoCRM command (supports both ZIP and TAR.GZ)${NC}"
    echo -e "${GRAY}   - Clear cache${NC}"
    echo -e "${GRAY}   - Clean up the package file${NC}"
    echo ""
    echo -e "${GREEN}After installation, check your EspoCRM instance for the IBF Dashboard!${NC}"
    exit 1
fi

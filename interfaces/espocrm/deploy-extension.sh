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

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -e|--environment)
            ENVIRONMENT="$2"
            shift 2
            ;;
        *)
            echo -e "${RED}Unknown parameter: $1${NC}"
            echo "Usage: $0 --environment <dev|test>"
            exit 1
            ;;
    esac
done

# If no environment specified, show menu
if [[ -z "$ENVIRONMENT" ]]; then
    echo ""
    echo -e "${GREEN}EspoCRM Extension Deployment${NC}"
    echo -e "${GREEN}============================${NC}"
    echo ""
    echo -e "${CYAN}Available environments:${NC}"
    echo -e "${GRAY}1. Development (dev)${NC}"
    echo -e "${GRAY}2. Test (test)${NC}"
    echo ""
    
    while [[ -z "$ENVIRONMENT" ]]; do
        echo -n "Select environment to deploy to (1-2, or type name): "
        read choice
        
        case $choice in
            1)
                ENVIRONMENT="dev"
                ;;
            2)
                ENVIRONMENT="test"
                ;;
            dev|test)
                ENVIRONMENT="$choice"
                ;;
            *)
                echo -e "${RED}Invalid selection. Please choose 1-2 or type: dev, test${NC}"
                ;;
        esac
    done
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

# Get environment details
VM_HOST="${ENVIRONMENTS[$ENVIRONMENT,host]}"
VM_USER="${ENVIRONMENTS[$ENVIRONMENT,user]}"
VM_HOME="${ENVIRONMENTS[$ENVIRONMENT,home]}"
ENV_NAME="${ENVIRONMENTS[$ENVIRONMENT,name]}"

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

# Execute the web component build script
echo -e "${GRAY}   Building web component in $DASHBOARD_DIR${NC}"
(cd "$DASHBOARD_DIR" && ./build-web-component.sh)

if [[ $? -ne 0 ]]; then
    echo -e "${RED}Failed to build web component!${NC}"
    exit 1
fi

echo -e "${GREEN}Web component built successfully!${NC}"

# Step 2: Build extension
echo -e "${YELLOW}2. Building extension...${NC}"
./create-extension.sh --patch

if [[ $? -ne 0 ]]; then
    echo -e "${RED}Failed to build extension!${NC}"
    exit 1
fi

# Step 3: Determine the actual package filename after build (version may have been incremented)
# Extract version from manifest.json using pure bash
VERSION=""
if [[ -f "manifest.json" ]]; then
    while IFS= read -r line; do
        # Look for version line and extract value
        if [[ $line =~ \"version\"[[:space:]]*:[[:space:]]*\"([^\"]+)\" ]]; then
            VERSION="${BASH_REMATCH[1]}"
            break
        fi
    done < "manifest.json"
fi

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
if command -v sshpass &> /dev/null; then
    echo -e "${GRAY}   Using sshpass for password authentication${NC}"
    echo -n "Enter password for $VM_USER@$VM_HOST: "
    read -s VM_PASSWORD
    echo ""
    sshpass -p "$VM_PASSWORD" scp "$PACKAGE_FILE" "$VM_USER@$VM_HOST:$VM_HOME/"
else
    echo -e "${GRAY}   Using SSH key or interactive password authentication${NC}"
    scp "$PACKAGE_FILE" "$VM_USER@$VM_HOST:$VM_HOME/"
fi

if [[ $? -ne 0 ]]; then
    echo -e "${RED}Transfer failed!${NC}"
    exit 1
fi

echo -e "${GREEN}Package transferred successfully!${NC}"

# Step 5: Execute installation script on remote VM
echo ""
echo -e "${YELLOW}5. Running installation script on remote VM...${NC}"

# For test environment, we need to handle sudo password
if [[ "$ENVIRONMENT" == "test" ]]; then
    echo -e "${GRAY}   Test environment detected - handling sudo authentication${NC}"
    echo -n "Enter sudo password for $VM_USER: "
    read -s SUDO_PASSWORD
    echo ""
    
    if command -v sshpass &> /dev/null && [[ -n "$VM_PASSWORD" ]]; then
        echo -e "${GRAY}   Executing remote installation with sshpass and sudo password${NC}"
        sshpass -p "$VM_PASSWORD" ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && echo '$SUDO_PASSWORD' | sudo -S ./install-extension.sh"
    else
        echo -e "${GRAY}   Executing remote installation with SSH key and sudo password${NC}"
        ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && echo '$SUDO_PASSWORD' | sudo -S ./install-extension.sh"
    fi
else
    # Dev environment with passwordless sudo
    if command -v sshpass &> /dev/null && [[ -n "$VM_PASSWORD" ]]; then
        echo -e "${GRAY}   Executing remote installation with sshpass${NC}"
        sshpass -p "$VM_PASSWORD" ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && ./install-extension.sh"
    else
        echo -e "${GRAY}   Executing remote installation with SSH key/interactive auth${NC}"
        ssh "$VM_USER@$VM_HOST" "cd $VM_HOME && chmod +x install-extension.sh && ./install-extension.sh"
    fi
fi

INSTALL_EXIT_CODE=$?

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

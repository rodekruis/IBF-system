#!/bin/bash

# Function to commit changes to ibf-svelte branch
commit_to_ibf_svelte() {
    echo -e "\033[36mCommitting changes to current branch...\033[0m"
    
    # Navigate to project root (2 levels up from IBF-dashboard)
    cd ../../ || {
        echo -e "\033[31mError: Cannot navigate to project root\033[0m"
        return 1
    }
    
    # Check if there are any changes to commit
    if git diff --quiet && git diff --staged --quiet; then
        echo -e "\033[32mNo changes to commit.\033[0m"
        cd - > /dev/null
        return 0
    fi
    
    # Add all changes (excluding problematic files)
    echo -e "\033[37mAdding all changes...\033[0m"
    
    # Remove the problematic 'nul' file if it exists
    if [ -f "interfaces/IBF-dashboard/nul" ]; then
        rm -f "interfaces/IBF-dashboard/nul"
        echo -e "\033[33mRemoved problematic 'nul' file\033[0m"
    fi
    
    # Add files, excluding known problematic ones
    git add . --ignore-errors 2>/dev/null || {
        echo -e "\033[33mTrying alternative add method...\033[0m"
        # Try adding with more specific exclusions
        git add . || {
            echo -e "\033[31mError: Failed to add changes\033[0m"
            cd - > /dev/null
            return 1
        }
    }
    
    # Check again if there are changes to commit after cleanup
    if git diff --cached --quiet; then
        echo -e "\033[32mNo changes to commit after cleanup.\033[0m"
        cd - > /dev/null
        return 0
    fi
    
    # Create commit with timestamp
    commit_message="Auto-commit from run-both-windows.sh - $(date '+%Y-%m-%d %H:%M:%S')"
    echo -e "\033[37mCommitting with message: $commit_message\033[0m"
    git commit -m "$commit_message" || {
        echo -e "\033[31mError: Failed to commit changes\033[0m"
        cd - > /dev/null
        return 1
    }
    
    echo -e "\033[32mSuccessfully committed changes!\033[0m"
    cd - > /dev/null
    return 0
}

# Function to stop all servers
stop_all_servers() {
    echo -e "\033[33mStopping all servers...\033[0m"
    
    # Kill processes on specific ports
    for port in 4200 8080; do
        echo -e "  \033[37mChecking port $port...\033[0m"
        
        # Find processes listening on the port
        if command -v netstat >/dev/null 2>&1; then
            pids=$(netstat -ano 2>/dev/null | grep ":$port " | grep "LISTENING" | awk '{print $NF}' | sort -u)
        elif command -v lsof >/dev/null 2>&1; then
            pids=$(lsof -ti :$port 2>/dev/null)
        else
            echo -e "    \033[31mCannot check port - neither netstat nor lsof available\033[0m"
            continue
        fi
        
        if [ -n "$pids" ]; then
            for pid in $pids; do
                if [ "$pid" != "" ] && kill -0 "$pid" 2>/dev/null; then
                    process_name=$(ps -p "$pid" -o comm= 2>/dev/null || echo "unknown")
                    kill -TERM "$pid" 2>/dev/null || kill -KILL "$pid" 2>/dev/null
                    echo -e "    \033[32mStopped $process_name (PID: $pid)\033[0m"
                fi
            done
        else
            echo -e "    \033[32mPort $port is free\033[0m"
        fi
    done
    
    echo -e "\033[32mAll servers stopped!\033[0m"
}

# Function to show help
show_help() {
    echo -e "\033[36m"
    cat << 'EOF'
IBF Dashboard Dual Server Launcher - Usage
==========================================
EOF
    echo -e "\033[0m"
    echo -e "\033[37mUsage: $0 [OPTIONS]\033[0m"
    echo ""
    echo -e "\033[33mOptions:\033[0m"
    echo -e "  \033[32m--help, -h\033[0m         Show this help message"
    echo -e "  \033[32m--stop, -s\033[0m         Stop all running servers"
    echo -e "  \033[32m--no-commit\033[0m        Skip automatic git commit"
    echo ""
    echo -e "\033[33mDefault behavior:\033[0m"
    echo -e "  - Starts Angular dev server on port 4200"
    echo -e "  - Starts web component server on port 8080"
    echo -e "  - Automatically commits changes locally for monitoring"
    echo ""
}

# Parse command line arguments
SKIP_COMMIT=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            show_help
            exit 0
            ;;
        --stop|-s)
            stop_all_servers
            exit 0
            ;;
        --no-commit)
            SKIP_COMMIT=true
            shift
            ;;
        *)
            echo -e "\033[31mUnknown option: $1\033[0m"
            echo -e "\033[33mUse --help for usage information\033[0m"
            exit 1
            ;;
    esac
done

echo -e "\033[36m"
cat << 'EOF'
IBF Dashboard Dual Server Launcher - Separate Terminals
======================================================
Starting both servers in separate terminal windows...
Will auto-commit changes locally when both servers start (for change monitoring).

EOF
echo -e "\033[0m"

if [ "$SKIP_COMMIT" = true ]; then
    echo -e "\033[33mNote: Git auto-commit is disabled (--no-commit flag used)\033[0m"
    echo ""
fi

# Stop existing servers first
stop_all_servers

# Check we're in the right directory
current_dir=$(pwd)
echo -e "\033[37mWorking directory: $current_dir\033[0m"

if [ ! -f "package.json" ]; then
    echo -e "\033[31mError: package.json not found!\033[0m"
    echo -e "\033[33m   Make sure you're running this from the IBF-dashboard directory\033[0m"
    exit 1
fi

# Check for web component build
if [ ! -f "dist/web-component/browser/main.js" ]; then
    echo -e "\033[33mBuilding web component first...\033[0m"
    npx ng run app:build-web-component
    if [ $? -ne 0 ]; then
        echo -e "\033[31mWeb component build failed!\033[0m"
        exit 1
    fi
fi

echo ""
echo -e "\033[32mURLs will be available at:\033[0m"
echo -e "\033[37m  Regular Dashboard:    http://localhost:4200\033[0m"
echo -e "\033[37m  Web Component:        http://localhost:8080/test-web-component.html\033[0m"
echo ""

# Function to check if a port is listening
check_port() {
    local port=$1
    if command -v netstat >/dev/null 2>&1; then
        netstat -an 2>/dev/null | grep ":$port " | grep -q "LISTEN"
    elif command -v lsof >/dev/null 2>&1; then
        lsof -i :$port >/dev/null 2>&1
    else
        return 1
    fi
}

# Function to open new terminal (tries different terminal emulators)
open_terminal() {
    local title=$1
    local script_file=$2
    
    if command -v gnome-terminal >/dev/null 2>&1; then
        # GNOME Terminal (Ubuntu, etc.)
        gnome-terminal --title="$title" -- bash "$script_file" &
    elif command -v xterm >/dev/null 2>&1; then
        # X Terminal
        xterm -title "$title" -e bash "$script_file" &
    elif command -v konsole >/dev/null 2>&1; then
        # KDE Konsole
        konsole --title "$title" -e bash "$script_file" &
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        # Git Bash on Windows
        start bash "$script_file" &
    elif command -v cmd.exe >/dev/null 2>&1; then
        # Windows with cmd available
        cmd.exe /c start bash "$script_file" &
    else
        echo -e "\033[31mCannot open new terminal - no supported terminal emulator found\033[0m"
        echo -e "\033[33mTrying to run in background instead...\033[0m"
        return 1
    fi
    return 0
}

# Create temporary script files
temp_dir=$(mktemp -d)
angular_script="$temp_dir/angular-server.sh"
web_script="$temp_dir/web-server.sh"

# Create Angular server script
cat > "$angular_script" << EOF
#!/bin/bash
cd "$current_dir"
echo -e "\033[34mAngular Dev Server Starting...\033[0m"
echo -e "\033[32mURL: http://localhost:4200\033[0m"
echo -e "\033[33mPress Ctrl+C to stop this server\033[0m"
echo "================================"
npx ng serve --port 4200 --host localhost --disable-host-check
echo -e "\033[31mAngular server stopped!\033[0m"
echo "Press Enter to close..."
read
EOF

# Create Web component server script
cat > "$web_script" << EOF
#!/bin/bash
cd "$current_dir"
echo -e "\033[35mWeb Component Server Starting...\033[0m"
echo -e "\033[32mURL: http://localhost:8080/test-web-component.html\033[0m"
echo -e "\033[33mPress Ctrl+C to stop this server\033[0m"
echo "=========================================="
npx http-server -p 8080 --cors -c-1
echo -e "\033[31mWeb component server stopped!\033[0m"
echo "Press Enter to close..."
read
EOF

# Make scripts executable
chmod +x "$angular_script"
chmod +x "$web_script"

# Start Angular dev server in new terminal
echo -e "\033[34mStarting Angular dev server in new terminal...\033[0m"

if ! open_terminal "Angular Server" "$angular_script"; then
    # Fallback to background process
    echo -e "\033[33mRunning Angular server in background...\033[0m"
    (cd "$current_dir" && npx ng serve --port 4200 --host localhost --disable-host-check) &
    angular_pid=$!
fi

# Wait a moment then start web component server
sleep 2

echo -e "\033[35mStarting web component server in new terminal...\033[0m"

if ! open_terminal "Web Component Server" "$web_script"; then
    # Fallback to background process
    echo -e "\033[33mRunning web component server in background...\033[0m"
    (cd "$current_dir" && npx http-server -p 8080 --cors -c-1) &
    web_pid=$!
fi

echo ""
echo -e "\033[32mBoth servers are starting in separate terminals!\033[0m"
echo ""
echo -e "\033[33mManagement commands:\033[0m"
echo -e "\033[37m  To stop all servers: ./run-both-windows.sh --stop\033[0m"
echo -e "\033[37m  Or close the individual terminal windows\033[0m"
echo ""
echo -e "\033[37mThis terminal will monitor for server processes...\033[0m"

# Cleanup function for background processes
cleanup() {
    if [ -n "$angular_pid" ] && kill -0 "$angular_pid" 2>/dev/null; then
        kill -TERM "$angular_pid" 2>/dev/null
    fi
    if [ -n "$web_pid" ] && kill -0 "$web_pid" 2>/dev/null; then
        kill -TERM "$web_pid" 2>/dev/null
    fi
    stop_all_servers
    
    # Clean up temporary script files
    if [ -n "$temp_dir" ] && [ -d "$temp_dir" ]; then
        rm -rf "$temp_dir"
    fi
}

trap cleanup EXIT INT TERM

# Monitor for server processes
start_time=$(date +%s)
max_wait_for_startup=30
angular_started=false
web_started=false
git_committed=false

echo -e "\033[37mWaiting for servers to start in their terminals (max $max_wait_for_startup seconds)...\033[0m"

while true; do
    sleep 3
    
    current_time=$(date +%s)
    elapsed=$((current_time - start_time))
    
    # Check if servers are running
    angular_running=false
    web_running=false
    
    if check_port 4200; then
        angular_running=true
        if [ "$angular_started" = false ]; then
            angular_started=true
            echo -e "\033[32mAngular server started successfully on port 4200!\033[0m"
        fi
    else
        if [ "$angular_started" = true ]; then
            echo -e "\033[33mAngular server was stopped (port 4200 no longer listening)\033[0m"
            angular_started=false
        fi
    fi
    
    if check_port 8080; then
        web_running=true
        if [ "$web_started" = false ]; then
            web_started=true
            echo -e "\033[32mWeb component server started successfully on port 8080!\033[0m"
        fi
    else
        if [ "$web_started" = true ]; then
            echo -e "\033[33mWeb component server was stopped (port 8080 no longer listening)\033[0m"
            web_started=false
        fi
    fi
    
    # Commit to git when both servers are running (only once)
    if [ "$angular_started" = true ] && [ "$web_started" = true ] && [ "$git_committed" = false ] && [ "$SKIP_COMMIT" = false ]; then
        echo -e "\033[36mBoth servers are running! Committing changes locally...\033[0m"
        if commit_to_ibf_svelte; then
            git_committed=true
            echo -e "\033[32mChanges committed locally for monitoring!\033[0m"
        else
            echo -e "\033[31mFailed to commit changes, but continuing...\033[0m"
            git_committed=true  # Don't retry on failure
        fi
    elif [ "$angular_started" = true ] && [ "$web_started" = true ] && [ "$git_committed" = false ] && [ "$SKIP_COMMIT" = true ]; then
        git_committed=true  # Mark as "done" even though we skipped it
        echo -e "\033[33mBoth servers are running! (Skipping git commit as requested)\033[0m"
    fi
    
    # Exit conditions
    if [ "$angular_running" = false ] && [ "$web_running" = false ] && [ $elapsed -gt 10 ]; then
        echo -e "\033[31mBoth servers have stopped.\033[0m"
        break
    fi
    
    # Timeout for startup
    if [ $elapsed -gt $max_wait_for_startup ] && ([ "$angular_started" = false ] || [ "$web_started" = false ]); then
        echo -e "\033[33mTimeout waiting for servers to start. Check the individual terminal windows for errors.\033[0m"
        if [ "$angular_started" = false ]; then
            echo -e "\033[31m  Angular server did not start on port 4200\033[0m"
        fi
        if [ "$web_started" = false ]; then
            echo -e "\033[31m  Web component server did not start on port 8080\033[0m"
        fi
        echo -e "\033[37m  The script will continue monitoring in case they start later...\033[0m"
    fi
done

echo -e "\033[37mScript ended.\033[0m"

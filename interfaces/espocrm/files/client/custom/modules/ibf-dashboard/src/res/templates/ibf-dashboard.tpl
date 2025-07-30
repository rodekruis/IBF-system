<div class="ibf-dashboard-fullscreen">
    <div class="loading-container" id="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-message">Loading IBF Dashboard...</div>
    </div>
    
    <div class="web-component-container" id="dashboard-container" style="display: none;">
        <ibf-dashboard 
            id="ibf-dashboard-component"
            platform="espocrm"
            country-code="ETH"
            disaster-type="drought"
            theme="auto"
            language="en"
            features='["maps", "alerts", "indicators"]'>
        </ibf-dashboard>
    </div>
    
    <div class="error-container" id="error-container" style="display: none;">
        <h3>IBF Dashboard Error</h3>
        <p id="error-message">Failed to load dashboard</p>
        <button onclick="window.location.reload()">Reload Page</button>
    </div>
</div>

<style>
/* Fullscreen container that fills the entire content area */
.ibf-dashboard-fullscreen {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
    background: white;
}

/* Web Component Styling */
.web-component-container {
    height: 100%;
    width: 100%;
    background: white;
    position: relative;
}

ibf-dashboard {
    display: block;
    height: 100%;
    width: 100%;
    opacity: 0;
    transition: opacity 0.3s ease-in-out;
}

ibf-dashboard.loaded {
    opacity: 1;
}

/* Loading container */
.loading-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: white;
    z-index: 100;
    transition: opacity 0.3s ease-in-out;
}

.loading-container.hidden {
    opacity: 0;
    pointer-events: none;
}

.loading-spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 2s linear infinite;
    margin-bottom: 16px;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-message {
    font-size: 18px;
    color: #666;
}

/* Error message styling */
.error-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: #d32f2f;
    background: white;
    z-index: 100;
    padding: 20px;
    text-align: center;
}

.error-container h3 {
    color: #d32f2f;
    margin-bottom: 10px;
}

.error-container button {
    margin-top: 20px;
    padding: 10px 20px;
    background: #c8102e;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.error-container button:hover {
    background: #a00e26;
}

/* Override any EspoCRM content padding/margins */
.page[data-scope="IBFDashboard"] .page-content {
    padding: 0 !important;
    margin: 0 !important;
    overflow: hidden;
}

.page[data-scope="IBFDashboard"] .content {
    padding: 0 !important;
    margin: 0 !important;
    height: calc(100vh - 60px); /* Subtract header height */
    overflow: hidden;
}

/* Ensure the main container takes full space */
.page[data-scope="IBFDashboard"] {
    height: 100vh;
}

/* Page header styling */
.ibf-page-header {
    padding: 15px 20px;
    background: #f8f9fa;
    border-bottom: 1px solid #e5e5e5;
}

.ibf-page-header h1 {
    margin: 0;
    font-size: 24px;
    color: #333;
    font-weight: 600;
}

.ibf-page-header .breadcrumb {
    margin: 5px 0 0 0;
    background: none;
    padding: 0;
    font-size: 13px;
}

.ibf-page-header .breadcrumb li {
    color: #777;
}

.ibf-page-header .breadcrumb li + li:before {
    content: ">";
    padding: 0 8px;
    color: #ccc;
}

/* Dashboard controls */
.ibf-dashboard-container {
    position: relative;
    height: 100%;
    width: 100%;
}

.ibf-dashboard-controls {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 1000;
    background: rgba(255, 255, 255, 0.9);
    padding: 5px 10px;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.fullscreen-button {
    background: #007bff;
    color: white;
    border: none;
    padding: 5px 10px;
    border-radius: 3px;
    cursor: pointer;
    font-size: 12px;
}

.fullscreen-button:hover {
    background: #0056b3;
}
</style>

<div class="page-header ibf-page-header">
    <h1>IBF Dashboard</h1>
    <ol class="breadcrumb">
        <li>EspoCRM</li>
        <li class="active">IBF Dashboard</li>
    </ol>
</div>

<script>
// Initialize web component when template loads
(function() {
    console.log('🎯 IBF Dashboard Template: Initializing web component...');
    
    function loadWebComponentAssets() {
        console.log('📦 Loading IBF Dashboard web component assets...');
        
        const assetsBase = '/client/custom/modules/ibf-dashboard/assets';
        
        // Check if assets are already loaded
        if (window.customElements && window.customElements.get('ibf-dashboard')) {
            console.log('✅ Web component already loaded, initializing dashboard...');
            initializeDashboard();
            return;
        }

        // Load CSS first
        loadCSS(`${assetsBase}/ibf-dashboard.css`)
            .then(() => {
                console.log('✅ CSS loaded successfully');
                // Then load JavaScript
                return loadJS(`${assetsBase}/ibf-dashboard-bundle.js`);
            })
            .then(() => {
                console.log('✅ JavaScript loaded successfully');
                // Wait for web component to be defined
                return waitForWebComponent();
            })
            .then(() => {
                console.log('✅ Web component ready, initializing dashboard...');
                initializeDashboard();
            })
            .catch(error => {
                console.error('❌ Failed to load web component assets:', error);
                showError('Failed to load dashboard assets');
            });
    }

    function loadCSS(url) {
        return new Promise((resolve, reject) => {
            // Check if CSS is already loaded
            const existingLink = document.querySelector(`link[href="${url}"]`);
            if (existingLink) {
                resolve();
                return;
            }

            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = url;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`));
            document.head.appendChild(link);
        });
    }

    function loadJS(url) {
        return new Promise((resolve, reject) => {
            // Check if script is already loaded
            const existingScript = document.querySelector(`script[src="${url}"]`);
            if (existingScript) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load JavaScript: ${url}`));
            document.head.appendChild(script);
        });
    }

    function waitForWebComponent() {
        return new Promise((resolve, reject) => {
            let attempts = 0;
            const maxAttempts = 50; // 5 seconds total (100ms * 50)
            
            const checkComponent = () => {
                attempts++;
                
                if (window.customElements && window.customElements.get('ibf-dashboard')) {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('Web component failed to register within timeout'));
                } else {
                    setTimeout(checkComponent, 100);
                }
            };
            
            checkComponent();
        });
    }

    function initializeDashboard() {
        // Get authentication details (this should be implemented in the EspoCRM view)
        const token = 'ESPO_AUTH_TOKEN'; // This should be replaced with actual token
        const userId = 'ESPO_USER_ID'; // This should be replaced with actual user ID
        const parentUrl = window.location.origin + window.location.pathname;
        
        console.log('🔗 Initializing IBF Dashboard with authentication:', {
            token: token.substring(0, 10) + '...',
            userId: userId,
            parentUrl: parentUrl
        });

        // Hide loading and show dashboard
        const loadingContainer = document.getElementById('loading-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'block';

        // Configure the web component
        const dashboard = document.getElementById('ibf-dashboard-component');
        if (dashboard) {
            // Set authentication attributes
            dashboard.setAttribute('espo-token', token);
            dashboard.setAttribute('espo-user-id', userId);
            dashboard.setAttribute('parent-url', parentUrl);
            dashboard.setAttribute('environment', 'production');
            
            // Set up event listeners
            dashboard.addEventListener('dashboardReady', (event) => {
                console.log('✅ IBF Dashboard web component ready:', event.detail);
                if (loadingContainer) loadingContainer.classList.add('hidden');
                dashboard.classList.add('loaded');
            });
            
            dashboard.addEventListener('error', (event) => {
                console.error('❌ IBF Dashboard web component error:', event.detail);
                showError('Dashboard failed to initialize: ' + (event.detail?.message || 'Unknown error'));
            });
            
            console.log('✅ IBF Dashboard web component initialized with EspoCRM auth');
        } else {
            console.error('❌ Dashboard web component element not found');
            showError('Dashboard component not found');
        }
    }

    function showError(message) {
        console.error('IBF Dashboard Error:', message);
        const loadingContainer = document.getElementById('loading-container');
        const dashboardContainer = document.getElementById('dashboard-container');
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');
        
        if (loadingContainer) loadingContainer.style.display = 'none';
        if (dashboardContainer) dashboardContainer.style.display = 'none';
        if (errorContainer) errorContainer.style.display = 'flex';
        if (errorMessage) errorMessage.textContent = message;
    }

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadWebComponentAssets);
    } else {
        loadWebComponentAssets();
    }
})();
</script>

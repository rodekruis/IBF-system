define('ibf-dashboard:views/ibfdashboard', ['view', 'ibf-dashboard:services/ibf-auth'], function (Dep, IbfAuth) {
    
    console.log('🚀 IBF Dashboard module loading started');
    console.log('📦 Dependencies loaded:', { Dep: !!Dep, IbfAuth: !!IbfAuth });
    
    if (!Dep) {
        console.error('❌ Failed to load Dep (view) dependency');
        return null;
    }
    
    if (!IbfAuth) {
        console.error('❌ Failed to load IbfAuth service dependency');
        return null;
    }
    
    console.log('✅ All dependencies loaded successfully, creating view class');

    return Dep.extend({

        // Use inline template content instead of external template file
        templateContent: `
            <div class="ibf-dashboard-container">
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
                        api-base-url="https://ibf-test.510.global"
                        features='["maps", "alerts", "indicators"]'
                        embedded-mode="true"
                        espo-auth="true"
                        skip-login="true">
                    </ibf-dashboard>
                </div>
                
                <div class="error-container" id="error-container" style="display: none;">
                    <h3>IBF Dashboard Error</h3>
                    <p id="error-message">Failed to load dashboard</p>
                    <button onclick="window.location.reload()">Reload Page</button>
                </div>
            </div>

            <style>
            /* Override EspoCRM layout constraints for full width/height */
            body {
                overflow: hidden !important;
            }

            #header {
                position: relative !important;
                z-index: 1000;
            }

            .container.content {
                max-width: none !important;
                padding-left: 0 !important;
                padding-right: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: calc(100vh - 60px) !important;
                position: fixed !important;
                top: 60px !important;
                left: 0 !important;
                overflow: hidden !important;
            }

            #main {
                padding: 0 !important;
                margin: 0 !important;
                width: 100% !important;
                height: 100% !important;
            }

            #content {
                height: 100% !important;
                width: 100% !important;
                position: relative;
                padding: 0 !important;
                margin: 0 !important;
            }
            
            .ibf-dashboard-container {
                position: fixed !important;
                top: 60px !important;
                left: 0 !important;
                right: 0 !important;
                bottom: 0 !important;
                padding: 0;
                margin: 0;
                width: 100% !important;
                height: calc(100vh - 60px) !important;
                overflow: hidden;
                background: white;
                z-index: 10 !important;
            }

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
                background: #a00d25;
            }
            </style>
        `,

        data: function () {
            return {
                extensionVersion: '1.0.143',
                extensionBuildDate: '2025-07-29',
                countryCode: this.options.countryCode || 'ETH',
                embedPlatform: 'espocrm'
            };
        },

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log('IBF Dashboard: View setup started');
            
            // Initialize IBF authentication service with view context
            this.ibfAuth = new IbfAuth(this);
            console.log('🔑 IBF Authentication service initialized with view context');
            
            // Get country code from options or URL parameters
            this.countryCode = this.options.countryCode || this.getRouterParam('country') || 'ETH';
        },

        getRouterParam: function(param) {
            try {
                const router = this.getRouter();
                if (router && router.getCurrentUrl) {
                    const url = router.getCurrentUrl();
                    const urlParams = new URLSearchParams(url.split('?')[1] || '');
                    return urlParams.get(param);
                }
            } catch (e) {
                console.warn('Could not get router param:', e);
            }
            return null;
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            console.log('IBF Dashboard: View rendered, initializing web component...');
            
            // Ensure full height utilization
            setTimeout(() => {
                this.ensureFullHeight();
            }, 100); // Small delay to ensure DOM is ready
            
            // Load the web component after the view is rendered
            this.loadWebComponent();
        },

        loadWebComponent: function () {
            var self = this;
            
            console.log('📦 Loading IBF Dashboard web component assets (modular)...');
            
            const assetsBase = '/client/custom/modules/ibf-dashboard/assets';
            
            // Check if assets are already loaded
            if (window.customElements && window.customElements.get('ibf-dashboard')) {
                console.log('✅ Web component already loaded, initializing dashboard...');
                this.initializeDashboard();
                return;
            }

            // Load CSS first
            this.loadCSS(`${assetsBase}/styles.css`)
                .then(() => {
                    console.log('✅ CSS loaded successfully');
                    // Load main.js with ES6 module support (chunks and polyfills are handled automatically)
                    return self.loadJSModule(`${assetsBase}/main.js`);
                })
                .then(() => {
                    console.log('✅ Main module loaded successfully');
                    // Wait for web component to be defined
                    return self.waitForWebComponent();
                })
                .then(() => {
                    console.log('✅ Web component ready, initializing dashboard...');
                    self.initializeDashboard();
                })
                .catch(error => {
                    console.error('❌ Failed to load web component assets:', error);
                    self.showError('Failed to load dashboard assets: ' + error.message);
                });
        },

        loadCSS: function(url) {
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
        },

        loadJS: function(url) {
            return new Promise((resolve, reject) => {
                // Check if script is already loaded
                const existingScript = document.querySelector(`script[src="${url}"]`);
                if (existingScript) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = url;
                // Load as regular script (not ES6 module) for polyfills
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load JavaScript: ${url}`));
                document.head.appendChild(script);
            });
        },

        loadJSModule: function(url) {
            return new Promise((resolve, reject) => {
                // Check if module script is already loaded
                const existingScript = document.querySelector(`script[src="${url}"][type="module"]`);
                if (existingScript) {
                    resolve();
                    return;
                }

                const script = document.createElement('script');
                script.src = url;
                script.type = 'module'; // Enable ES6 module support for main.js and dynamic imports
                script.onload = () => resolve();
                script.onerror = () => reject(new Error(`Failed to load module: ${url}`));
                document.head.appendChild(script);
            });
        },

        waitForWebComponent: function() {
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
        },

        initializeDashboard: function() {
            console.log('🔗 Initializing IBF Dashboard web component...');

            // Hide loading and show dashboard
            const loadingContainer = this.$el.find('#loading-container');
            const dashboardContainer = this.$el.find('#dashboard-container');
            
            if (loadingContainer.length) loadingContainer.hide();
            if (dashboardContainer.length) dashboardContainer.show();

            // Configure the web component
            const dashboard = this.$el.find('#ibf-dashboard-component');
            if (dashboard.length > 0) {
                const dashboardElement = dashboard[0];
                
                // Remove any inline height style that might constrain the component
                dashboardElement.style.removeProperty('height');
                dashboardElement.style.removeProperty('max-height');
                console.log('🔧 Removed inline height constraints from IBF Dashboard component');
                
                // Set dynamic country code
                dashboardElement.setAttribute('country-code', this.countryCode);
                
                // Authenticate the dashboard before setting up other listeners
                this.ibfAuth.authenticateIbfDashboard(dashboardElement).then(function(success) {
                    if (success) {
                        console.log('✅ IBF Dashboard authentication successful');
                        // Set up dashboard event listeners after authentication
                        this.setupDashboardEventListeners(dashboardElement, loadingContainer, dashboard);
                    } else {
                        console.error('❌ IBF Dashboard authentication failed');
                        this.showError('Authentication failed. Please check your IBF credentials and try again.');
                    }
                }.bind(this)).catch(function(error) {
                    console.error('❌ IBF Dashboard authentication error:', error);
                    this.showError('Authentication error: ' + (error.message || 'Unknown error'));
                }.bind(this));
                
                console.log('✅ IBF Dashboard web component initialized for country:', this.countryCode);
                console.log('🧭 Angular routing will use EmbeddedLocationStrategy for EspoCRM compatibility');
            } else {
                console.error('❌ Dashboard web component element not found');
                this.showError('Dashboard component element not found');
            }
        },

        setupDashboardEventListeners: function(dashboardElement, loadingContainer, dashboard) {
            var self = this;
            
            // Set up event listeners
            dashboardElement.addEventListener('dashboardReady', function(event) {
                console.log('✅ IBF Dashboard web component ready:', event.detail);
                if (loadingContainer.length) loadingContainer.addClass('hidden');
                dashboard.addClass('loaded');
                
                // Ensure height is still unrestricted after component is ready
                dashboardElement.style.removeProperty('height');
                dashboardElement.style.removeProperty('max-height');
                
                // Force recalculation of heights and ensure full viewport usage
                self.ensureFullHeight();
                
                console.log('🔧 Re-ensured IBF Dashboard component has full height after ready event');
            });
            
            dashboardElement.addEventListener('error', function(event) {
                console.error('❌ IBF Dashboard web component error:', event.detail);
                self.showError('Dashboard failed to initialize: ' + (event.detail?.message || 'Unknown error'));
            });
            
            // Listen for authentication events
            dashboardElement.addEventListener('ibf-auth-ready', function(event) {
                console.log('✅ IBF authentication ready event received:', event.detail);
            });
            
            dashboardElement.addEventListener('ibf-auth-failed', function(event) {
                console.error('❌ IBF authentication failed event received:', event.detail);
                self.showError('Authentication failed: ' + (event.detail?.error || 'Unknown error'));
            });
            
            // Listen for token refresh requests
            dashboardElement.addEventListener('ibf-auth-refresh', function(event) {
                console.log('🔄 IBF token refresh requested');
                self.ibfAuth.refreshToken().then(function(token) {
                    dashboardElement.setAttribute('auth-token', token);
                    dashboardElement.authToken = token;
                    console.log('✅ IBF token refreshed successfully');
                }).catch(function(error) {
                    console.error('❌ IBF token refresh failed:', error);
                    self.showError('Token refresh failed: ' + (error.message || 'Unknown error'));
                });
            });
        },

        ensureFullHeight: function() {
            // Force the content container to take full height
            const content = document.querySelector('#content.container.content');
            const main = document.querySelector('#main[data-view-cid]');
            const dashboardElement = document.querySelector('#ibf-dashboard-component');
            
            if (content) {
                const headerHeight = document.querySelector('#header')?.offsetHeight || 60;
                const footerHeight = document.querySelector('#footer')?.offsetHeight || 0;
                const availableHeight = window.innerHeight - headerHeight - footerHeight;
                content.style.height = `${availableHeight}px`;
                content.style.minHeight = `${availableHeight}px`;
                
                // Set the CSS variable for the web component to use
                document.documentElement.style.setProperty('--ibf-app-height', `${availableHeight}px`);
                console.log('🔧 Set content height to:', availableHeight + 'px');
                console.log('🔧 Set --ibf-app-height CSS variable to:', availableHeight + 'px');
            }
            
            if (main) {
                main.style.height = '100%';
                main.style.minHeight = '100%';
            }
            
            if (dashboardElement) {
                dashboardElement.style.height = '100%';
                dashboardElement.style.minHeight = '100%';
                dashboardElement.style.removeProperty('max-height');
                
                // Don't set the height attribute - it's causing issues with Angular Elements
                // The component will use CSS height styling instead
            }
            
            // Also ensure our containers take full height
            if (this.$el) {
                const fullscreenContainer = this.$el.find('.ibf-dashboard-fullscreen');
                const webComponentContainer = this.$el.find('.web-component-container');
                
                if (fullscreenContainer.length) {
                    fullscreenContainer[0].style.height = '100%';
                    fullscreenContainer[0].style.minHeight = '100%';
                    // Ensure relative positioning is maintained
                    fullscreenContainer[0].style.position = 'relative';
                }
                
                if (webComponentContainer.length) {
                    webComponentContainer[0].style.height = '100%';
                    webComponentContainer[0].style.minHeight = '100%';
                }
            }
        },

        showError: function(message) {
            console.error('IBF Dashboard Error:', message);
            const loadingContainer = this.$el.find('#loading-container');
            const dashboardContainer = this.$el.find('#dashboard-container');
            const errorContainer = this.$el.find('#error-container');
            const errorMessage = this.$el.find('#error-message');
            
            if (loadingContainer.length) loadingContainer.hide();
            if (dashboardContainer.length) dashboardContainer.hide();
            if (errorContainer.length) errorContainer.show();
            if (errorMessage.length) errorMessage.text(message);
        },

        showAuthError: function(message) {
            console.error('IBF Authentication Error:', message);
            const errorContainer = this.$el.find('#error-container');
            const errorMessage = this.$el.find('#error-message');
            
            if (errorContainer.length) {
                errorContainer.show();
                if (errorMessage.length) {
                    errorMessage.html(`
                        <strong>Authentication Error</strong><br>
                        ${message}<br><br>
                        <button onclick="window.location.reload()">Retry Authentication</button>
                        <button onclick="this.ibfAuth.clearTokenCache(); window.location.reload()">Clear Cache & Retry</button>
                    `);
                }
            }
        },

        retryAuthentication: function() {
            console.log('🔄 Retrying IBF authentication...');
            const dashboardElement = this.$el.find('#ibf-dashboard-component')[0];
            if (dashboardElement) {
                this.ibfAuth.clearTokenCache();
                this.ibfAuth.authenticateIbfDashboard(dashboardElement).then(function(success) {
                    if (success) {
                        console.log('✅ Retry authentication successful');
                        window.location.reload(); // Reload to restart the dashboard
                    } else {
                        console.error('❌ Retry authentication failed');
                        this.showAuthError('Retry authentication failed. Please check your credentials.');
                    }
                }.bind(this));
            }
        },

        getHeader: function () {
            return this.translate('IBF Dashboard', 'labels', 'IBFDashboard') + 
                   (this.countryCode ? ' - ' + this.countryCode : '');
        },

        onRemove: function() {
            // Remove window resize listener
            if (this.resizeHandler) {
                window.removeEventListener('resize', this.resizeHandler);
            }
            
            // Clean up CSS variable
            document.documentElement.style.removeProperty('--ibf-app-height');
            
            Dep.prototype.onRemove.call(this);
        },

        openFullscreen: function() {
            try {
                console.log('IBF Dashboard: Opening fullscreen mode for web component');
                
                const mainComponent = this.$el.find('#ibf-dashboard-component')[0];
                const overlay = document.getElementById('fullscreen-overlay');
                const fullscreenComponent = document.getElementById('ibf-dashboard-fullscreen-component');
                
                if (!mainComponent || !overlay || !fullscreenComponent) {
                    console.error('IBF Dashboard: Required elements not found for fullscreen');
                    return;
                }
                
                // Copy all attributes from main component to fullscreen component
                Array.from(mainComponent.attributes).forEach(attr => {
                    fullscreenComponent.setAttribute(attr.name, attr.value);
                });
                
                // Ensure fullscreen component has full height before showing
                fullscreenComponent.style.height = '100vh';
                fullscreenComponent.style.width = '100vw';
                fullscreenComponent.style.minHeight = '100vh';
                fullscreenComponent.style.maxHeight = 'none';
                fullscreenComponent.style.position = 'relative';
                
                // Show fullscreen component and overlay
                fullscreenComponent.style.display = 'block';
                overlay.style.display = 'block';
                overlay.classList.add('active');
                document.body.classList.add('fullscreen-active');
                
                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
                
                // Force a reflow to ensure the height is applied
                setTimeout(() => {
                    if (fullscreenComponent) {
                        fullscreenComponent.style.height = '100vh';
                        fullscreenComponent.style.minHeight = '100vh';
                        console.log('🔧 Fullscreen component height set to 100vh');
                    }
                }, 50);
                
                // Add escape key listener
                this.escapeHandler = (e) => {
                    if (e.key === 'Escape') {
                        this.closeFullscreen();
                    }
                };
                document.addEventListener('keydown', this.escapeHandler);
                
                console.log('IBF Dashboard: Fullscreen mode activated for web component');
            } catch (error) {
                console.error('IBF Dashboard: Error in openFullscreen:', error);
            }
        },

        closeFullscreen: function() {
            try {
                console.log('IBF Dashboard: Closing fullscreen mode');
                
                const overlay = document.getElementById('fullscreen-overlay');
                const fullscreenComponent = document.getElementById('ibf-dashboard-fullscreen-component');
                
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.classList.remove('active');
                }
                
                // Hide fullscreen component
                if (fullscreenComponent) {
                    fullscreenComponent.style.display = 'none';
                }
                
                // Restore body scrolling and remove fullscreen class
                document.body.style.overflow = '';
                document.body.classList.remove('fullscreen-active');
                
                // Remove escape key listener
                if (this.escapeHandler) {
                    document.removeEventListener('keydown', this.escapeHandler);
                    this.escapeHandler = null;
                }
                
                console.log('IBF Dashboard: Fullscreen mode deactivated');
            } catch (error) {
                console.error('IBF Dashboard: Error in closeFullscreen:', error);
            }
        }

    });
    
    console.log('✅ IBF Dashboard view class created successfully');
    
}, function (error) {
    console.error('❌ Failed to load IBF Dashboard dependencies:', error);
    console.error('❌ Module loading error details:', {
        message: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString()
    });
});

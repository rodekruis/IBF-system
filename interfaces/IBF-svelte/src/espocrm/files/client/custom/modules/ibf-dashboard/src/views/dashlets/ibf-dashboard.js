define('ibf-dashboard:views/dashlets/ibf-dashboard', ['views/dashlets/abstract/base'], function (Dep) {
    
    return Dep.extend({

        name: 'IbfDashboard',

        templateContent: `
            <style>
                /* Keep EspoCRM header but optimize dashlet spacing */
                .dashlet-container,
                .dashlet,
                .dashlet-body {
                    height: calc(100vh - 150px) !important;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                }

                /* Remove dashlet panel styling to maximize space */
                #dashlet-{{id}} .panel {
                    margin: 0;
                    border: none;
                    box-shadow: none;
                }

                #dashlet-{{id}} .panel-body {
                    padding: 0;
                }

                #dashlet-{{id}} .panel-heading {
                    display: none;
                }

                #dashlet-{{id}} .dashlet-body {
                    height: 100%;
                    width: 100%;
                    display: flex;
                    flex-direction: column;
                    padding: 0;
                    margin: 0;
                    overflow: hidden;
                }

                #dashlet-{{id}} .dashlet-body iframe {
                    flex: 1;
                    width: 100%;
                    height: 100%;
                    border: none;
                    overflow: hidden;
                }

                .fullscreen-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 1000;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: background-color 0.3s;
                }

                .fullscreen-button:hover {
                    background: rgba(0, 0, 0, 0.9);
                }

                .fullscreen-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                    background: white;
                    z-index: 9999;
                    display: none;
                    overflow: hidden;
                }

                .fullscreen-overlay iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                    overflow: hidden;
                }

                .fullscreen-overlay .close-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 10000;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    padding: 8px 12px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }

                .fullscreen-overlay .close-button:hover {
                    background: rgba(0, 0, 0, 0.9);
                }
            </style>

            <div class="dashlet-body">
                <button class="fullscreen-button" data-action="openFullscreen">
                    ⛶ Fullscreen
                </button>
                <iframe 
                    id="ibf-dashboard-frame" 
                    src="{{iframeUrl}}" 
                    style="width: 100%; height: 100%; border: none; overflow: hidden;"
                    frameborder="0"
                    scrolling="no"
                    allowfullscreen 
                    allow="fullscreen">
                </iframe>
            </div>

            <div class="fullscreen-overlay" id="fullscreen-overlay-{{id}}">
                <button class="close-button" data-action="closeFullscreen">
                    ✕ Close
                </button>
                <iframe 
                    id="fullscreen-frame-{{id}}"
                    style="width: 100%; height: 100%; border: none; overflow: hidden;"
                    frameborder="0"
                    scrolling="no"
                    allowfullscreen 
                    allow="fullscreen">
                </iframe>
            </div>
        `,

        init: function () {
            Dep.prototype.init.call(this);
        },

        afterRender: function () {
            Dep.prototype.afterRender.call(this);
            
            // Debug: Log the dashlet ID to help with troubleshooting
            console.log('IBF Dashboard: Dashlet ID is:', this.id);
            console.log('IBF Dashboard: Expected overlay ID:', 'fullscreen-overlay-' + this.id);
            console.log('IBF Dashboard: Expected frame ID:', 'fullscreen-frame-' + this.id);
            
            this.loadDashboard();
            this.setupEventListeners();
        },

        setupEventListeners: function() {
            // Add event listeners for fullscreen buttons
            this.$el.find('[data-action="openFullscreen"]').on('click', () => {
                this.openFullscreen();
            });
            
            this.$el.find('[data-action="closeFullscreen"]').on('click', () => {
                this.closeFullscreen();
            });
        },

        loadDashboard: function () {
            // First get the server configuration to get the correct dashboard URL
            Espo.Ajax.getRequest('IBFDashboard').then(serverResponse => {
                // Use the dashboard URL from server configuration
                const dashboardUrl = serverResponse.dashboardUrl || 'https://ibf-pivot.510.global';
                
                console.log('🔗 Using configured dashboard URL in dashlet:', dashboardUrl);
                
                // Get user token and user ID
                this.getUserToken().then(token => {
                    const userId = this.getUser().id;
                    
                    // Add parameters to hide header and optimize for iframe embedding
                    const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}&embedded=true&hideHeader=true&fullWidth=true&fullscreenButton=true&loginOffset=60&espoAuth=true`;
                    
                    console.log('🔗 Loading IBF Dashboard with EspoCRM auth:', {
                        url: iframeUrl,
                        token: token.substring(0, 10) + '...',
                        userId: userId,
                        espoAuth: true
                    });
                    
                    // Update iframe src
                    const iframe = this.$el.find('#ibf-dashboard-frame');
                    iframe.attr('src', iframeUrl);
                }).catch(error => {
                    console.error('Failed to get user token for IBF Dashboard:', error);
                    this.$el.find('.dashlet-body').html('<p>Authentication failed</p>');
                });
                
            }).catch(error => {
                console.error('Failed to load IBF Dashboard configuration:', error);
                // Fall back to hardcoded URL if config fails
                this.loadDashboardFallback();
            });
        },

        loadDashboardFallback: function () {
            console.log('🔄 Loading IBF Dashboard with fallback URL');
            
            // Get user token and user ID
            this.getUserToken().then(token => {
                // Use fallback URL
                const dashboardUrl = 'https://ibf-pivot.510.global';
                const userId = this.getUser().id;
                
                // Add parameters to hide header and optimize for iframe embedding
                const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}&embedded=true&hideHeader=true&fullWidth=true&fullscreenButton=true&loginOffset=60&espoAuth=true`;
                
                console.log('🔗 Loading IBF Dashboard (fallback) with EspoCRM auth:', {
                    url: iframeUrl,
                    token: token.substring(0, 10) + '...',
                    userId: userId,
                    espoAuth: true
                });
                
                // Update iframe src
                const iframe = this.$el.find('#ibf-dashboard-frame');
                iframe.attr('src', iframeUrl);
            }).catch(error => {
                console.error('Failed to load IBF Dashboard fallback:', error);
                this.$el.find('.dashlet-body').html('<p>Failed to load dashboard</p>');
            });
        },

        getUserToken: function () {
            return new Promise((resolve, reject) => {
                const authToken = this.getUser().get('token') || 
                                 this.getStorage().get('user', 'auth-token') ||
                                 this.getCookie('auth-token');
                
                if (authToken) {
                    resolve(authToken);
                    return;
                }

                reject(new Error('No authentication token available'));
            });
        },

        getCookie: function(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        },

        openFullscreen: function() {
            try {
                // Get current iframe src
                const iframe = this.$el.find('#ibf-dashboard-frame');
                const iframeSrc = iframe.attr('src');
                
                if (!iframeSrc) {
                    console.error('IBF Dashboard: No iframe source found');
                    return;
                }
                
                // Try to find fullscreen elements using multiple methods
                let overlay, fullscreenFrame;
                
                // Method 1: Try by ID (original approach)
                const overlayId = 'fullscreen-overlay-' + this.id;
                const frameId = 'fullscreen-frame-' + this.id;
                
                overlay = document.getElementById(overlayId);
                fullscreenFrame = document.getElementById(frameId);
                
                // Method 2: If ID approach fails, use DOM traversal within the dashlet
                if (!overlay || !fullscreenFrame) {
                    console.warn('IBF Dashboard: ID method failed, trying DOM traversal');
                    overlay = this.$el.find('.fullscreen-overlay').get(0);
                    fullscreenFrame = this.$el.find('.fullscreen-overlay iframe').get(0);
                }
                
                if (!overlay) {
                    console.error('IBF Dashboard: Fullscreen overlay not found with any method');
                    return;
                }
                
                if (!fullscreenFrame) {
                    console.error('IBF Dashboard: Fullscreen frame not found with any method');
                    return;
                }
                
                // Copy iframe src to fullscreen iframe
                fullscreenFrame.src = iframeSrc;
                
                // Show overlay
                overlay.style.display = 'block';
                
                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
                
                // Add escape key listener
                this.escapeHandler = (e) => {
                    if (e.key === 'Escape') {
                        this.closeFullscreen();
                    }
                };
                document.addEventListener('keydown', this.escapeHandler);
                
                console.log('IBF Dashboard: Fullscreen mode activated');
            } catch (error) {
                console.error('IBF Dashboard: Error in openFullscreen:', error);
            }
        },

        closeFullscreen: function() {
            try {
                // Try to find fullscreen elements using multiple methods
                let overlay, fullscreenFrame;
                
                // Method 1: Try by ID (original approach)
                const overlayId = 'fullscreen-overlay-' + this.id;
                const frameId = 'fullscreen-frame-' + this.id;
                
                overlay = document.getElementById(overlayId);
                fullscreenFrame = document.getElementById(frameId);
                
                // Method 2: If ID approach fails, use DOM traversal within the dashlet
                if (!overlay || !fullscreenFrame) {
                    console.warn('IBF Dashboard: ID method failed in close, trying DOM traversal');
                    overlay = this.$el.find('.fullscreen-overlay').get(0);
                    fullscreenFrame = this.$el.find('.fullscreen-overlay iframe').get(0);
                }
                
                if (overlay) {
                    overlay.style.display = 'none';
                } else {
                    console.warn('IBF Dashboard: Fullscreen overlay not found for closing');
                }
                
                // Restore body scrolling
                document.body.style.overflow = '';
                
                // Remove escape key listener
                if (this.escapeHandler) {
                    document.removeEventListener('keydown', this.escapeHandler);
                    this.escapeHandler = null;
                }
                
                // Clear fullscreen iframe src to save resources
                if (fullscreenFrame) {
                    fullscreenFrame.src = 'about:blank';
                } else {
                    console.warn('IBF Dashboard: Fullscreen frame not found for cleanup');
                }
                
                console.log('IBF Dashboard: Fullscreen mode deactivated');
            } catch (error) {
                console.error('IBF Dashboard: Error in closeFullscreen:', error);
            }
        }
    });
});
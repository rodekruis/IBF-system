define(['view'], (View) => {

    return class extends View {

        // Use inline template for full control
        templateContent = `
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
                    height: calc(100vh - 60px) !important; /* Account for header */
                    position: fixed !important;
                    top: 60px !important; /* Header height */
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

                #content iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                /* Add message to iframe via data attribute for login styling */
                #content::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    right: 60px; /* Reserve space for fullscreen button */
                    width: 200px;
                    height: 50px;
                    z-index: -1; /* Behind iframe but available for CSS detection */
                    pointer-events: none;
                }

                #footer {
                    display: none !important;
                }

                .fullscreen-button {
                    position: absolute;
                    top: 10px;
                    right: 10px; /* Back to far right */
                    z-index: 1001; /* Higher than iframe content */
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    border: none;
                    padding: 8px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px;
                    transition: background-color 0.3s;
                    min-width: 36px;
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2); /* Add shadow for better visibility */
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
                    z-index: 99999 !important; /* Much higher z-index to override EspoCRM header */
                    display: none;
                }

                /* Hide EspoCRM elements when fullscreen overlay is active */
                .fullscreen-overlay.active ~ * #header,
                body.fullscreen-active #header,
                body.fullscreen-active #footer {
                    display: none !important;
                }

                body.fullscreen-active {
                    overflow: hidden !important;
                }

                .fullscreen-overlay iframe {
                    width: 100%;
                    height: 100%;
                    border: none;
                }

                .fullscreen-overlay .close-button {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 100000 !important; /* Even higher to stay on top of iframe */
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    padding: 8px 10px; /* Consistent with fullscreen button */
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 16px; /* Match fullscreen button */
                    min-width: 36px; /* Consistent size */
                    height: 36px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .fullscreen-overlay .close-button:hover {
                    background: rgba(0, 0, 0, 0.9);
                }

                .loading-message {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    font-size: 16px;
                    color: #666;
                }
            </style>

            <div id="content">
                <button class="fullscreen-button" data-action="openFullscreen" title="Fullscreen">
                    ⛶
                </button>
                <div class="loading-message">Loading IBF Dashboard...</div>
                <iframe 
                    id="ibf-dashboard-main-frame" 
                    style="width: 100%; height: 100%; border: none; display: none;"
                    frameborder="0"
                    allowfullscreen 
                    allow="fullscreen">
                </iframe>
            </div>

            <div class="fullscreen-overlay" id="fullscreen-overlay-main">
                <button class="close-button" data-action="closeFullscreen" title="Close Fullscreen">
                    ✕
                </button>
                <iframe 
                    id="fullscreen-frame-main"
                    style="width: 100%; height: 100%; border: none;"
                    frameborder="0"
                    allowfullscreen 
                    allow="fullscreen">
                </iframe>
            </div>
        `

        setup() {
            // Set page title
            this.headerHtml = '';
            
            // Ensure this is treated as a full-page view
            this.isRoot = true;
        }

        afterRender() {
            super.afterRender();
            
            console.log('IBF Dashboard: Full-page view rendered');
            
            this.loadDashboard();
            this.setupEventListeners();
        }

        setupEventListeners() {
            // Add event listeners for fullscreen buttons
            this.$el.find('[data-action="openFullscreen"]').on('click', () => {
                this.openFullscreen();
            });
            
            this.$el.find('[data-action="closeFullscreen"]').on('click', () => {
                this.closeFullscreen();
            });
        }

        loadDashboard() {
            // Get user token and user ID (same logic as dashlet)
            this.getUserToken().then(token => {
                // Use the same production URL as the dashlet
                const dashboardUrl = 'https://ibf-pivot.510.global';
                const userId = this.getUser().id;
                const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}&embedded=true&fullscreenButton=true&loginOffset=60`;
                
                console.log('🔗 Loading IBF Dashboard (full-page) with EspoCRM auth:', {
                    url: iframeUrl,
                    token: token.substring(0, 10) + '...',
                    userId: userId
                });
                
                // Update iframe src and show it
                const iframe = this.$el.find('#ibf-dashboard-main-frame');
                const loadingMessage = this.$el.find('.loading-message');
                
                iframe.attr('src', iframeUrl);
                
                // Show iframe and hide loading message once loaded
                iframe.on('load', () => {
                    loadingMessage.hide();
                    iframe.show();
                });
                
            }).catch(error => {
                console.error('Failed to load IBF Dashboard (full-page):', error);
                this.$el.find('#content').html('<div class="loading-message">Failed to load dashboard</div>');
            });
        }

        getUserToken() {
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
        }

        getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        openFullscreen() {
            try {
                // Get current iframe src
                const iframe = this.$el.find('#ibf-dashboard-main-frame');
                const iframeSrc = iframe.attr('src');
                
                if (!iframeSrc) {
                    console.error('IBF Dashboard (full-page): No iframe source found');
                    return;
                }
                
                // Get fullscreen elements
                const overlay = document.getElementById('fullscreen-overlay-main');
                const fullscreenFrame = document.getElementById('fullscreen-frame-main');
                
                if (!overlay || !fullscreenFrame) {
                    console.error('IBF Dashboard (full-page): Fullscreen elements not found');
                    return;
                }
                
                // Copy iframe src to fullscreen iframe
                fullscreenFrame.src = iframeSrc;
                
                // Show overlay and add body class
                overlay.style.display = 'block';
                overlay.classList.add('active');
                document.body.classList.add('fullscreen-active');
                
                // Prevent body scrolling
                document.body.style.overflow = 'hidden';
                
                // Add escape key listener
                this.escapeHandler = (e) => {
                    if (e.key === 'Escape') {
                        this.closeFullscreen();
                    }
                };
                document.addEventListener('keydown', this.escapeHandler);
                
                console.log('IBF Dashboard (full-page): Fullscreen mode activated');
            } catch (error) {
                console.error('IBF Dashboard (full-page): Error in openFullscreen:', error);
            }
        }

        closeFullscreen() {
            try {
                const overlay = document.getElementById('fullscreen-overlay-main');
                const fullscreenFrame = document.getElementById('fullscreen-frame-main');
                
                if (overlay) {
                    overlay.style.display = 'none';
                    overlay.classList.remove('active');
                }
                
                // Restore body scrolling and remove fullscreen class
                document.body.style.overflow = '';
                document.body.classList.remove('fullscreen-active');
                
                // Remove escape key listener
                if (this.escapeHandler) {
                    document.removeEventListener('keydown', this.escapeHandler);
                    this.escapeHandler = null;
                }
                
                // Clear fullscreen iframe src to save resources
                if (fullscreenFrame) {
                    fullscreenFrame.src = 'about:blank';
                }
                
                console.log('IBF Dashboard (full-page): Fullscreen mode deactivated');
            } catch (error) {
                console.error('IBF Dashboard (full-page): Error in closeFullscreen:', error);
            }
        }
    }
});
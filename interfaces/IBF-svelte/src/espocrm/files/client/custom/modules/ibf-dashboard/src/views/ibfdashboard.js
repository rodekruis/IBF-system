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
                    opacity: 0;
                    transition: opacity 0.3s ease-in-out;
                }

                #content iframe.loaded {
                    opacity: 1;
                }

                .loading-message {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 18px;
                    color: #666;
                    background: white;
                    z-index: 100;
                    transition: opacity 0.3s ease-in-out;
                }

                .loading-message.hidden {
                    opacity: 0;
                    pointer-events: none;
                }

                /* Fullscreen button - positioned absolutely */
                .fullscreen-button {
                    position: fixed;
                    top: 70px; /* Below header */
                    right: 15px;
                    z-index: 10000;
                    background: rgba(0, 0, 0, 0.7);
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    padding: 8px 12px;
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
                    opacity: 1; /* Fullscreen iframe should be immediately visible */
                }

                .fullscreen-close {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    z-index: 100000;
                    background: rgba(255, 0, 0, 0.8);
                    color: white;
                    border: none;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 16px;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                }

                .fullscreen-close:hover {
                    background: rgba(255, 0, 0, 1);
                }
            </style>

            <div id="content">
                <div class="loading-message">Loading IBF Dashboard...</div>
                <iframe id="ibf-dashboard-main-frame"></iframe>
                <button class="fullscreen-button" data-action="openFullscreen" title="Open in fullscreen">⛶</button>
            </div>

            <!-- Fullscreen overlay -->
            <div id="fullscreen-overlay-main" class="fullscreen-overlay">
                <iframe id="fullscreen-frame-main"></iframe>
                <button class="fullscreen-close" data-action="closeFullscreen" title="Close fullscreen">×</button>
            </div>
        `;

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

      // Add event listeners for fullscreen buttons
      this.$el.find('[data-action="openFullscreen"]').on('click', () => {
        this.openFullscreen();
      });

      this.$el.find('[data-action="closeFullscreen"]').on('click', () => {
        this.closeFullscreen();
      });
    }

    loadDashboard() {
      // First get the server configuration to get the correct dashboard URL
      Espo.Ajax.getRequest('IBFDashboard')
        .then((serverResponse) => {
          // Use the dashboard URL from server configuration
          const dashboardUrl =
            serverResponse.dashboardUrl || 'https://ibf-pivot.510.global';

          console.log('🔗 Using configured dashboard URL:', dashboardUrl);

          // Get user token and user ID
          this.getUserToken()
            .then((token) => {
              const userId = this.getUser().id;

              // Get current EspoCRM base URL for auto-detection
              const parentUrl = encodeURIComponent(
                window.location.origin + window.location.pathname,
              );

              // Add configuration URLs from EspoCRM settings
              const configParams = [];
              if (serverResponse.ibfBackendApiUrl) {
                configParams.push(
                  `ibfBackendApiUrl=${encodeURIComponent(serverResponse.ibfBackendApiUrl)}`,
                );
              }
              if (serverResponse.ibfGeoserverUrl) {
                configParams.push(
                  `ibfGeoserverUrl=${encodeURIComponent(serverResponse.ibfGeoserverUrl)}`,
                );
              }

              const configString =
                configParams.length > 0 ? '&' + configParams.join('&') : '';
              const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}&embedded=true&fullscreenButton=true&loginOffset=60&espoAuth=true&parentUrl=${parentUrl}${configString}`;

              console.log(
                '🔗 Loading IBF Dashboard (full-page) with EspoCRM auth and configuration:',
                {
                  url: iframeUrl,
                  token: token.substring(0, 10) + '...',
                  userId: userId,
                  parentUrl: decodeURIComponent(parentUrl),
                  ibfBackendApiUrl: serverResponse.ibfBackendApiUrl,
                  ibfGeoserverUrl: serverResponse.ibfGeoserverUrl,
                  espoAuth: true,
                },
              );

              // Update iframe src and show it
              const iframe = this.$el.find('#ibf-dashboard-main-frame');
              const loadingMessage = this.$el.find('.loading-message');

              iframe.attr('src', iframeUrl);

              iframe.on('load', () => {
                // Hide loading message and show iframe
                loadingMessage.addClass('hidden');
                iframe.addClass('loaded');
                console.log('✅ IBF Dashboard (full-page) loaded successfully');
              });

              iframe.on('error', () => {
                console.error(
                  '❌ Failed to load IBF Dashboard iframe (full-page)',
                );
                loadingMessage.html(
                  'Failed to load dashboard - please try refreshing the page',
                );
              });
            })
            .catch((error) => {
              console.error(
                'Failed to get user token for IBF Dashboard:',
                error,
              );
              this.$el
                .find('#content')
                .html(
                  '<div class="loading-message">Authentication failed</div>',
                );
            });
        })
        .catch((error) => {
          console.error('Failed to load IBF Dashboard configuration:', error);
          // Fall back to hardcoded URL if config fails
          this.loadDashboardFallback();
        });
    }

    loadDashboardFallback() {
      console.log('🔄 Loading IBF Dashboard with fallback URL');

      // Get user token and user ID
      this.getUserToken()
        .then((token) => {
          // Use fallback URL
          const dashboardUrl = 'https://ibf-pivot.510.global';
          const userId = this.getUser().id;

          // Get current EspoCRM base URL for auto-detection
          const parentUrl = encodeURIComponent(
            window.location.origin + window.location.pathname,
          );

          // Add fallback configuration URLs
          const configParams = [
            `ibfBackendApiUrl=${encodeURIComponent('https://ibf-pivot.510.global/api')}`,
            `ibfGeoserverUrl=${encodeURIComponent('https://ibf.510.global/geoserver/ibf-system/wms')}`,
          ];

          const configString = '&' + configParams.join('&');
          const iframeUrl = `${dashboardUrl}?espoToken=${token}&espoUserId=${userId}&embedded=true&fullscreenButton=true&loginOffset=60&espoAuth=true&parentUrl=${parentUrl}${configString}`;

          console.log(
            '🔗 Loading IBF Dashboard (fallback) with EspoCRM auth and fallback configuration:',
            {
              url: iframeUrl,
              token: token.substring(0, 10) + '...',
              userId: userId,
              parentUrl: decodeURIComponent(parentUrl),
              espoAuth: true,
            },
          );

          // Update iframe src and show it
          const iframe = this.$el.find('#ibf-dashboard-main-frame');
          const loadingMessage = this.$el.find('.loading-message');

          iframe.attr('src', iframeUrl);

          iframe.on('load', () => {
            // Hide loading message and show iframe
            loadingMessage.addClass('hidden');
            iframe.addClass('loaded');
            console.log('✅ IBF Dashboard (fallback) loaded successfully');
          });

          iframe.on('error', () => {
            console.error('❌ Failed to load IBF Dashboard iframe (fallback)');
            loadingMessage.html(
              'Failed to load dashboard - please try refreshing the page',
            );
          });
        })
        .catch((error) => {
          console.error(
            'Failed to get user token for IBF Dashboard fallback:',
            error,
          );
          this.$el
            .find('#content')
            .html('<div class="loading-message">Authentication failed</div>');
        });
    }

    getUserToken() {
      return new Promise((resolve, reject) => {
        const authToken =
          this.getUser().get('token') ||
          this.getStorage().get('user', 'auth-token');

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
        const iframe = this.$el.find('#ibf-dashboard-main-frame');
        const overlay = document.getElementById('fullscreen-overlay-main');
        const fullscreenFrame = document.getElementById(
          'fullscreen-frame-main',
        );

        if (!iframe.length || !overlay || !fullscreenFrame) {
          console.error(
            'IBF Dashboard (full-page): Required elements not found for fullscreen',
          );
          return;
        }

        const iframeSrc = iframe.attr('src');
        console.log(
          'IBF Dashboard: Fullscreen - Original iframe src:',
          iframeSrc,
        );

        if (!iframeSrc || iframeSrc === 'about:blank' || iframeSrc === '') {
          console.error(
            'IBF Dashboard (full-page): No iframe source available for fullscreen',
          );
          return;
        }

        // Copy iframe src to fullscreen iframe and ensure it's visible
        fullscreenFrame.src = iframeSrc;
        fullscreenFrame.style.opacity = '1';

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

        console.log(
          'IBF Dashboard (full-page): Fullscreen mode activated with src:',
          iframeSrc,
        );
      } catch (error) {
        console.error(
          'IBF Dashboard (full-page): Error in openFullscreen:',
          error,
        );
      }
    }

    closeFullscreen() {
      try {
        const overlay = document.getElementById('fullscreen-overlay-main');
        const fullscreenFrame = document.getElementById(
          'fullscreen-frame-main',
        );

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
        console.error(
          'IBF Dashboard (full-page): Error in closeFullscreen:',
          error,
        );
      }
    }
  };
});

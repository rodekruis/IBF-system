/**
 * IBF Authentication Service for EspoCRM
 * Handles secure token acquisition and management for IBF Dashboard
 */
define('ibf-dashboard:services/ibf-auth', ['ajax'], function (Ajax) {
    'use strict';
    
    console.log('🔑 IBF Auth service loading started');
    console.log('📦 Ajax dependency loaded:', !!Ajax);
    
    if (!Ajax) {
        console.error('❌ Failed to load Ajax dependency for IBF Auth service');
        return null;
    }

    var IbfAuth = function (view) {
        this.view = view; // Store the view context to access getUser()
        this.tokenExpiration = 3600000; // 1 hour in milliseconds
    };

    _.extend(IbfAuth.prototype, {
        
        /**
         * Get IBF token - uses EspoCRM's PHP controller for secure authentication
         */
        getIbfToken: function() {
            console.log('🔍 Debug: getIbfToken called - getting IBF backend token via EspoCRM controller');
            
            var self = this;
            return new Promise(function(resolve, reject) {
                try {
                    // Get EspoCRM auth token and user info for logging
                    var user = self.view.getUser();
                    console.log('🔍 Debug: Got user from context:', user);
                    
                    if (!user) {
                        throw new Error('No user available');
                    }
                    
                    var userId = user.id;
                    var userName = user.get('userName') || user.get('name') || 'unknown';
                    var userEmail = user.get('emailAddress') || 'unknown@example.com';
                    console.log('🔍 Debug: User info:', { id: userId, name: userName, email: userEmail });
                    
                    // Call EspoCRM controller to get IBF token (controller handles all the backend logic)
                    self.requestIbfToken()
                        .then(function(token) {
                            console.log('✅ Successfully acquired IBF backend token');
                            resolve(token);
                        })
                        .catch(function(error) {
                            console.error('❌ Failed to acquire IBF token from EspoCRM controller:', error.message);
                            reject(error);
                        });
                    
                } catch (error) {
                    console.error('❌ Error in getIbfToken:', error);
                    reject(error);
                }
            });
        },

        /**
         * Request IBF token using EspoCRM's PHP controller
         */
        requestIbfToken: function() {
            var self = this;
            return new Promise(function(resolve, reject) {
                console.log('🌐 Requesting IBF token via EspoCRM controller...');
                
                // Use EspoCRM's Ajax to call our PHP controller
                Ajax.getRequest('IBFDashboard/IbfAuth/getToken')
                    .then(function(response) {
                        console.log('📋 EspoCRM controller response:', response);
                        
                        if (response && response.success && response.token) {
                            console.log('✅ Received IBF token from EspoCRM controller');
                            resolve(response.token);
                        } else {
                            var errorMsg = response && response.error ? response.error : 'Invalid response from EspoCRM controller';
                            console.error('❌ EspoCRM controller error:', errorMsg);
                            reject(new Error(errorMsg));
                        }
                    })
                    .catch(function(error) {
                        console.error('❌ EspoCRM controller request failed:', error);
                        reject(error);
                    });
            });
        },

        /**
         * Send token to IBF Dashboard web component using sessionStorage
         */
        sendTokenToIbfDashboard: function(token) {
            // Store token in sessionStorage for IBF Dashboard to pick up
            sessionStorage.setItem('ibf-backend-token', token);
            
            // Dispatch event to notify IBF Dashboard that authentication is ready
            var event = new CustomEvent('ibf-auth-ready', {
                detail: { 
                    token: token,
                    platform: 'espocrm',
                    source: 'espocrm-session'
                }
            });
            window.dispatchEvent(event);
            
            console.log('✅ Token sent to IBF Dashboard via sessionStorage and event');
        },

        /**
         * Authenticate IBF Dashboard with proper token management
         */
        authenticateIbfDashboard: function(dashboardElement) {
            console.log('🔑 Authenticating IBF Dashboard...');
            
            var self = this;
            return this.getIbfToken().then(function(token) {
                // Send token via secure sessionStorage method
                self.sendTokenToIbfDashboard(token);
                
                // Set dashboard attributes for embedded mode
                var user = self.view.getUser();
                var userId = user ? user.id : 'unknown';
                var userName = user ? (user.get('userName') || user.get('name') || 'unknown') : 'unknown';
                
                dashboardElement.setAttribute('platform', 'espocrm');
                dashboardElement.setAttribute('embedded-mode', 'true');
                dashboardElement.setAttribute('skip-login', 'true');
                dashboardElement.setAttribute('espo-user-id', userId);
                dashboardElement.setAttribute('espo-user-name', userName);
                
                console.log('✅ IBF Dashboard authenticated successfully');
                return true;
            }).catch(function(error) {
                console.error('❌ IBF Dashboard authentication failed:', error);
                
                // Dispatch auth failure event
                var event = new CustomEvent('ibf-auth-failed', {
                    detail: { 
                        error: error.message || 'Authentication failed',
                        platform: 'espocrm'
                    }
                });
                window.dispatchEvent(event);
                
                return false;
            });
        },

        /**
         * Clear cached authentication data
         */
        clearAuth: function() {
            sessionStorage.removeItem('ibf-backend-token');
            console.log('🧹 IBF authentication data cleared');
        }
    });

    return IbfAuth;
    
    console.log('✅ IBF Auth service created successfully');
    
}, function (error) {
    console.error('❌ Failed to load IBF Auth service dependencies:', error);
    console.error('❌ Service loading error details:', {
        message: error?.message,
        stack: error?.stack,
        timestamp: new Date().toISOString()
    });
});

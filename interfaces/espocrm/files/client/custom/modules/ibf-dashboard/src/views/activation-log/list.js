/**
 * Custom list view for ActivationLog with URL parameter filtering
 * Filters activation logs based on countryCodeISO3 and disasterType URL parameters
 * Similar to early-action/list.js implementation
 * 
 * URL format: /#ActivationLog?countryCodeISO3=ETH&disasterType=drought
 * 
 * @version 1.0.333
 */
define('custom:views/activation-log/list', ['views/list'], function (Dep) {
    
    return Dep.extend({
        
        /**
         * Setup method called during view initialization
         */
        setup: function () {
            // Call parent setup first
            Dep.prototype.setup.call(this);
            
            // Parse URL parameters for filtering
            this.parseUrlParameters();
            
            console.log('ActivationLog List View: Setup completed with URL filtering');
        },
        
        /**
         * Parse URL hash parameters and apply filters
         */
        parseUrlParameters: function () {
            try {
                var urlParams = this.getUrlParameters();
                var hasFilters = false;
                
                if (urlParams.countryCodeISO3 || urlParams.disasterType) {
                    console.log('ActivationLog List View: Found URL parameters:', urlParams);
                    
                    // Store original collection fetch method
                    var originalFetch = this.collection.fetch.bind(this.collection);
                    
                    // Override collection fetch to include URL-based filtering
                    this.collection.fetch = function(options) {
                        options = options || {};
                        options.data = options.data || {};
                        
                        // Build whereGroup for server-side filtering
                        var whereGroup = [];
                        
                        if (urlParams.countryCodeISO3) {
                            whereGroup.push({
                                field: 'countryCodeISO3',
                                type: 'equals',
                                value: urlParams.countryCodeISO3
                            });
                            hasFilters = true;
                        }
                        
                        if (urlParams.disasterType) {
                            whereGroup.push({
                                field: 'disasterType', 
                                type: 'equals',
                                value: urlParams.disasterType
                            });
                            hasFilters = true;
                        }
                        
                        if (whereGroup.length > 0) {
                            options.data.whereGroup = whereGroup;
                            console.log('ActivationLog List View: Applying server-side filters:', whereGroup);
                        }
                        
                        return originalFetch(options);
                    };
                    
                    // Show search panel by default when filters are applied
                    if (hasFilters) {
                        this.searchPanel = true;
                        console.log('ActivationLog List View: Enabled search panel for filtered view');
                    }
                }
            } catch (e) {
                console.error('ActivationLog List View: Error parsing URL parameters:', e);
            }
        },
        
        /**
         * Extract parameters from URL hash
         * @returns {Object} Object containing URL parameters
         */
        getUrlParameters: function () {
            var params = {};
            var hash = window.location.hash;
            
            if (hash && hash.indexOf('?') !== -1) {
                var queryString = hash.split('?')[1];
                if (queryString) {
                    var pairs = queryString.split('&');
                    for (var i = 0; i < pairs.length; i++) {
                        var pair = pairs[i].split('=');
                        if (pair.length === 2) {
                            params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
                        }
                    }
                }
            }
            
            return params;
        }
    });
});

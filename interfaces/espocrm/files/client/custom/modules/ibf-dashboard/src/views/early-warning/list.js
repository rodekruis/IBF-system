/**
 * Custom list view for EarlyWarning with URL parameter filtering
 * 
 * This view enables filtering of EarlyWarning records based on URL parameters
 * passed from the IBF Dashboard. It extracts countryCodeISO3 and disasterType
 * URL format: /#EarlyWarning?countryCodeISO3=ETH&disasterType=drought
 * 
 * The filtering is implemented server-side using EspoCRM's whereGroup parameter
 * to ensure optimal performance and proper integration with EspoCRM's 
 * pagination and search functionality.
 */
define('custom:views/early-warning/list', ['views/list'], function (Dep) {
    
    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);
            
            // Apply URL-based filtering if parameters are present
            this.applyUrlFilters();
            
            console.log('EarlyWarning List View: Setup completed with URL filtering');
        },

        applyUrlFilters: function () {
            try {
                // Parse URL parameters from the current location
                const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
                
                if (urlParams.size > 0) {
                    console.log('EarlyWarning List View: Found URL parameters:', urlParams);
                    
                    const countryCodeISO3 = urlParams.get('countryCodeISO3');
                    const disasterType = urlParams.get('disasterType');
                    
                    // Build server-side filter conditions
                    const whereGroup = [];
                    
                    if (countryCodeISO3) {
                        whereGroup.push({
                            'type': 'equals',
                            'attribute': 'countryCodeISO3',
                            'value': countryCodeISO3
                        });
                    }
                    
                    if (disasterType) {
                        whereGroup.push({
                            'type': 'equals', 
                            'attribute': 'disasterType',
                            'value': disasterType
                        });
                    }
                    
                    if (whereGroup.length > 0) {
                        // Apply server-side filtering via collection parameters
                        if (!this.collection.whereFunction) {
                            this.collection.whereFunction = function () {
                                return whereGroup;
                            };
                            
                            console.log('EarlyWarning List View: Applying server-side filters:', whereGroup);
                            
                            // Reset collection to apply new filters
                            this.collection.reset();
                            this.collection.fetch();
                        }
                        
                        // Enable search panel for filtered views
                        this.searchManager.set({
                            advanced: {},
                            primary: {},
                            bool: {},
                            whereFunction: function () {
                                return whereGroup;
                            }
                        });
                        
                        console.log('EarlyWarning List View: Enabled search panel for filtered view');
                    }
                }
            } catch (e) {
                console.error('EarlyWarning List View: Error parsing URL parameters:', e);
            }
        }
    });
});

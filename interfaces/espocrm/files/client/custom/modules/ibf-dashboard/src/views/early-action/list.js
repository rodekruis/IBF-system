define('modules/ibf-dashboard/views/early-action/list', ['views/list'], function (Dep) {
    
    return Dep.extend({
        
        // Re-enable search panel
        searchPanel: true,
        
        setup: function () {
            console.log('IBF Dashboard Extension Version: 1.0.333');
            console.log('EarlyAction List View - Setup called with search panel integration');
            
            // Call parent setup first
            Dep.prototype.setup.call(this);
            
            // Apply URL filters by modifying the collection's fetch parameters
            this.applyUrlFiltersToCollection();
            
            // Ensure search panel shows the applied filters
            this.setupSearchPanelWithFilters();
        },
        
        applyUrlFiltersToCollection: function() {
            console.log('Applying URL filters to collection fetch parameters');
            
            const urlParams = this.getUrlParameters();
            if (!urlParams || (!urlParams.placeCode && !urlParams.disasterType)) {
                console.log('No URL parameters found, using default collection behavior');
                return;
            }
            
            console.log('Found URL parameters:', urlParams);
            console.log('Building where clauses for API request');
            
            // Build EspoCRM where clauses for the API request
            const where = [];
            
            if (urlParams.placeCode) {
                // Use 'equals' for exact placeCode match
                where.push({
                    type: 'equals',
                    attribute: 'placeCode',
                    value: urlParams.placeCode
                });
                console.log('Added placeCode filter:', urlParams.placeCode);
            }
            
            if (urlParams.disasterType) {
                // Use 'equals' for exact disasterType match  
                where.push({
                    type: 'equals',
                    attribute: 'disasterType',
                    value: urlParams.disasterType.toLowerCase()
                });
                console.log('Added disasterType filter:', urlParams.disasterType.toLowerCase());
            }
            
            if (where.length > 0) {
                console.log('Setting collection where clauses:', where);
                
                // Set the where clauses on the collection - this will be used in the API request
                this.collection.where = where;
                
                // Override the collection's fetch method to ensure where clauses are sent
                const originalFetch = this.collection.fetch.bind(this.collection);
                this.collection.fetch = function(options) {
                    options = options || {};
                    
                    // Ensure our where clauses are included in the request
                    if (!options.data) {
                        options.data = {};
                    }
                    
                    // Add where clauses to the API request
                    where.forEach(function(clause, index) {
                        const key = `whereGroup[${index}]`;
                        options.data[key + '[type]'] = clause.type;
                        options.data[key + '[attribute]'] = clause.attribute;
                        options.data[key + '[value]'] = clause.value;
                    });
                    
                    console.log('API request data with filters:', options.data);
                    
                    return originalFetch(options);
                };
                
                // Show filter status immediately
                this.showFilterStatus(urlParams);
                
                console.log('Collection configured with URL filters - API will fetch filtered data');
            }
        },
        
        setupSearchPanelWithFilters: function() {
            console.log('Setting up search panel with URL filters');
            
            const urlParams = this.getUrlParameters();
            if (!urlParams || (!urlParams.placeCode && !urlParams.disasterType)) {
                console.log('No URL parameters for search panel');
                return;
            }
            
            // Wait for the search panel to be created
            this.once('after:render', function() {
                console.log('Applying URL filters to search panel after render');
                this.applyFiltersToSearchPanel(urlParams);
            }.bind(this));
            
            // Also try with a delay as fallback
            setTimeout(function() {
                console.log('Applying URL filters to search panel with delay');
                this.applyFiltersToSearchPanel(urlParams);
            }.bind(this), 1000);
        },
        
        applyFiltersToSearchPanel: function(urlParams) {
            console.log('Applying filters to search panel:', urlParams);
            
            // Get the search manager
            const searchManager = this.getSearchManager();
            if (!searchManager) {
                console.log('Search manager not available yet');
                return;
            }
            
            console.log('Found search manager, applying filters');
            
            // Build the advanced search data
            const advanced = {};
            
            if (urlParams.placeCode) {
                advanced.placeCode = {
                    type: 'equals',
                    value: urlParams.placeCode
                };
                console.log('Added placeCode to search panel:', urlParams.placeCode);
            }
            
            if (urlParams.disasterType) {
                advanced.disasterType = {
                    type: 'equals',
                    value: urlParams.disasterType.toLowerCase()
                };
                console.log('Added disasterType to search panel:', urlParams.disasterType.toLowerCase());
            }
            
            // Apply the advanced search
            console.log('Setting advanced search data:', advanced);
            searchManager.set({
                advanced: advanced
            });
            
            // Force the search panel to update its display
            if (this.searchView && this.searchView.updateAddFilters) {
                console.log('Updating search panel display');
                this.searchView.updateAddFilters();
            }
            
            // Also try to trigger a search panel refresh
            if (this.searchView && this.searchView.render) {
                console.log('Re-rendering search panel');
                this.searchView.render();
            }
        },
        
        getUrlParameters: function() {
            console.log('Parsing URL parameters');
            
            const hash = window.location.hash;
            const queryIndex = hash.indexOf('?');
            
            if (queryIndex === -1) {
                return null;
            }
            
            const queryString = hash.substring(queryIndex + 1);
            const urlParams = new URLSearchParams(queryString);
            
            const placeCode = urlParams.get('placeCode');
            const disasterType = urlParams.get('disasterType');
            
            if (!placeCode && !disasterType) {
                return null;
            }
            
            return {
                placeCode: placeCode,
                disasterType: disasterType
            };
        },
        
        showFilterStatus: function(params) {
            console.log('Showing filter status for:', params);
            
            const filterInfo = [];
            if (params.placeCode) filterInfo.push(`Place: ${params.placeCode}`);
            if (params.disasterType) filterInfo.push(`Type: ${params.disasterType}`);
            
            if (filterInfo.length > 0) {
                const filterText = `<div class="alert alert-info" style="margin: 10px 0; padding: 10px; background-color: #d9edf7; border: 1px solid #bce8f1; color: #31708f; border-radius: 4px;">
                    <strong>🔍 Active Filters:</strong> ${filterInfo.join(', ')} <em>(Server-side filtered)</em>
                </div>`;
                
                // Add filter status after view renders
                this.once('after:render', function() {
                    console.log('Adding server-side filter status to DOM');
                    if (this.$el && this.$el.length) {
                        // Remove any existing filter status first
                        this.$el.find('.alert-info').remove();
                        this.$el.prepend(filterText);
                        console.log('Server-side filter status added to DOM');
                    }
                }.bind(this));
                
                // Also try with a delay as fallback
                setTimeout(function() {
                    if (this.$el && this.$el.length && this.$el.find('.alert-info').length === 0) {
                        this.$el.prepend(filterText);
                        console.log('Server-side filter status added via delayed method');
                    }
                }.bind(this), 500);
            }
        }
    });
});

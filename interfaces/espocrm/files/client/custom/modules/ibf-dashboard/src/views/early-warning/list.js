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
    // Re-enable search panel
    searchPanel: true,

    setup: function () {
      console.log(
        'EarlyWarning List View - Setup called with search panel integration',
      );

      // Call parent setup first
      Dep.prototype.setup.call(this);

      // Apply URL filters by modifying the collection's fetch parameters
      this.applyUrlFiltersToCollection();

      // Ensure search panel shows the applied filters
      this.setupSearchPanelWithFilters();

      console.log('EarlyWarning List View: Setup completed with URL filtering');
    },

    applyUrlFiltersToCollection: function () {
      console.log(
        'EarlyWarning List View: Applying URL filters to collection fetch parameters',
      );

      const urlParams = this.getUrlParameters();
      if (
        !urlParams ||
        (!urlParams.countryCodeISO3 && !urlParams.disasterType)
      ) {
        console.log(
          'EarlyWarning List View: No URL parameters found, using default collection behavior',
        );
        return;
      }

      console.log('EarlyWarning List View: Found URL parameters:', urlParams);
      console.log(
        'EarlyWarning List View: Building where clauses for API request',
      );

      // Build EspoCRM where clauses for the API request
      const where = [];

      if (urlParams.countryCodeISO3) {
        // Use 'equals' for exact countryCodeISO3 match
        where.push({
          type: 'equals',
          attribute: 'countryCodeISO3',
          value: urlParams.countryCodeISO3,
        });
        console.log(
          'EarlyWarning List View: Added countryCodeISO3 filter:',
          urlParams.countryCodeISO3,
        );
      }

      if (urlParams.disasterType) {
        // Use 'equals' for exact disasterType match
        where.push({
          type: 'equals',
          attribute: 'disasterType',
          value: urlParams.disasterType.toLowerCase(),
        });
        console.log(
          'EarlyWarning List View: Added disasterType filter:',
          urlParams.disasterType.toLowerCase(),
        );
      }

      if (where.length > 0) {
        console.log(
          'EarlyWarning List View: Setting collection where clauses:',
          where,
        );

        // Set the where clauses on the collection - this will be used in the API request
        this.collection.where = where;

        // Override the collection's fetch method to ensure where clauses are sent
        const originalFetch = this.collection.fetch.bind(this.collection);
        this.collection.fetch = function (options) {
          options = options || {};

          // Ensure our where clauses are included in the request
          if (!options.data) {
            options.data = {};
          }

          // Add where clauses to the API request
          where.forEach(function (clause, index) {
            const key = `whereGroup[${index}]`;
            options.data[key + '[type]'] = clause.type;
            options.data[key + '[attribute]'] = clause.attribute;
            options.data[key + '[value]'] = clause.value;
          });

          console.log(
            'EarlyWarning List View: API request data with filters:',
            options.data,
          );

          return originalFetch(options);
        };

        // Show filter status immediately
        this.showFilterStatus(urlParams);

        console.log(
          'EarlyWarning List View: Collection configured with URL filters - API will fetch filtered data',
        );
      }
    },

    setupSearchPanelWithFilters: function () {
      console.log(
        'EarlyWarning List View: Setting up search panel with URL filters',
      );

      const urlParams = this.getUrlParameters();
      if (
        !urlParams ||
        (!urlParams.countryCodeISO3 && !urlParams.disasterType)
      ) {
        console.log(
          'EarlyWarning List View: No URL parameters for search panel',
        );
        return;
      }

      // Wait for the search panel to be created
      this.once(
        'after:render',
        function () {
          console.log(
            'EarlyWarning List View: Applying URL filters to search panel after render',
          );
          this.applyFiltersToSearchPanel(urlParams);
        }.bind(this),
      );

      // Also try with a delay as fallback
      setTimeout(
        function () {
          console.log(
            'EarlyWarning List View: Applying URL filters to search panel with delay',
          );
          this.applyFiltersToSearchPanel(urlParams);
        }.bind(this),
        1000,
      );
    },

    applyFiltersToSearchPanel: function (urlParams) {
      console.log(
        'EarlyWarning List View: Applying filters to search panel:',
        urlParams,
      );

      // Get the search manager
      const searchManager = this.getSearchManager();
      if (!searchManager) {
        console.log('EarlyWarning List View: Search manager not available yet');
        return;
      }

      console.log(
        'EarlyWarning List View: Found search manager, applying filters',
      );

      // Build the advanced search data
      const advanced = {};

      if (urlParams.countryCodeISO3) {
        advanced.countryCodeISO3 = {
          type: 'equals',
          value: urlParams.countryCodeISO3,
        };
        console.log(
          'EarlyWarning List View: Added countryCodeISO3 to search panel:',
          urlParams.countryCodeISO3,
        );
      }

      if (urlParams.disasterType) {
        advanced.disasterType = {
          type: 'equals',
          value: urlParams.disasterType.toLowerCase(),
        };
        console.log(
          'EarlyWarning List View: Added disasterType to search panel:',
          urlParams.disasterType.toLowerCase(),
        );
      }

      // Apply the advanced search
      console.log(
        'EarlyWarning List View: Setting advanced search data:',
        advanced,
      );
      searchManager.set({
        advanced: advanced,
      });

      // Force the search panel to update its display
      if (this.searchView && this.searchView.updateAddFilters) {
        console.log('EarlyWarning List View: Updating search panel display');
        this.searchView.updateAddFilters();
      }

      // Also try to trigger a search panel refresh
      if (this.searchView && this.searchView.render) {
        console.log('EarlyWarning List View: Re-rendering search panel');
        this.searchView.render();
      }
    },

    getUrlParameters: function () {
      console.log('EarlyWarning List View: Parsing URL parameters');

      const hash = window.location.hash;
      const queryIndex = hash.indexOf('?');

      if (queryIndex === -1) {
        return null;
      }

      const queryString = hash.substring(queryIndex + 1);
      const urlParams = new URLSearchParams(queryString);

      const countryCodeISO3 = urlParams.get('countryCodeISO3');
      const disasterType = urlParams.get('disasterType');

      if (!countryCodeISO3 && !disasterType) {
        return null;
      }

      return {
        countryCodeISO3: countryCodeISO3,
        disasterType: disasterType,
      };
    },

    showFilterStatus: function (params) {
      console.log('EarlyWarning List View: Showing filter status for:', params);

      const filterInfo = [];
      if (params.countryCodeISO3)
        filterInfo.push(`Country: ${params.countryCodeISO3}`);
      if (params.disasterType) filterInfo.push(`Type: ${params.disasterType}`);

      if (filterInfo.length > 0) {
        const filterText = `<div class="alert alert-info" style="margin: 10px 0; padding: 10px; background-color: #d9edf7; border: 1px solid #bce8f1; color: #31708f; border-radius: 4px;">
                    <strong>🔍 Filters:</strong> ${filterInfo.join(', ')}
                    <a style="cursor:pointer; float: right; font-size: 24px; line-height: 24px; text-decoration: none;" href="/#EarlyWarning" title="Remove filters">&times;</a>
                </div>`;

        // Add filter status after view renders
        this.once(
          'after:render',
          function () {
            console.log(
              'EarlyWarning List View: Adding server-side filter status to DOM',
            );
            if (this.$el && this.$el.length) {
              // Remove any existing filter status first
              this.$el.find('.alert-info').remove();
              this.$el.prepend(filterText);
              console.log(
                'EarlyWarning List View: Server-side filter status added to DOM',
              );
            }
          }.bind(this),
        );

        // Also try with a delay as fallback
        setTimeout(
          function () {
            if (
              this.$el &&
              this.$el.length &&
              this.$el.find('.alert-info').length === 0
            ) {
              this.$el.prepend(filterText);
              console.log(
                'EarlyWarning List View: Server-side filter status added via delayed method',
              );
            }
          }.bind(this),
          500,
        );
      }
    },
  });
});

<script lang="ts">
  import { onMount } from 'svelte';
  import { ibfApiService } from '../services/ibfApi';
  import { cacheService, CacheService } from '../services/cacheService';

  export let selectedArea: any = null;
  export let countryCode: string = '';

  let populationData: any = null;
  let isLoading = false;
  let error: string | null = null;

  // Local loading promises to prevent duplicate requests
  let loadingPromises = new Map<string, Promise<any>>();
  
  // Debounce mechanism to prevent rapid requests
  let loadTimeout: number | null = null;
  const DEBOUNCE_DELAY = 200; // 200ms delay

  // Track the current admin code to prevent unnecessary updates
  let currentAdminCode: string | null = null;

  // Reactive statement to load data when selectedArea or countryCode changes
  $: {
    const adminCode = selectedArea?.properties?.adm2_pcode || selectedArea?.properties?.placeCode;
    
    // Only trigger if we have valid data and the admin code actually changed
    if (selectedArea && countryCode && adminCode && adminCode !== currentAdminCode) {
      console.log('🔄 AdminAreaInfo: New area detected, loading data...', { 
        areaName: selectedArea.properties?.adm2_en, 
        countryCode,
        adminCode 
      });
      currentAdminCode = adminCode;
      loadAreaDataWithCacheAndDebounce();
    } else if (!selectedArea || !countryCode) {
      // Clear any pending load if no area is selected
      if (loadTimeout) {
        clearTimeout(loadTimeout);
        loadTimeout = null;
      }
      currentAdminCode = null;
      populationData = null;
      console.log('❌ AdminAreaInfo: Cleared selection');
    }
  }

  function loadAreaDataWithCacheAndDebounce() {
    // Clear any existing timeout
    if (loadTimeout) {
      clearTimeout(loadTimeout);
    }
    
    // Set a new timeout to debounce rapid hover events
    loadTimeout = setTimeout(() => {
      loadAreaDataWithCache();
      loadTimeout = null;
    }, DEBOUNCE_DELAY);
  }

  async function loadAreaDataWithCache() {
    if (!selectedArea || !countryCode) return;
    
    // Create a cache key based on the area and country
    const adminCode = selectedArea.properties.adm2_pcode || selectedArea.properties.placeCode;
    if (!adminCode) {
      console.log('⚠️ No admin code found for area');
      return;
    }
    
    const cacheKey = CacheService.generateAdminAreaKey(countryCode, adminCode, 'population');
    
    // Check if we already have this data cached
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      console.log('🗄️ Using cached data for:', cacheKey);
      populationData = cachedData;
      return;
    }
    
    // Check if we're already loading this data
    if (loadingPromises.has(cacheKey)) {
      console.log('⏳ Already loading data for:', cacheKey);
      try {
        populationData = await loadingPromises.get(cacheKey);
        return;
      } catch (err) {
        console.error('❌ Error in concurrent request:', err);
        return;
      }
    }
    
    // Start loading the data
    const loadingPromise = loadAreaData(adminCode);
    loadingPromises.set(cacheKey, loadingPromise);
    
    try {
      const data = await loadingPromise;
      // Cache the successful result
      if (data) {
        cacheService.set(cacheKey, data, 10 * 60 * 1000); // Cache for 10 minutes
        console.log('💾 Cached data for:', cacheKey, 'Cache stats:', cacheService.getStats());
      }
      populationData = data;
    } catch (err) {
      console.error('❌ Error loading area data:', err);
      error = err.message;
    } finally {
      loadingPromises.delete(cacheKey);
    }
  }
  
  async function loadAreaData(adminCode: string) {
    if (!selectedArea || !countryCode || !adminCode) return null;
    
    isLoading = true;
    error = null;
    
    try {
      console.log('📊 Loading population data for area:', selectedArea.properties);
      
      // Try to get aggregated data for this area
      // This would typically include population and exposure data
      const response = await ibfApiService.getAggregatedData(
        countryCode, 
        'floods', // disaster type
        adminCode,
        2 // admin level
      );
      
      let resultData;
      if (response.data) {
        resultData = response.data;
        console.log('✅ Population data loaded:', resultData);
      } else {
        // Fallback to some basic population data if available
        resultData = {
          exposedPopulation: selectedArea.properties.population || 0,
          totalPopulation: selectedArea.properties.population || 0
        };
        console.log('📋 Using fallback population data:', resultData);
      }
      
      return resultData;
      
    } catch (err) {
      console.error('❌ Error loading population data:', err);
      error = 'Failed to load population data';
      
      // Even if API fails, try to show basic info from the area properties
      const fallbackData = {
        exposedPopulation: selectedArea.properties.population || 0,
        totalPopulation: selectedArea.properties.population || 0
      };
      
      return fallbackData;
    } finally {
      isLoading = false;
    }
  }
  
  function formatNumber(value: number | string | undefined): string {
    if (!value && value !== 0) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return 'N/A';
    return num.toLocaleString();
  }

  // Component lifecycle
  onMount(() => {
    console.log('🚀 AdminAreaInfo component mounted');
    console.log('📊 Initial state:', { selectedArea, countryCode });
  });
</script>

<!-- Inline admin area display for National View section -->
{#if selectedArea}
  <div class="national-view-header">
    <h3>{selectedArea.properties.adm2_en || selectedArea.properties.name || 'Unknown Area'}</h3>
    <h4>{selectedArea.properties.adm1_en || 'Unknown Region'}</h4>
  </div>
  
  <div class="national-view-stats">
    {#if isLoading}
      <div class="loading-message">Loading population data...</div>
    {:else if error}
      <div class="error-message">Error loading data</div>
    {:else if populationData}
      <div class="stat-item">
        <div class="stat-icon">
          <!-- People icon for exposed population -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Exposed population</div>
          <div class="stat-value">{formatNumber(populationData.exposedPopulation || 0)}</div>
        </div>
        <button class="stat-info-btn">ℹ️</button>
      </div>
      <div class="stat-item">
        <div class="stat-icon">
          <!-- Group icon for total population (same as National View) -->
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.002 3.002 0 0 0 17.09 7c-.6 0-1.13.27-1.49.69L14.5 9.5l1.41 1.41L17 9.83V22h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-3C9.57 12.5 8.5 13.57 8.5 15v7h7v-7c0-1.43-1.07-2.5-2.5-2.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5C9 8.57 8.43 8 7.5 8S6 8.57 6 9.5V15H7.5v7h0z"/>
          </svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Total Population</div>
          <div class="stat-value">{formatNumber(populationData.totalPopulation || 0)}</div>
        </div>
        <button class="stat-info-btn">ℹ️</button>
      </div>
    {:else}
      <div class="no-data-message">No data available for this area</div>
    {/if}
  </div>
{:else}
  <div class="national-view-header">
    <h3>National View</h3>
    <h4>Predicted Drought</h4>
  </div>
  <div class="national-view-stats">
    <div class="no-data-message">Hover over an admin area to see statistics</div>
  </div>
{/if}

<style>
  /* Copy all National View styles from App.svelte as global styles */
  :global(.national-view-header) {
    background: #00214d; /* IBF navy-900 */
    color: white;
    padding: 16px 20px;
    border-bottom: 1px solid #d6e0fa;
  }

  :global(.national-view-header h3) {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
  }

  :global(.national-view-header h4) {
    margin: 0;
    font-size: 14px;
    font-weight: 400;
    opacity: 0.9;
  }

  :global(.national-view-stats) {
    padding: 0; /* Remove padding to match original */
    display: flex;
    flex-direction: column;
    gap: 0; /* No gap between cards */
  }

  :global(.stat-item) {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px; /* Reduced padding for compact look */
    background: white;
    border-bottom: 1px solid #d6e0fa; /* Border between items */
    width: 100%; /* Stretch to full width */
    box-sizing: border-box;
  }

  :global(.stat-item:last-child) {
    border-bottom: none; /* Remove border from last item */
  }

  :global(.stat-icon) {
    font-size: 20px;
    flex-shrink: 0;
    color: #00214d; /* IBF navy-900 for icons */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :global(.stat-info) {
    flex: 1;
  }

  :global(.stat-label) {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 2px;
  }

  :global(.stat-value) {
    font-size: 16px;
    font-weight: 600;
    color: #00214d; /* IBF navy-900 */
  }

  :global(.stat-info-btn) {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    opacity: 0.6;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  :global(.stat-info-btn:hover) {
    opacity: 1;
    background: rgba(0, 33, 77, 0.1);
  }

  /* Global styles for loading, error and no-data states to match National View */
  :global(.loading-message),
  :global(.error-message),
  :global(.no-data-message) {
    text-align: center;
    padding: 16px;
    color: #6b7280;
    font-size: 14px;
    background: white;
    border-bottom: 1px solid #d6e0fa;
  }

  :global(.error-message) {
    color: #dc2626;
  }

  :global(.loading-message) {
    color: #00214d;
  }
</style>
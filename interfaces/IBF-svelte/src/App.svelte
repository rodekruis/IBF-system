<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import { user, selectedCountry, countries, isLoading } from './lib/stores/app';
  import Map from './lib/components/Map.svelte';
  import CountrySelector from './lib/components/CountrySelector.svelte';
  import LoginPopup from './lib/components/LoginPopup.svelte';
  import AdminAreaInfo from './lib/components/AdminAreaInfo.svelte';
  import { config } from './lib/config';
  import { ibfApiService } from './lib/services/ibfApi';
  import { authService, isAuthenticated as authStoreAuthenticated, currentUser } from './lib/services/auth';
  import type { Country } from './lib/stores/app';
  
  // Check if we're in browser environment
  const browser = typeof window !== 'undefined';
  
  // Authentication state
  let showLoginPopup = false;
  let authLoading = true;
  
  // Reactive authentication state from store
  $: isAuthenticated = $authStoreAuthenticated;
  
  // Dashboard state
  let selectedDisasterType = 'drought'; // Change default to drought for Ethiopia
  let selectedDate = new Date().toISOString().split('T')[0];
  let showTimeline = true;
  let showAggregates = true;
  let showCountrySelector = false; // For country dropdown
  let showMobileSidebar = false; // For mobile sidebar visibility
  
  // Admin area hover state
  let hoveredAdminArea: any = null;
  let hoveredCountryCode: string = '';
  
  // Available disaster types (matching original IBF)
  const disasterTypes = [
    { id: 'floods', name: 'Floods', icon: '🌊', color: '#2563eb' },
    { id: 'drought', name: 'Drought', icon: '☀️', color: '#dc2626' },
    { id: 'heavy-rainfall', name: 'Heavy Rainfall', icon: '🌧️', color: '#7c3aed' },
    { id: 'typhoon', name: 'Typhoon', icon: '🌀', color: '#059669' },
    { id: 'dengue', name: 'Dengue', icon: '🦟', color: '#ea580c' }
  ];

  // Local variables to prevent reactive template subscriptions
  let currentCountryName = 'LOADING';
  let countriesList = [];
  let currentSelectedCountry = null;
  let currentUserName = 'Henry Dunant';

  // Manual update functions to sync local variables with stores
  function updateLocalVariables() {
    // Use get() to avoid reactive subscriptions
    const selectedCountryValue = get(selectedCountry);
    const countriesValue = get(countries);
    const currentUserValue = get(currentUser);
    
    currentCountryName = selectedCountryValue?.name || 'LOADING';
    countriesList = countriesValue || [];
    currentSelectedCountry = selectedCountryValue;
    currentUserName = currentUserValue?.name || 'User';
  }
  
  onMount(async () => {
    if (browser) {
      await initializeApp();
      
      // Add window resize listener to handle screen size changes
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          // On desktop, hide mobile sidebar
          showMobileSidebar = false;
        } else {
          // On mobile, close both menus when resizing
          showCountrySelector = false;
          showMobileSidebar = false;
        }
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
      };
    }
  });
  
  async function initializeApp() {
    try {
      authLoading = true;
      
      // If authentication is disabled, skip auth checks
      if (config.disableAuthentication) {
        // Mock user for development
        updateLocalVariables();
      } else {
        // Initialize authentication service
        await authService.initializeFromParent();
        updateLocalVariables();
      }

      // Load initial data after authentication
      await loadInitialData();
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      authLoading = false;
    }
  }
  
  async function loadInitialData() {
    isLoading.set(true);
    
    try {
      if (config.useIbfApi) {
        console.log('📡 Loading data from IBF API...');
        
        // Fetch countries from IBF API
        const countriesResponse = await ibfApiService.getCountries();
        
        if (countriesResponse.data) {
          console.log('✅ Countries loaded from IBF API:', countriesResponse.data.length);
          
          // Transform IBF countries to our format
          const ibfCountries: Country[] = countriesResponse.data.map(ibfCountry => ({
            countryCodeISO3: ibfCountry.countryCodeISO3,
            countryName: ibfCountry.countryName,
            name: ibfCountry.countryName,
            region: getRegionFromCountryCode(ibfCountry.countryCodeISO3),
            coordinates: getCountryCoordinates(ibfCountry.countryCodeISO3),
            defaultZoom: 6,
            population: null, // Will be loaded separately if needed
            countryBounds: ibfCountry.countryBounds || getDefaultBounds(ibfCountry.countryCodeISO3)
          }));
          
          countries.set(ibfCountries);
          
          // Update local variables to reflect store changes
          updateLocalVariables();
          
          // Set Ethiopia as default if available, otherwise first country
          const ethiopiaCountry = ibfCountries.find(c => c.countryCodeISO3 === 'ETH');
          if (ethiopiaCountry) {
            selectedCountry.set(ethiopiaCountry);
            updateLocalVariables();
            console.log('🇪🇹 Selected Ethiopia as default country');
            // Map will load this automatically via its own deferred loading
          } else if (ibfCountries.length > 0) {
            selectedCountry.set(ibfCountries[0]);
            updateLocalVariables();
            console.log(`🌍 Selected ${ibfCountries[0].name} as default country`);
            // Map will load this automatically via its own deferred loading
          }
        } else {
          console.error('❌ Failed to load countries from IBF API:', countriesResponse.error);
          // Fallback to mock data
          loadMockData();
        }
      } else {
        console.log('🧪 Using mock data (IBF API disabled)');
        loadMockData();
      }
      
    } catch (error) {
      console.error('❌ Error loading initial data:', error);
      // Fallback to mock data on error
      loadMockData();
    } finally {
      isLoading.set(false);
    }
  }

  function loadMockData() {
    const mockCountries: Country[] = [
      {
        countryCodeISO3: 'ETH',
        countryName: 'Ethiopia',
        name: 'Ethiopia',
        region: 'East Africa',
        coordinates: { lat: 9.1450, lng: 40.4897 },
        defaultZoom: 6,
        population: 114963588,
        countryBounds: [[3.0, 33.0], [15.0, 48.0]]
      },
      {
        countryCodeISO3: 'PHL',
        countryName: 'Philippines',
        name: 'Philippines',
        region: 'Southeast Asia',
        coordinates: { lat: 12.8797, lng: 121.7740 },
        defaultZoom: 6,
        population: 109581078,
        countryBounds: [[4.5, 116.0], [21.0, 127.0]]
      },
      {
        countryCodeISO3: 'BGD',
        countryName: 'Bangladesh',
        name: 'Bangladesh',
        region: 'South Asia',
        coordinates: { lat: 23.6850, lng: 90.3563 },
        defaultZoom: 7,
        population: 164689383,
        countryBounds: [[20.5, 88.0], [26.5, 93.0]]
      },
      {
        countryCodeISO3: 'KEN',
        countryName: 'Kenya',
        name: 'Kenya',
        region: 'East Africa',
        coordinates: { lat: -0.0236, lng: 37.9062 },
        defaultZoom: 6,
        population: 53771296,
        countryBounds: [[-5.0, 34.0], [5.0, 42.0]]
      },
      {
        countryCodeISO3: 'UGA',
        countryName: 'Uganda',
        name: 'Uganda',
        region: 'East Africa',
        coordinates: { lat: 1.3733, lng: 32.2903 },
        defaultZoom: 7,
        population: 45741007,
        countryBounds: [[-2.0, 29.5], [4.5, 35.0]]
      }
    ];

    countries.set(mockCountries);
    
    // Update local variables to reflect store changes
    updateLocalVariables();
    
    // Set Ethiopia as default
    const ethiopiaCountry = mockCountries.find(c => c.countryCodeISO3 === 'ETH');
    if (ethiopiaCountry) {
      selectedCountry.set(ethiopiaCountry);
      updateLocalVariables();
    } else if (mockCountries.length > 0) {
      selectedCountry.set(mockCountries[0]);
      updateLocalVariables();
    }
  }

  function getRegionFromCountryCode(countryCode: string): string {
    const regionMap: Record<string, string> = {
      'ETH': 'East Africa',
      'KEN': 'East Africa', 
      'UGA': 'East Africa',
      'PHL': 'Southeast Asia',
      'BGD': 'South Asia',
      'NPL': 'South Asia',
      'MLI': 'West Africa',
      'ZMB': 'Southern Africa',
      'MWI': 'Southern Africa',
      'ECU': 'South America',
      'PER': 'South America'
    };
    return regionMap[countryCode] || 'Unknown Region';
  }

  function getCountryCoordinates(countryCode: string): { lat: number; lng: number } {
    const coordMap: Record<string, { lat: number; lng: number }> = {
      'ETH': { lat: 9.1450, lng: 40.4897 },
      'KEN': { lat: -0.0236, lng: 37.9062 },
      'UGA': { lat: 1.3733, lng: 32.2903 },
      'PHL': { lat: 12.8797, lng: 121.7740 },
      'BGD': { lat: 23.6850, lng: 90.3563 },
      'NPL': { lat: 28.3949, lng: 84.1240 },
      'MLI': { lat: 17.5707, lng: -3.9962 },
      'ZMB': { lat: -13.1339, lng: 27.8493 },
      'MWI': { lat: -13.2543, lng: 34.3015 },
      'ECU': { lat: -1.8312, lng: -78.1834 },
      'PER': { lat: -9.1900, lng: -75.0152 }
    };
    return coordMap[countryCode] || { lat: 0, lng: 0 };
  }

  function getDefaultBounds(countryCode: string): [[number, number], [number, number]] {
    const boundsMap: Record<string, [[number, number], [number, number]]> = {
      'ETH': [[3.0, 33.0], [15.0, 48.0]],
      'KEN': [[-5.0, 34.0], [6.0, 42.0]],
      'UGA': [[-1.5, 29.5], [4.5, 35.0]],
      'PHL': [[4.5, 116.0], [21.0, 127.0]],
      'BGD': [[20.5, 88.0], [26.5, 93.0]],
      'NPL': [[26.3, 80.0], [30.4, 88.2]],
      'MLI': [[10.0, -12.0], [25.0, 5.0]],
      'ZMB': [[-18.0, 22.0], [-8.0, 34.0]],
      'MWI': [[-17.0, 33.0], [-9.0, 36.0]],
      'ECU': [[-5.0, -82.0], [2.0, -75.0]],
      'PER': [[-18.5, -82.0], [0.0, -68.0]]
    };
    return boundsMap[countryCode] || [[-90, -180], [90, 180]];
  }
  
  function isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
  
  function parseJwtPayload(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return {};
    }
  }
  
  // Country selection handlers
  function handleCountryChange(event: { detail: Country }) {
    const newCountry = event.detail;
    console.log(`🌍 Country changed to: ${newCountry.name}`);
    
    // Close country selector
    showCountrySelector = false;
    
    // Set the selected country in the store
    selectedCountry.set(newCountry);
    
    // Update local variables to reflect store changes
    updateLocalVariables();
    
    // Manually trigger map update using exposed method (no reactive subscription)
    if ((window as any).updateMapCountry) {
      console.log(`🗺️ Triggering manual map update for: ${newCountry.name}`);
      (window as any).updateMapCountry(newCountry);
    } else {
      console.log('⚠️ Map update method not available yet');
    }
  }

  // Admin area hover handlers
  function handleAdminAreaHover(event: { detail: { area: any, countryCode: string } }) {
    console.log('🎯 Admin area hovered in App:', event.detail.area.properties.adm2_en);
    hoveredAdminArea = event.detail.area;
    hoveredCountryCode = event.detail.countryCode;
  }

  function handleAdminAreaHoverClear() {
    console.log('🔄 Admin area hover cleared in App');
    hoveredAdminArea = null;
    hoveredCountryCode = '';
  }

  async function loadCountryData(countryCode: string) {
    try {
      console.log(`📡 Loading data for ${countryCode}...`);
      
      // TEMPORARILY DISABLED - Map component handles admin areas loading
      console.log(`⚠️ loadCountryData disabled - letting Map component handle admin areas`);
      return;
      
      // Get disaster types for the country
      const disasterTypesResponse = await ibfApiService.getDisasterTypes(countryCode);
      if (disasterTypesResponse.data) {
        console.log(`✅ Disaster types for ${countryCode}:`, disasterTypesResponse.data);
        
        // Update available disaster types
        const availableTypes = disasterTypesResponse.data.filter(dt => dt.active);
        if (availableTypes.length > 0) {
          // Set the first active disaster type as selected
          selectedDisasterType = availableTypes[0].disasterType;
        }
      }
      
      // Get admin areas for mapping
      const adminAreasResponse = await ibfApiService.getAdminAreas(countryCode, 2);
      if (adminAreasResponse.data) {
        console.log(`✅ Admin areas for ${countryCode}:`, adminAreasResponse.data.features?.length || 0, 'features');
        // Map component will handle the admin areas data
      }
      
    } catch (error) {
      console.error(`❌ Error loading data for ${countryCode}:`, error);
    }
  }

  function toggleCountrySelector() {
    showCountrySelector = !showCountrySelector;
    // Close mobile sidebar if it's open
    showMobileSidebar = false;
  }

  function toggleMobileSidebar() {
    showMobileSidebar = !showMobileSidebar;
    // Close country selector if it's open
    showCountrySelector = false;
  }
  
  function handleLogin() {
    showLoginPopup = true;
  }
  
  function handleLogout() {
    authService.logout();
    updateLocalVariables();
  }

  function handleLoginSuccess() {
    showLoginPopup = false;
    updateLocalVariables();
    // Reload data for authenticated user
    loadInitialData();
  }

  function handleLoginClose() {
    showLoginPopup = false;
  }
  
  function handleDisasterTypeChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    selectedDisasterType = target.value;
  }
  
  function handleDateChange(event: Event) {
    const target = event.target as HTMLInputElement;
    selectedDate = target.value;
  }
</script>

<!-- Authentication Loading -->
{#if authLoading}
  <div class="loading">
    <div class="spinner"></div>
    <div class="loading-text">Initializing IBF Dashboard...</div>
  </div>

<!-- Login Required -->
{:else if !isAuthenticated && !config.disableAuthentication}
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h1>IBF Dashboard</h1>
        <p>Impact-Based Forecasting for Early Action</p>
      </div>
      
      <div class="auth-content">
        <p>Please sign in with your IBF account to access the dashboard.</p>
        <button class="btn btn-primary" on:click={handleLogin}>
          Sign in to IBF Dashboard
        </button>
      </div>
      
      <div class="auth-footer">
        <p>This system is for authorized Red Cross personnel only.</p>
      </div>
    </div>
  </div>

<!-- Main IBF Portal Layout -->
{:else}
  <div class="ibf-portal">
    <!-- Top Header -->
    <header class="portal-header">
      <div class="header-left">
        <div class="header-menu">
          <button class="menu-toggle" on:click={toggleCountrySelector}>
            <!-- 9-dots menu icon (like original IBF) -->
            <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
              <circle cx="3" cy="3" r="1.5"/>
              <circle cx="9" cy="3" r="1.5"/>
              <circle cx="15" cy="3" r="1.5"/>
              <circle cx="3" cy="9" r="1.5"/>
              <circle cx="9" cy="9" r="1.5"/>
              <circle cx="15" cy="9" r="1.5"/>
              <circle cx="3" cy="15" r="1.5"/>
              <circle cx="9" cy="15" r="1.5"/>
              <circle cx="15" cy="15" r="1.5"/>
            </svg>
          </button>
        </div>
        <h1 class="portal-title">
          IBF PORTAL {currentCountryName?.toUpperCase() || 'LOADING'} {selectedDisasterType.toUpperCase()} NON-TRIGGERED
        </h1>
      </div>
      
      <div class="header-right">
        <div class="red-cross-logo">
          <div class="red-cross-icon">+</div>
        </div>
        <div class="user-section">
          <span class="user-label">Logged in as:</span>
          <span class="user-name">{currentUserName}</span>
          <button class="logout-btn" on:click={handleLogout}>Log out</button>
        </div>
      </div>
    </header>

    <!-- Country Selector Dropdown -->
    {#if showCountrySelector}
      <div 
        class="country-selector-overlay" 
        on:click={() => showCountrySelector = false}
        on:keydown={(e) => e.key === 'Escape' && (showCountrySelector = false)}
        role="button"
        tabindex="0"
        aria-label="Close country selector"
      >
        <div 
          class="country-selector-dropdown" 
          on:click|stopPropagation
          on:keydown|stopPropagation
          role="menu"
          tabindex="0"
          aria-label="Country selection menu"
        >
          <h3>Menu</h3>
          
          <!-- Mobile: Show sidebar option -->
          <div class="mobile-menu-section">
            <button 
              class="menu-option sidebar-option" 
              on:click={toggleMobileSidebar}
              role="menuitem"
            >
              <div class="menu-option-icon">📋</div>
              <div class="menu-option-info">
                <div class="menu-option-name">Dashboard Info</div>
                <div class="menu-option-desc">Date, actions & controls</div>
              </div>
            </button>
          </div>

          <!-- Country Selection Section -->
          <div class="country-section">
            <h4>Select Country</h4>
            <div class="country-list">
            {#each countriesList as country (country.countryCodeISO3)}
              <button 
                class="country-item" 
                class:active={currentSelectedCountry?.countryCodeISO3 === country.countryCodeISO3}
                on:click={() => handleCountryChange({ detail: country })}
                role="menuitem"
              >
                <div class="country-flag">🌍</div>
                <div class="country-info">
                  <div class="country-name">{country.name}</div>
                  <div class="country-region">{country.region}</div>
                </div>
              </button>
            {/each}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <div class="portal-content">
      <!-- Left Sidebar -->
      <aside class="portal-sidebar" class:mobile-hidden={!showMobileSidebar}>
        <!-- Mobile sidebar overlay -->
        {#if showMobileSidebar}
          <div 
            class="mobile-sidebar-overlay" 
            on:click={() => showMobileSidebar = false}
            on:keydown={(e) => e.key === 'Escape' && (showMobileSidebar = false)}
            role="button"
            tabindex="0"
            aria-label="Close sidebar"
          ></div>
        {/if}
        <!-- Date Section -->
        <div class="date-section">
          <div class="current-date">
            <div class="date-icon">📅</div>
            <div class="date-info">
              <div class="date-main">16 Jul 2025</div>
              <div class="date-sub">Wednesday, 22:41 GMT+2</div>
            </div>
          </div>
        </div>

        <!-- User Greeting -->
        <div class="greeting-section">
          <p class="greeting-text">
            Hello <strong>{currentUserName}</strong>. The information in this portal is 
            based on the model last run on <strong>Monday, 16 June 09:08</strong>.
          </p>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <div class="button-row">
            <button class="action-btn active">About trigger</button>
            <button class="action-btn">Alert log</button>
          </div>
          <div class="button-row">
            <button class="action-btn">IBF guide</button>
            <button class="action-btn">Export view</button>
          </div>
        </div>

        <!-- Information Text -->
        <div class="info-section">
          <p class="info-text">
            To your right is the map of your country. You can turn 
            data layers on and off. There are currently <strong>no alerts</strong> 
            issued.
          </p>
        </div>
      </aside>

      <!-- Main Content Area (Right side) -->
      <main class="portal-main">
        <!-- Timeline Section -->
        <div class="timeline-header">
          <div class="timeline-nav">
            <button class="timeline-btn">Jun 2025</button>
            <button class="timeline-btn active">Jul 2025</button>
            <button class="timeline-btn">Aug 2025</button>
            <button class="timeline-btn">Sep 2025</button>
            <button class="timeline-btn">Oct 2025</button>
            <button class="timeline-btn">Nov 2025</button>
            <button class="timeline-btn">Dec 2025</button>
            <button class="timeline-btn">Jan 2026</button>
            <button class="timeline-btn">Feb 2026</button>
            <button class="timeline-btn">Mar 2026</button>
            <button class="timeline-btn">Apr 2026</button>
            <button class="timeline-btn">May 2026</button>
            <button class="info-icon">ℹ️</button>
          </div>
        </div>

        <!-- 2-column layout: National View + Map -->
        <div class="main-content-columns">
          <!-- National View Section (Middle Column) -->
          <div class="national-view-column">
            {#if hoveredAdminArea}
              <!-- Admin Area View when hovering -->
              <AdminAreaInfo 
                selectedArea={hoveredAdminArea}
                countryCode={hoveredCountryCode}
              />
            {:else}
              <!-- Default National View -->
              <div class="national-view-header">
                <h3>National View</h3>
                <h4>Predicted Drought</h4>
              </div>
              
              <div class="national-view-stats">
                <div class="stat-item">
                  <div class="stat-icon">
                    <!-- People icon for exposed population -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">Exposed population</div>
                    <div class="stat-value">0</div>
                  </div>
                  <button class="stat-info-btn">ℹ️</button>
                </div>
                <div class="stat-item">
                  <div class="stat-icon">
                    <!-- Group icon for total population -->
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A3.002 3.002 0 0 0 17.09 7c-.6 0-1.13.27-1.49.69L14.5 9.5l1.41 1.41L17 9.83V22h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zm1.5 1h-3C9.57 12.5 8.5 13.57 8.5 15v7h7v-7c0-1.43-1.07-2.5-2.5-2.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9V9.5C9 8.57 8.43 8 7.5 8S6 8.57 6 9.5V15H7.5v7h0z"/>
                    </svg>
                  </div>
                  <div class="stat-info">
                    <div class="stat-label">Total Population</div>
                    <div class="stat-value">0</div>
                  </div>
                  <button class="stat-info-btn">ℹ️</button>
                </div>
              </div>
            {/if}
          </div>

          <!-- Map Container (Right Column) -->
          <div class="map-container">
            <!-- Always render Map component - let it handle its own loading states -->
            <Map 
              on:admin-area-hover={handleAdminAreaHover}
              on:admin-area-hover-clear={handleAdminAreaHoverClear}
            />
            
            <!-- Global loading overlay for initial app loading only -->
            {#if $isLoading}
              <div class="loading-overlay">
                <div class="spinner"></div>
                <div class="loading-text">Loading initial data...</div>
              </div>
            {/if}
          </div>
        </div>
      </main>
    </div>
  </div>
{/if}

<style>
  /* IBF Portal Layout - Using exact IBF colors */
  .ibf-portal {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background: #f4f7fa; /* IBF neutral-100 */
    font-family: 'Open Sans', 'Helvetica Neue', 'Roboto', 'Segoe UI', sans-serif;
  }

  /* Top Header */
  .portal-header {
    background: white !important; /* White background with !important to override */
    color: #666; /* Greyish font color like original */
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 1px 4px rgba(0, 33, 77, 0.1);
    border-bottom: 1px solid #d6e0fa; /* IBF navy-300 */
  }

  .header-left {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .menu-toggle {
    background: none;
    border: none;
    display: flex;
    flex-direction: column;
    gap: 3px;
    cursor: pointer;
    padding: 8px;
    border-radius: 4px;
    transition: background-color 0.2s;
  }

  .menu-toggle:hover {
    background: rgba(214, 224, 250, 0.2); /* IBF navy-300 with opacity */
  }

  .menu-toggle span {
    width: 20px;
    height: 2px;
    background: white;
    transition: transform 0.2s;
  }

  .portal-title {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    letter-spacing: 0.5px;
    color: #6b7280 !important; /* Requested grey color with !important to override */
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .red-cross-logo {
    display: flex;
    align-items: center;
  }

  .red-cross-icon {
    background: #e53e3e;
    color: white;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    font-size: 18px;
  }

  .user-section {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
  }

  .user-label {
    color: #ccc;
  }

  .user-name {
    font-weight: 500;
  }

  .logout-btn {
    background: none;
    border: none;
    color: white;
    text-decoration: underline;
    cursor: pointer;
    font-size: 13px;
  }

  .logout-btn:hover {
    color: #ccc;
  }

  /* Main Content Layout */
  .portal-content {
    display: flex;
    flex: 1;
    overflow: hidden;
  }

  /* Main content layout: 3-column structure like original IBF dashboard */
  .main-content-columns {
    display: grid;
    grid-template-columns: 250px 1fr; /* National View + Map */
    flex: 1;
    height: 100%;
    background: #f4f7fa; /* IBF neutral-100 */
  }

  /* National View Column (Middle) */
  .national-view-column {
    background: white;
    border-right: 1px solid #d6e0fa; /* IBF navy-300 */
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  /* National View Header */
  .national-view-header {
    background: #00214d; /* IBF navy-900 */
    color: white;
    padding: 16px 20px;
    border-bottom: 1px solid #d6e0fa;
  }

  .national-view-header h3 {
    margin: 0 0 4px 0;
    font-size: 16px;
    font-weight: 600;
  }

  .national-view-header h4 {
    margin: 0;
    font-size: 14px;
    font-weight: 400;
    opacity: 0.9;
  }

  /* National View Stats */
  .national-view-stats {
    padding: 0; /* Remove padding to match original */
    display: flex;
    flex-direction: column;
    gap: 0; /* No gap between cards */
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px; /* Reduced padding for compact look */
    background: white;
    border-bottom: 1px solid #d6e0fa; /* Border between items */
    width: 100%; /* Stretch to full width */
    box-sizing: border-box;
  }

  .stat-item:last-child {
    border-bottom: none; /* Remove border from last item */
  }

  .stat-icon {
    font-size: 20px;
    flex-shrink: 0;
    color: #00214d; /* IBF navy-900 for icons */
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .stat-info {
    flex: 1;
  }

  .stat-label {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 2px;
  }

  .stat-value {
    font-size: 16px;
    font-weight: 600;
    color: #00214d; /* IBF navy-900 */
  }

  .stat-info-btn {
    background: none;
    border: none;
    font-size: 14px;
    cursor: pointer;
    opacity: 0.6;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .stat-info-btn:hover {
    opacity: 1;
    background: rgba(0, 33, 77, 0.1);
  }

  /* Left Sidebar */
  .portal-sidebar {
    width: 300px;
    background: white;
    border-right: 1px solid #d6e0fa; /* IBF navy-300 */
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    box-shadow: 2px 0 8px rgba(0, 33, 77, 0.08);
  }

  .date-section {
    border-bottom: 1px solid #d6e0fa; /* IBF navy-300 */
    padding-bottom: 15px;
  }

  .current-date {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .date-icon {
    font-size: 20px;
  }

  .date-main {
    font-size: 18px;
    font-weight: 600;
    color: #00214d; /* IBF navy-900 */
  }

  .date-sub {
    font-size: 12px;
    color: #666;
  }

  .greeting-section {
    padding-bottom: 15px;
    border-bottom: 1px solid #d6e0fa; /* IBF navy-300 */
  }

  .greeting-text {
    font-size: 13px;
    color: #555;
    line-height: 1.4;
    margin: 0;
  }

  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .button-row {
    display: flex;
    gap: 10px;
  }

  .action-btn {
    flex: 1;
    padding: 8px 12px;
    border: 1px solid #d6e0fa; /* IBF navy-300 */
    background: white;
    color: #00214d; /* IBF navy-900 */
    font-size: 12px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .action-btn.active {
    background: #00214d; /* IBF navy-900 */
    color: white;
    border-color: #00214d;
  }

  .action-btn:hover:not(.active) {
    background: #d6e0fa; /* IBF navy-300 */
    border-color: #00214d;
  }

  .info-section {
    flex: 1;
  }

  .info-text {
    font-size: 13px;
    color: #555;
    line-height: 1.4;
    margin: 0;
  }

  /* Main Content Area */
  .portal-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #f4f7fa; /* IBF neutral-100 */
  }

  /* Timeline Header */
  .timeline-header {
    background: white;
    border-bottom: 1px solid #d6e0fa; /* IBF navy-300 */
    padding: 10px 20px;
    box-shadow: 0 1px 4px rgba(0, 33, 77, 0.08);
  }

  .timeline-nav {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .timeline-btn {
    padding: 6px 12px;
    border: 1px solid #d6e0fa; /* IBF navy-300 */
    background: white;
    color: #00214d; /* IBF navy-900 */
    font-size: 11px;
    cursor: pointer;
    border-radius: 6px;
    transition: all 0.2s;
    font-family: inherit;
  }

  .timeline-btn.active {
    background: #00214d; /* IBF navy-900 */
    color: white;
    border-color: #00214d;
  }

  .timeline-btn:hover:not(.active) {
    background: #d6e0fa; /* IBF navy-300 */
    border-color: #00214d;
  }

  .info-icon {
    margin-left: auto;
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
  }

  /* National View Section */
  .national-view {
    background: white;
    border-bottom: 1px solid #d6e0fa; /* IBF navy-300 */
    padding: 15px 20px;
    box-shadow: 0 1px 4px rgba(0, 33, 77, 0.08);
  }

  .view-header {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .view-header h3 {
    margin: 0;
    font-size: 16px;
    color: #00214d; /* IBF navy-900 */
    font-weight: 600;
  }

  .view-stats {
    display: flex;
    gap: 20px;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .stat-icon {
    font-size: 14px;
  }

  .stat-info {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 11px;
    color: #666;
  }

  .stat-value {
    font-size: 14px;
    font-weight: 600;
    color: #333;
  }

  .stat-info-btn {
    background: none;
    border: none;
    font-size: 12px;
    cursor: pointer;
    color: #666;
  }

  .view-controls {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .drought-info {
    font-size: 12px;
    color: #666;
  }

  /* Map Section */
  .map-section {
    flex: 1;
    position: relative;
    background: white;
    margin: 0;
  }

  /* Authentication styles */
  .auth-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #2c5aa0 0%, #1e3d72 100%);
    padding: 2rem;
  }
  
  .auth-card {
    background: white;
    border-radius: 8px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 3rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }
  
  .auth-header h1 {
    color: #2c5aa0;
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }
  
  .auth-header p {
    color: #666;
    margin-bottom: 2rem;
  }
  
  .auth-content p {
    color: #555;
    margin-bottom: 2rem;
  }
  
  .auth-footer p {
    color: #999;
    font-size: 0.875rem;
    margin-top: 2rem;
  }

  /* Button styles */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.2s ease-in-out;
  }

  .btn-primary {
    background-color: #2c5aa0;
    color: white;
  }

  .btn-primary:hover {
    background-color: #1e3d72;
  }

  /* Loading states */
  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    flex-direction: column;
    background: #f5f5f5;
  }
  
  .loading-text {
    margin-top: 1rem;
    color: #666;
    font-size: 0.875rem;
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    z-index: 1000;
  }

  .spinner {
    width: 32px;
    height: 32px;
    border: 3px solid #f3f3f3;
    border-top: 3px solid #2c5aa0;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  /* Responsive design */
  @media (max-width: 768px) {
    .portal-content {
      flex-direction: row; /* Keep row layout on mobile */
    }
    
    .portal-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      height: 100vh;
      width: 300px;
      z-index: 1500;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
      border-right: 1px solid #ddd;
      border-bottom: none;
      box-shadow: 2px 0 8px rgba(0, 33, 77, 0.15);
      padding-top: 70px; /* Account for header height */
    }
    
    .portal-sidebar:not(.mobile-hidden) {
      transform: translateX(0);
    }
    
    .main-content-columns {
      grid-template-columns: 1fr; /* Single column on mobile - remove national view column */
      width: 100%;
    }
    
    .national-view-column {
      display: none; /* Hide national view column on mobile */
    }
    
    .timeline-nav {
      overflow-x: auto;
      white-space: nowrap;
    }
    
    .view-header {
      flex-wrap: wrap;
      gap: 10px;
    }
    
    .view-stats {
      flex-wrap: wrap;
    }
    
    .portal-title {
      font-size: 14px;
    }
  }

  /* Mobile sidebar overlay */
  .mobile-sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1400;
  }

  /* Mobile hidden class */
  .mobile-hidden {
    display: none;
  }

  @media (min-width: 769px) {
    .portal-sidebar.mobile-hidden {
      display: flex; /* Show sidebar on desktop */
    }
    
    .mobile-sidebar-overlay {
      display: none; /* No overlay on desktop */
    }

    .mobile-menu-section {
      display: none; /* Hide mobile menu section on desktop */
    }
  }

  /* Country Selector Styles */
  .country-selector-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 2000;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    padding-top: 60px;
    padding-left: 20px;
  }

  .country-selector-dropdown {
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    min-width: 300px;
    max-width: 400px;
    max-height: 500px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .country-selector-dropdown h3 {
    margin: 0;
    padding: 15px 20px;
    background: #00214d; /* IBF navy-900 */
    color: white;
    font-size: 16px;
    font-weight: 600;
    border-bottom: 1px solid #d6e0fa;
  }

  .country-selector-dropdown h4 {
    margin: 0;
    padding: 12px 20px 8px 20px;
    color: #00214d; /* IBF navy-900 */
    font-size: 14px;
    font-weight: 600;
    border-bottom: 1px solid #f0f0f0;
  }

  .mobile-menu-section {
    padding: 0;
    border-bottom: 1px solid #f0f0f0;
  }

  .country-section {
    padding: 0;
  }

  .menu-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: none;
    background: none;
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: left;
  }

  .menu-option:hover {
    background: #f5f5f5;
  }

  .menu-option-icon {
    font-size: 20px;
    width: 24px;
    text-align: center;
  }

  .menu-option-info {
    flex: 1;
  }

  .menu-option-name {
    font-weight: 500;
    color: #00214d; /* IBF navy-900 */
    font-size: 14px;
    margin-bottom: 2px;
  }

  .menu-option-desc {
    font-size: 12px;
    color: #666;
  }

  .country-list {
    max-height: 400px;
    overflow-y: auto;
    padding: 10px 0;
  }

  .country-item {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    border: none;
    background: none;
    cursor: pointer;
    transition: background-color 0.2s;
    text-align: left;
  }

  .country-item:hover {
    background: #f5f5f5;
  }

  .country-item.active {
    background: #d6e0fa; /* IBF navy-300 */
    border-left: 4px solid #00214d; /* IBF navy-900 */
  }

  .country-flag {
    font-size: 20px;
    width: 24px;
    text-align: center;
  }

  .country-info {
    flex: 1;
  }

  .country-name {
    font-weight: 500;
    color: #00214d; /* IBF navy-900 */
    font-size: 14px;
    margin-bottom: 2px;
  }

  .country-region {
    font-size: 12px;
    color: #666;
  }

  /* IBF Design System Colors - Exact match to original */
  .ibf-portal {
    --ibf-primary: #00214d; /* IBF navy-900 */
    --ibf-primary-dark: #001c42; /* Darker navy */
    --ibf-secondary: #d6e0fa; /* IBF navy-300 */
    --ibf-accent: #ff9800;
    --ibf-background: #f4f7fa; /* IBF neutral-100 */
    --ibf-surface: #ffffff;
    --ibf-error: #d32f2f;
    --ibf-warning: #f57c00;
    --ibf-success: #388e3c;
  }

  /* Commented out to allow white header override 
  .portal-header {
    background: var(--ibf-primary);
  }

  .portal-title {
    color: white;
  }
  */

  .action-btn.active,
  .timeline-btn.active {
    background: var(--ibf-primary);
    border-color: var(--ibf-primary);
  }

  .action-btn.active:hover,
  .timeline-btn.active:hover {
    background: var(--ibf-primary-dark);
  }

  /* Global body styling with Open Sans font stack */
  :global(body) {
    font-family: 'Open Sans', 'Helvetica Neue', 'Roboto', 'Segoe UI', sans-serif;
  }

  /* Leaflet layer pane z-index configuration (matching original IBF dashboard) */
  :global(.leaflet-ibf-aggregate-pane) {
    z-index: 533;
  }

  :global(.leaflet-ibf-admin-boundaries-pane) {
    z-index: 550;
  }

  :global(.leaflet-ibf-wms-pane) {
    z-index: 575;
    pointer-events: none;
  }

  :global(.leaflet-outline-pane) {
    z-index: 570;
  }

  :global(.leaflet-popup-pane) {
    pointer-events: auto;
  }
</style>

<!-- Login Popup -->
{#if showLoginPopup}
  <LoginPopup 
    on:login-success={handleLoginSuccess}
    on:close={handleLoginClose}
  />
{/if}

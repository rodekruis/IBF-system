<script lang="ts">
  import { onMount, onDestroy, createEventDispatcher } from 'svelte';
  import { selectedCountry } from '../stores/app';
  import { get } from 'svelte/store';
  import { ibfApiService } from '../services/ibfApi';
  import { layerService, type IBFLayer } from '../services/layerService';
  import { authService, isAuthenticated } from '../services/auth';
  import { config } from '../config';
  import LayersControl from './LayersControl.svelte';
  import type { Country } from '../stores/app';

  // Create event dispatcher for communication with parent
  const dispatch = createEventDispatcher();
  
  // Check if we're in browser environment
  const browser = typeof window !== 'undefined';
  
  // Map container element
  let mapContainer: HTMLElement;
  let map: any = null;
  let L: any = null; // Store Leaflet reference
  let adminAreasLayer: any = null;
  let pointLayers: Map<string, any> = new Map(); // Store point layers by name
  let isLoading = true;
  let currentCountryCode: string | null = null;
  let isUpdatingMap = false;
  let updateTimeout: number | null = null;
  let loadedAdminAreasCache = new Map<string, any>();
  let lastProcessedCountryCode: string | null = null;
  let currentCountryName: string = 'IBF Dashboard';
  let mapUpdatePromise: Promise<void> | null = null; // Prevent parallel updates
  let initialLoadingExecuted = false; // Prevent multiple deferred loads
  let availableLayers: IBFLayer[] = [];
  let activeLayers: Set<string> = new Set();
  
  // Component lifecycle
  onMount(async () => {
    if (browser) {
      await initializeMap();
      
      // Defer initial country loading to prevent infinite loops during development
      // Only load if no country has been processed yet
      setTimeout(async () => {
        if (!lastProcessedCountryCode && !initialLoadingExecuted) {
          initialLoadingExecuted = true; // Prevent multiple executions
          const currentCountry = get(selectedCountry);
          if (currentCountry && map) {
            console.log(`🗺️ Deferred initial country loading: ${currentCountry.name}`);
            lastProcessedCountryCode = currentCountry.countryCodeISO3;
            await updateMapForCountry(currentCountry);
          } else {
            console.log(`🚫 Deferred loading blocked - country: ${!!currentCountry}, map: ${!!map}`);
          }
        } else {
          console.log('🔄 Skipping deferred loading - country already processed or loading already executed');
        }
      }, 500); // Small delay to ensure everything is initialized
      
      // Expose a manual update method that can be called from handleCountryChange
      (window as any).updateMapCountry = async (country: Country) => {
        if (!map || !country) {
          console.log('🚫 Cannot update map - missing map or country');
          return;
        }
        
        if (country.countryCodeISO3 === lastProcessedCountryCode) {
          console.log(`🔄 Ignoring duplicate country update: ${country.countryCodeISO3}`);
          return;
        }
        
        console.log(`�️ Manual country update: ${country.name}`);
        await updateMapForCountry(country);
      };
    }
  });
  
  onDestroy(() => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }
    if (map) {
      console.log('✅ Leaflet map being destroyed');
      map.remove();
      map = null;
    }
  });

  async function initializeMap() {
    try {
      // Dynamically import Leaflet
      L = await import('leaflet');
      
      // Initialize the map with IBF dashboard settings
      map = L.map(mapContainer, {
        center: [9.0, 40.0], // Ethiopia center
        zoom: 5, // Match original IBF default zoom
        zoomControl: false, // Disabled initially like original
        attributionControl: true
      });
      
      // Add CartoDB Light basemap (same as original IBF dashboard)
      L.tileLayer('https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png', {
        attribution: '&copy; <a target="_blank" href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a target="_blank" href="https://carto.com/attributions">Carto</a>',
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      // Add zoom control in top left (like original IBF)
      L.control.zoom({
        position: 'topleft'
      }).addTo(map);

      // Create custom panes for proper layer ordering (matching original IBF dashboard)
      map.createPane('leaflet-ibf-wms-pane');
      map.createPane('leaflet-ibf-admin-boundaries-pane');
      map.createPane('leaflet-outline-pane');
      map.createPane('leaflet-ibf-aggregate-pane');
      map.createPane('leaflet-ibf-point-pane');
      
      // Set z-index for panes (matching original IBF dashboard)
      map.getPane('leaflet-ibf-wms-pane').style.zIndex = '200';
      map.getPane('leaflet-ibf-admin-boundaries-pane').style.zIndex = '300';
      map.getPane('leaflet-outline-pane').style.zIndex = '400';
      map.getPane('leaflet-ibf-aggregate-pane').style.zIndex = '500';
      map.getPane('leaflet-ibf-point-pane').style.zIndex = '600';
      
      console.log('✅ Leaflet map initialized successfully');
      isLoading = false;
      
    } catch (error) {
      console.error('❌ Error initializing map:', error);
      isLoading = false;
    }
  }
  
  async function updateMapForCountry(country: Country) {
    if (!map || !browser || !country) {
      console.log(`🚫 updateMapForCountry blocked - map: ${!!map}, browser: ${browser}, country: ${!!country}`);
      return;
    }
    
    // Prevent parallel updates - wait for any existing update to complete
    if (mapUpdatePromise) {
      console.log('⏳ Waiting for existing map update to complete...');
      await mapUpdatePromise;
    }
    
    // Check if this country is already loaded
    if (country.countryCodeISO3 === lastProcessedCountryCode) {
      console.log(`🔄 Country ${country.name} already loaded - skipping`);
      return;
    }
    
    // Create a new update promise to prevent parallel execution
    mapUpdatePromise = (async () => {
      try {
        isUpdatingMap = true;
        console.log(`🗺️ Updating map for ${country.name} (${country.countryCodeISO3})`);
        
        // Set current country code to prevent re-triggering
        currentCountryCode = country.countryCodeISO3;
        lastProcessedCountryCode = country.countryCodeISO3;
        // Update local country name for template use (prevents reactive store access)
        currentCountryName = country.name;
        
        // Clear existing admin areas layer
        if (adminAreasLayer) {
          map.removeLayer(adminAreasLayer);
          adminAreasLayer = null;
        }
        
        // Update map view to country
        if (country.coordinates) {
          map.setView([country.coordinates.lat, country.coordinates.lng], country.defaultZoom || 6);
        }
        
        // Load admin areas from IBF API if enabled and authenticated
        if (config.useIbfApi && (config.disableAuthentication || get(isAuthenticated))) {
          await loadAdminAreas(country.countryCodeISO3, country);
          
          // Load available layers for this country
          await loadCountryLayers(country.countryCodeISO3, 'floods');
        } else {
          console.log('📝 IBF API not configured or not authenticated - skipping admin areas loading');
          // No fallback data - just show the centered map
        }
        
        console.log(`✅ Map update completed for ${country.name}`);
        
      } catch (error) {
        console.error('❌ Error updating map for country:', error);
      } finally {
        isUpdatingMap = false;
        mapUpdatePromise = null; // Clear the promise when done
      }
    })();
    
    return mapUpdatePromise;
  }

  async function loadAdminAreas(countryCode: string, country: Country) {
    try {
      console.log(`📡 Loading admin areas for ${countryCode} using authenticated API...`);
      
      // Check cache first
      if (loadedAdminAreasCache.has(countryCode)) {
        console.log(`✅ Using cached admin areas for ${countryCode}`);
        const cachedData = loadedAdminAreasCache.get(countryCode);
        await displayAdminAreas(cachedData, countryCode);
        return;
      }
      
      const adminAreasResponse = await ibfApiService.getAdminAreas(countryCode, 2);
      
      if (adminAreasResponse.status === 200 && adminAreasResponse.data && adminAreasResponse.data.features) {
        console.log(`✅ Loaded ${adminAreasResponse.data.features.length} admin areas for ${countryCode}`);
        
        // Cache the data
        loadedAdminAreasCache.set(countryCode, adminAreasResponse.data);
        
        await displayAdminAreas(adminAreasResponse.data, countryCode);
        
      } else if (adminAreasResponse.status === 403) {
        console.log(`⚠️ Admin areas access restricted for ${countryCode} - this is normal for limited user accounts`);
      } else {
        console.log(`⚠️ No admin areas data available for ${countryCode}`);
      }
      
    } catch (error) {
      console.error(`❌ Error loading admin areas for ${countryCode}:`, error);
    }
  }

  async function displayAdminAreas(adminData: any, countryCode: string) {
    // Simple check that map is available
    if (!map) {
      console.error('❌ Map not available for admin areas display - skipping');
      return;
    }
    
    console.log('✅ Map is ready - proceeding with admin areas display');
    
    const L = await import('leaflet');
    
    // Add admin areas to map with IBF styling and proper pane
    adminAreasLayer = L.geoJSON(adminData, {
      style: {
        color: '#00214d', // IBF navy-900 primary
        weight: 2,
        opacity: 0.8,
        fillColor: '#d6e0fa', // IBF navy-300
        fillOpacity: 0.2
      },
      pane: 'leaflet-ibf-admin-boundaries-pane', // Use IBF admin boundaries pane
      onEachFeature: (feature: any, layer: any) => {
        const props = feature.properties;
        const districtName = props.adm2_en || props.name || 'Unknown District';
        const regionName = props.adm1_en || props.region || 'Unknown Region';
        
        layer.bindPopup(`
          <div style="font-family: 'Open Sans', 'Helvetica Neue', sans-serif; color: #00214d;">
            <strong style="color: #00214d;">${districtName}</strong><br>
            <span style="color: #666;">${regionName}</span><br>
            <small style="color: #888;">District Code: ${props.adm2_pcode || 'N/A'}</small>
          </div>
        `);
        
        // Add hover effects
        layer.on('mouseover', function() {
          this.setStyle({
            weight: 3,
            fillOpacity: 0.5
          });
          
          // Dispatch hover event to parent
          console.log('🔄 Admin area hovered:', feature.properties.adm2_en);
          dispatch('admin-area-hover', {
            area: feature,
            countryCode: currentCountryCode
          });
        });
        
        layer.on('mouseout', function() {
          this.setStyle({
            weight: 2,
            fillOpacity: 0.2
          });
          
          // Dispatch hover clear event to parent
          console.log('🔄 Admin area hover cleared');
          dispatch('admin-area-hover-clear');
        });
      }
    });
    
    // Double-check map is still available before adding layer
    if (!map) {
      console.error('❌ Map became unavailable during layer creation');
      return;
    }
    
    adminAreasLayer.addTo(map);
    
    // Final validation before fitting bounds
    if (!map) {
      console.error('❌ Map became unavailable after adding layer');
      return;
    }
    
    // Fit map to admin areas bounds
    if (adminAreasLayer.getBounds().isValid()) {
      map.fitBounds(adminAreasLayer.getBounds(), { padding: [20, 20] });
      console.log('🎯 Map bounds fitted to admin areas');
    }
  }

  /**
   * Load available layers for a country
   */
  async function loadCountryLayers(countryCodeISO3: string, disasterType: string) {
    try {
      console.log(`🗂️ Loading layers for ${countryCodeISO3} - ${disasterType}`);
      
      const layers = await layerService.getLayersForCountry(countryCodeISO3, disasterType);
      availableLayers = layers;
      
      // Store user's current layer preferences before clearing
      const userPreferences = new Set(activeLayers);
      const hadUserToggles = userPreferences.size > 0;
      
      // Clear existing layers from map but preserve user preferences
      pointLayers.forEach((layer, name) => {
        if (map && map.hasLayer(layer)) {
          map.removeLayer(layer);
        }
      });
      pointLayers.clear();
      
      // If user had no previous toggles, auto-activate default layers
      if (!hadUserToggles) {
        activeLayers.clear();
        layers.filter(layer => layer.active).forEach(layer => {
          activeLayers.add(layer.name);
        });
        console.log(`🔄 Auto-activated ${activeLayers.size} default layers`);
      } else {
        // Keep user preferences but filter to only available layers
        const availableLayerNames = new Set(layers.map(l => l.name));
        activeLayers = new Set([...userPreferences].filter(name => availableLayerNames.has(name)));
        console.log(`🔄 Preserved ${activeLayers.size} user layer preferences`);
      }
      
      // Load and display active layers
      activeLayers.forEach(layerName => {
        const layer = layers.find(l => l.name === layerName);
        if (layer) {
          loadAndDisplayLayer(layer, countryCodeISO3, disasterType);
        }
      });
      
      console.log(`✅ Loaded ${layers.length} layers, ${activeLayers.size} active`);
      
    } catch (error) {
      console.error('❌ Error loading country layers:', error);
    }
  }

  /**
   * Load and display a specific layer on the map
   */
  async function loadAndDisplayLayer(layer: IBFLayer, countryCodeISO3: string, disasterType: string, eventName?: string) {
    try {
      console.log(`🗺️ Loading layer data: ${layer.name}`);
      
      // Remove existing layer if present
      if (pointLayers.has(layer.name)) {
        map.removeLayer(pointLayers.get(layer.name));
        pointLayers.delete(layer.name);
      }
      
      // Load layer data
      const layerData = await layerService.loadLayerData(layer, countryCodeISO3, disasterType, eventName);
      
      if (!layerData || !layerData.features) {
        console.log(`⚠️ No data available for layer: ${layer.name}`);
        return;
      }
      
      // Create layer group for points
      const layerGroup = L.layerGroup();
      
      // Add points to the layer group
      layerData.features.forEach((feature: any) => {
        if (feature.geometry.type === 'Point') {
          const marker = layerService.createPointMarker(feature, layer.name, L);
          marker.options.pane = 'leaflet-ibf-point-pane';
          layerGroup.addLayer(marker);
        }
      });
      
      // Add layer group to map and store reference
      layerGroup.addTo(map);
      pointLayers.set(layer.name, layerGroup);
      
      console.log(`✅ Displayed ${layerData.features.length} points for layer: ${layer.name}`);
      
    } catch (error) {
      console.error(`❌ Error loading layer ${layer.name}:`, error);
    }
  }

  /**
   * Toggle layer visibility
   */
  export function toggleLayer(layerName: string) {
    if (!currentCountryCode) return;
    
    if (activeLayers.has(layerName)) {
      // Remove layer
      activeLayers.delete(layerName);
      if (pointLayers.has(layerName)) {
        map.removeLayer(pointLayers.get(layerName));
        pointLayers.delete(layerName);
      }
      console.log(`🔄 Layer ${layerName} hidden`);
    } else {
      // Add layer
      activeLayers.add(layerName);
      const layer = availableLayers.find(l => l.name === layerName);
      if (layer) {
        const country = get(selectedCountry);
        if (country) {
          loadAndDisplayLayer(layer, currentCountryCode, 'floods');
        }
      }
      console.log(`🔄 Layer ${layerName} shown`);
    }
    
    // Trigger reactivity update
    activeLayers = new Set(activeLayers);
  }

  /**
   * Get current layer state for layer control
   */
  export function getLayerState() {
    return {
      availableLayers,
      activeLayers: Array.from(activeLayers)
    };
  }
  
  // Export functions for parent component use
  export function setCenter(lat: number, lng: number) {
    if (map && browser) {
      map.setView([lat, lng], map.getZoom());
    }
  }
  
  export function setZoom(newZoom: number) {
    if (map && browser) {
      map.setZoom(newZoom);
    }
  }
  
  export function zoomIn() {
    if (map) map.zoomIn();
  }
  
  export function zoomOut() {
    if (map) map.zoomOut();
  }
  
  export function resetView() {
    // Use the manually tracked country instead of store access to prevent reactivity
    const currentCountry = get(selectedCountry);
    if (map && currentCountry?.coordinates) {
      map.setView([currentCountry.coordinates.lat, currentCountry.coordinates.lng], currentCountry.defaultZoom || 6);
    }
  }
</script>

<div 
  bind:this={mapContainer} 
  class="map-container"
  role="application"
  aria-label="Interactive flood risk map for {currentCountryName}"
>
  <!-- Loading state -->
  {#if !map || isUpdatingMap}
    <div class="loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">
        {#if !map}
          Loading map...
        {:else if isUpdatingMap}
          Loading {currentCountryName} data...
        {/if}
      </div>
    </div>
  {/if}
  
  <!-- Layers Control -->
  {#if map && availableLayers.length > 0}
    <LayersControl 
      {availableLayers}
      activeLayers={Array.from(activeLayers)}
      isVisible={true}
      on:toggle-layer={(event) => toggleLayer(event.detail.layerName)}
    />
  {/if}
</div>
<style>
  .map-container {
    width: 100%;
    height: 100%;
    position: relative;
    background: var(--ibf-grey-100);
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
  
  .loading-text {
    margin-top: 1rem;
    color: var(--ibf-grey-600);
    font-size: 0.875rem;
  }
  
  /* Override Leaflet styles to match IBF theme */
  :global(.leaflet-container) {
    font-family: var(--ibf-font-family);
    border-radius: 8px;
  }
  
  :global(.leaflet-control-layers) {
    background: var(--ibf-white);
    border: 1px solid var(--ibf-grey-300);
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  :global(.leaflet-control-layers-expanded) {
    padding: 12px;
  }
  
  :global(.leaflet-control-layers label) {
    font-size: 0.875rem;
    color: var(--ibf-grey-700);
  }
  
  :global(.leaflet-popup-content-wrapper) {
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }
  
  :global(.leaflet-popup-content) {
    margin: 12px;
    font-family: var(--ibf-font-family);
  }
  
  :global(.ibf-control) {
    background: var(--ibf-white) !important;
    border: 1px solid var(--ibf-grey-300) !important;
    border-radius: 8px !important;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1) !important;
  }
  
  :global(.leaflet-control-zoom a) {
    background-color: var(--ibf-primary);
    color: var(--ibf-white);
    border: none;
    width: 30px;
    height: 30px;
    line-height: 30px;
    text-align: center;
    text-decoration: none;
    font-weight: bold;
    border-radius: 4px;
    margin-bottom: 1px;
  }
  
  :global(.leaflet-control-zoom a:hover) {
    background-color: var(--ibf-primary-shade);
  }
  
  :global(.leaflet-control-scale-line) {
    background: rgba(255, 255, 255, 0.8);
    border: 2px solid var(--ibf-grey-600);
    border-top: none;
    color: var(--ibf-grey-800);
    font-size: 11px;
    line-height: 1.1;
    padding: 2px 5px 1px;
  }
</style>

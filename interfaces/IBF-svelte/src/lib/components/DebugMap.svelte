<script lang="ts">
  import { onMount } from 'svelte';
  
  let mapContainer: HTMLDivElement;
  let mapStatus = 'Loading map...';
  
  onMount(async () => {
    try {
      mapStatus = 'Importing OpenLayers...';
      
      // Dynamic imports to better handle any loading issues
      const { Map, View } = await import('ol');
      const TileLayer = (await import('ol/layer/Tile')).default;
      const OSM = (await import('ol/source/OSM')).default;
      const { fromLonLat } = await import('ol/proj');
      
      mapStatus = 'Creating map...';
      
      // Initialize the map
      const map = new Map({
        target: mapContainer,
        layers: [
          new TileLayer({
            source: new OSM()
          })
        ],
        view: new View({
          center: fromLonLat([20, 0]), // Africa center
          zoom: 3
        })
      });
      
      mapStatus = 'Map created successfully!';
      
      // Force size update
      setTimeout(() => {
        map.updateSize();
      }, 100);
      
    } catch (error) {
      console.error('Map initialization error:', error);
      mapStatus = `Error: ${error.message}`;
    }
  });
</script>

<div class="debug-map">
  <div class="status">
    Status: {mapStatus}
  </div>
  
  <div 
    bind:this={mapContainer} 
    class="map-container"
    style="width: 100%; height: 400px; background: #f0f0f0; border: 2px dashed #ccc;"
  >
    <div class="loading-text">Map container ready...</div>
  </div>
</div>

<style>
  .debug-map {
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    margin: 10px;
  }
  
  .status {
    background: #e3f2fd;
    padding: 10px;
    border-radius: 4px;
    margin-bottom: 10px;
    font-family: monospace;
  }
  
  .map-container {
    position: relative;
  }
  
  .loading-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #666;
    font-style: italic;
  }
</style>

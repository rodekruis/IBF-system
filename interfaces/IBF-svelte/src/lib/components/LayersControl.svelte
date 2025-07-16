<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { IBFLayer } from '../services/layerService';
  
  // Props
  export let availableLayers: IBFLayer[] = [];
  export let activeLayers: string[] = [];
  export let isVisible: boolean = true;
  
  // Events
  const dispatch = createEventDispatcher();
  
  let isCollapsed = false;
  
  // Group layers by type for better organization
  $: layerGroups = groupLayers(availableLayers);
  
  function groupLayers(layers: IBFLayer[]) {
    const groups = {
      point: [] as IBFLayer[],
      shape: [] as IBFLayer[],
      wms: [] as IBFLayer[]
    };
    
    layers.forEach(layer => {
      if (groups[layer.type]) {
        groups[layer.type].push(layer);
      }
    });
    
    // Sort layers within each group by order
    Object.keys(groups).forEach(groupKey => {
      groups[groupKey].sort((a, b) => (a.order || 10) - (b.order || 10));
    });
    
    return groups;
  }
  
  function toggleLayer(layerName: string) {
    dispatch('toggle-layer', { layerName });
  }
  
  function isLayerActive(layerName: string): boolean {
    return activeLayers.includes(layerName);
  }
</script>

{#if isVisible && availableLayers.length > 0}
  <div class="layers-control" class:collapsed={isCollapsed}>
    <!-- Header -->
    <div class="layers-header" on:click={() => isCollapsed = !isCollapsed} on:keypress={(e) => e.key === 'Enter' && (isCollapsed = !isCollapsed)} role="button" tabindex="0">
      <h3>Map Layers</h3>
      <button 
        class="collapse-btn"
        aria-label={isCollapsed ? 'Expand layers panel' : 'Collapse layers panel'}
      >
        <svg class="icon" class:rotated={isCollapsed} viewBox="0 0 24 24">
          <path d="M7 10l5 5 5-5z"/>
        </svg>
      </button>
    </div>
    
    <!-- Layers Content -->
    {#if !isCollapsed}
      <div class="layers-content">
        
        <!-- Point Layers -->
        {#if layerGroups.point.length > 0}
          <div class="layer-group">
            <h4>Point Data</h4>
            {#each layerGroups.point as layer}
              <div class="layer-item">
                <label class="layer-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isLayerActive(layer.name)}
                    on:change={() => toggleLayer(layer.name)}
                  />
                  <span class="checkmark"></span>
                  <span class="layer-label">{layer.label}</span>
                </label>
                {#if layer.description}
                  <div class="layer-description" title={layer.description}>
                    ℹ️
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
        
        <!-- Shape Layers -->
        {#if layerGroups.shape.length > 0}
          <div class="layer-group">
            <h4>Boundaries</h4>
            {#each layerGroups.shape as layer}
              <div class="layer-item">
                <label class="layer-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isLayerActive(layer.name)}
                    on:change={() => toggleLayer(layer.name)}
                  />
                  <span class="checkmark"></span>
                  <span class="layer-label">{layer.label}</span>
                </label>
                {#if layer.description}
                  <div class="layer-description" title={layer.description}>
                    ℹ️
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
        
        <!-- WMS Layers -->
        {#if layerGroups.wms.length > 0}
          <div class="layer-group">
            <h4>Raster Data</h4>
            {#each layerGroups.wms as layer}
              <div class="layer-item">
                <label class="layer-checkbox">
                  <input 
                    type="checkbox" 
                    checked={isLayerActive(layer.name)}
                    on:change={() => toggleLayer(layer.name)}
                  />
                  <span class="checkmark"></span>
                  <span class="layer-label">{layer.label}</span>
                </label>
                {#if layer.description}
                  <div class="layer-description" title={layer.description}>
                    ℹ️
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
        
        {#if availableLayers.length === 0}
          <div class="no-layers">
            <p>No layers available for this country</p>
          </div>
        {/if}
        
      </div>
    {/if}
  </div>
{/if}

<style>
  .layers-control {
    position: absolute;
    top: 10px;
    right: 10px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    font-family: 'Open Sans', 'Helvetica Neue', sans-serif;
    font-size: 13px;
    min-width: 200px;
    max-width: 300px;
    z-index: 1000;
    transition: all 0.3s ease;
  }
  
  .layers-control.collapsed {
    min-width: auto;
  }
  
  .layers-header {
    padding: 8px 12px;
    background: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }
  
  .layers-header:hover {
    background: #e9ecef;
  }
  
  .layers-header h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #00214d;
  }
  
  .collapse-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 2px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .icon {
    width: 16px;
    height: 16px;
    fill: #666;
    transition: transform 0.3s ease;
  }
  
  .icon.rotated {
    transform: rotate(-90deg);
  }
  
  .layers-content {
    max-height: 400px;
    overflow-y: auto;
    padding: 8px 0;
  }
  
  .layer-group {
    margin-bottom: 12px;
    padding: 0 12px;
  }
  
  .layer-group:last-child {
    margin-bottom: 0;
  }
  
  .layer-group h4 {
    margin: 0 0 6px 0;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .layer-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 4px;
    padding: 2px 0;
  }
  
  .layer-checkbox {
    display: flex;
    align-items: center;
    cursor: pointer;
    flex: 1;
    position: relative;
  }
  
  .layer-checkbox input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }
  
  .checkmark {
    position: relative;
    width: 16px;
    height: 16px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 3px;
    margin-right: 8px;
    flex-shrink: 0;
    transition: all 0.2s ease;
  }
  
  .layer-checkbox:hover .checkmark {
    border-color: #00214d;
  }
  
  .layer-checkbox input:checked ~ .checkmark {
    background: #00214d;
    border-color: #00214d;
  }
  
  .layer-checkbox input:checked ~ .checkmark::after {
    content: '';
    position: absolute;
    left: 4px;
    top: 1px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
  }
  
  .layer-label {
    color: #333;
    font-size: 13px;
    line-height: 1.4;
    user-select: none;
  }
  
  .layer-description {
    margin-left: 8px;
    font-size: 12px;
    color: #666;
    cursor: help;
    opacity: 0.7;
  }
  
  .layer-description:hover {
    opacity: 1;
  }
  
  .no-layers {
    padding: 20px 12px;
    text-align: center;
    color: #666;
    font-style: italic;
  }
  
  .no-layers p {
    margin: 0;
  }
  
  /* Scrollbar styling */
  .layers-content::-webkit-scrollbar {
    width: 6px;
  }
  
  .layers-content::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }
  
  .layers-content::-webkit-scrollbar-thumb {
    background: #ccc;
    border-radius: 3px;
  }
  
  .layers-content::-webkit-scrollbar-thumb:hover {
    background: #999;
  }
</style>

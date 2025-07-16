<script lang="ts">
  import { activeLayers } from '../stores/app';
  
  export let layers: any[] = [];
  export let compact = false;
  export let maxHeight = '300px';
  
  function toggleLayer(layer: any) {
    activeLayers.update(current => {
      const exists = current.find(l => l.id === layer.id);
      if (exists) {
        // Toggle visibility
        return current.map(l => 
          l.id === layer.id 
            ? { ...l, visible: !l.visible }
            : l
        );
      } else {
        // Add new layer
        return [...current, { ...layer, visible: true }];
      }
    });
  }
  
  function updateLayerOpacity(layerId: string, opacity: number) {
    activeLayers.update(current =>
      current.map(layer =>
        layer.id === layerId
          ? { ...layer, opacity: opacity / 100 }
          : layer
      )
    );
  }
  
  function isLayerVisible(layerId: string): boolean {
    return $activeLayers.some(layer => layer.id === layerId && layer.visible);
  }
  
  function getLayerOpacity(layerId: string): number {
    const layer = $activeLayers.find(l => l.id === layerId);
    return layer ? Math.round((layer.opacity || 1) * 100) : 100;
  }
  
  // Group layers by category for better organization
  $: groupedLayers = layers.reduce((groups, layer) => {
    const category = layer.category || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(layer);
    return groups;
  }, {} as Record<string, any[]>);
  
  $: categories = Object.keys(groupedLayers).sort();
</script>

<div class="layer-panel" class:compact style="max-height: {maxHeight};">
  <div class="panel-header">
    <h3>Map Layers</h3>
    <div class="layer-count">{layers.length} available</div>
  </div>
  
  <div class="layers-container">
    {#if categories.length > 0}
      {#each categories as category}
        <div class="layer-category">
          <h4 class="category-title">{category}</h4>
          
          {#each groupedLayers[category] as layer (layer.id)}
            <div class="layer-item">
              <div class="layer-header">
                <label class="layer-toggle">
                  <input
                    type="checkbox"
                    checked={isLayerVisible(layer.id)}
                    on:change={() => toggleLayer(layer)}
                  />
                  <span class="checkmark"></span>
                  <div class="layer-info">
                    <div class="layer-name">{layer.name || layer.id}</div>
                    {#if layer.description && !compact}
                      <div class="layer-description">{layer.description}</div>
                    {/if}
                  </div>
                </label>
                
                {#if layer.legend}
                  <button 
                    class="legend-toggle"
                    title="Show legend"
                    on:click={() => {
                      // Toggle legend visibility (you can implement this)
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                  </button>
                {/if}
              </div>
              
              {#if isLayerVisible(layer.id) && !compact}
                <div class="layer-controls">
                  <div class="opacity-control">
                    <label for="opacity-{layer.id}">Opacity:</label>
                    <input
                      id="opacity-{layer.id}"
                      type="range"
                      min="0"
                      max="100"
                      value={getLayerOpacity(layer.id)}
                      on:input={(e) => updateLayerOpacity(layer.id, parseInt(e.target.value))}
                      class="opacity-slider"
                    />
                    <span class="opacity-value">{getLayerOpacity(layer.id)}%</span>
                  </div>
                  
                  {#if layer.attribution}
                    <div class="layer-attribution">
                      <small>{layer.attribution}</small>
                    </div>
                  {/if}
                </div>
              {/if}
              
              {#if layer.legend && isLayerVisible(layer.id)}
                <div class="layer-legend">
                  {#if typeof layer.legend === 'string'}
                    <img src={layer.legend} alt="Layer legend" class="legend-image" />
                  {:else if Array.isArray(layer.legend)}
                    <div class="legend-items">
                      {#each layer.legend as item}
                        <div class="legend-item">
                          <div 
                            class="legend-color" 
                            style="background-color: {item.color};"
                          ></div>
                          <span class="legend-label">{item.label}</span>
                        </div>
                      {/each}
                    </div>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>
      {/each}
    {:else}
      <div class="no-layers">
        <p>No layers available</p>
        <small>Layers will appear here when you select a country and disaster type.</small>
      </div>
    {/if}
  </div>
</div>

<style>
  .layer-panel {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    font-size: 0.875rem;
  }
  
  .panel-header {
    padding: 12px 16px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .panel-header h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
  
  .layer-count {
    font-size: 0.75rem;
    color: #6b7280;
    background: #e5e7eb;
    padding: 2px 6px;
    border-radius: 10px;
  }
  
  .layers-container {
    overflow-y: auto;
    max-height: calc(100% - 60px);
  }
  
  .layer-category {
    border-bottom: 1px solid #f3f4f6;
  }
  
  .category-title {
    margin: 0;
    padding: 8px 16px;
    font-size: 0.75rem;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    background: #f9fafb;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .layer-item {
    border-bottom: 1px solid #f3f4f6;
  }
  
  .layer-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px 16px;
  }
  
  .layer-toggle {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    cursor: pointer;
    flex: 1;
  }
  
  .layer-toggle input[type="checkbox"] {
    position: absolute;
    opacity: 0;
    cursor: pointer;
  }
  
  .checkmark {
    width: 16px;
    height: 16px;
    border: 2px solid #d1d5db;
    border-radius: 3px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    flex-shrink: 0;
    margin-top: 2px;
  }
  
  .layer-toggle input:checked + .checkmark {
    background-color: #3b82f6;
    border-color: #3b82f6;
  }
  
  .layer-toggle input:checked + .checkmark::after {
    content: '✓';
    color: white;
    font-size: 10px;
    font-weight: bold;
  }
  
  .layer-info {
    flex: 1;
  }
  
  .layer-name {
    font-weight: 500;
    color: #374151;
    margin-bottom: 2px;
  }
  
  .layer-description {
    font-size: 0.75rem;
    color: #6b7280;
    line-height: 1.3;
  }
  
  .legend-toggle {
    background: none;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: all 0.2s ease;
  }
  
  .legend-toggle:hover {
    background: #f3f4f6;
    color: #374151;
  }
  
  .layer-controls {
    padding: 8px 16px 12px;
    background: #f9fafb;
    border-top: 1px solid #f3f4f6;
  }
  
  .opacity-control {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  
  .opacity-control label {
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 50px;
  }
  
  .opacity-slider {
    flex: 1;
    height: 4px;
    border-radius: 2px;
    background: #e5e7eb;
    outline: none;
    -webkit-appearance: none;
  }
  
  .opacity-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
  }
  
  .opacity-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #3b82f6;
    cursor: pointer;
    border: none;
  }
  
  .opacity-value {
    font-size: 0.75rem;
    color: #6b7280;
    min-width: 35px;
    text-align: right;
  }
  
  .layer-attribution {
    font-size: 0.7rem;
    color: #9ca3af;
    font-style: italic;
  }
  
  .layer-legend {
    padding: 8px 16px 12px;
    background: #f9fafb;
    border-top: 1px solid #f3f4f6;
  }
  
  .legend-image {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  .legend-items {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .legend-color {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    border: 1px solid #d1d5db;
    flex-shrink: 0;
  }
  
  .legend-label {
    font-size: 0.75rem;
    color: #374151;
  }
  
  .no-layers {
    padding: 24px 16px;
    text-align: center;
    color: #6b7280;
  }
  
  .no-layers p {
    margin: 0 0 8px 0;
    font-weight: 500;
  }
  
  .no-layers small {
    font-size: 0.75rem;
    color: #9ca3af;
  }
  
  /* Compact mode */
  .compact .panel-header {
    padding: 8px 12px;
  }
  
  .compact .layer-header {
    padding: 6px 12px;
  }
  
  .compact .category-title {
    padding: 6px 12px;
    font-size: 0.7rem;
  }
  
  .compact .layer-name {
    font-size: 0.8rem;
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .layer-panel {
      font-size: 0.8rem;
    }
    
    .opacity-control {
      flex-wrap: wrap;
    }
    
    .opacity-control label {
      min-width: auto;
    }
  }
</style>

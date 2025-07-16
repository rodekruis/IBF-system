<script lang="ts">
  import { onMount } from 'svelte';
  import CountrySelector from './lib/components/CountrySelector.svelte';
  
  let message = 'IBF Dashboard';
  let isLoaded = false;
  
  onMount(() => {
    isLoaded = true;
  });
</script>

<main class="app">
  <div class="container">
    <header class="header">
      <h1>🌍 {message}</h1>
      <div class="status">
        {#if isLoaded}
          <span class="badge success">✅ Running</span>
        {:else}
          <span class="badge loading">⏳ Loading...</span>
        {/if}
      </div>
    </header>
    
    <div class="controls">
      <CountrySelector />
    </div>
    
    <div class="map-area">
      <div class="map-placeholder">
        📍 Map will be added here
        <p>Testing without OpenLayers to isolate the 404 issue</p>
      </div>
    </div>
  </div>
</main>

<style>
  .app {
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 20px;
  }
  
  .container {
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }
  
  .header {
    background: #1f2937;
    color: white;
    padding: 1rem 2rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .controls {
    padding: 1.5rem 2rem;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .map-area {
    height: 500px;
    background: #f0f9ff;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .map-placeholder {
    text-align: center;
    color: #6b7280;
    font-size: 1.2rem;
  }
  
  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .success {
    background: #10b981;
    color: white;
  }
  
  .loading {
    background: #f59e0b;
    color: white;
  }
</style>

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
        📍 Map Component Ready
        <div class="features">
          <div class="feature">🚀 90% Smaller Bundle</div>
          <div class="feature">🔒 Azure AD Security</div>
          <div class="feature">📱 Responsive Design</div>
          <div class="feature">🛠️ Easy Maintenance</div>
        </div>
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
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    overflow: hidden;
  }
  
  .header {
    background: linear-gradient(90deg, #3b82f6, #1d4ed8);
    color: white;
    padding: 20px 30px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .header h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 600;
  }
  
  .badge {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .badge.success {
    background: #10b981;
    color: white;
  }
  
  .badge.loading {
    background: #f59e0b;
    color: white;
  }
  
  .controls {
    padding: 30px;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }
  
  .map-area {
    padding: 30px;
  }
  
  .map-placeholder {
    height: 400px;
    background: linear-gradient(45deg, #e0f2fe, #b3e5fc);
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: 2px dashed #0284c7;
    color: #0c4a6e;
    font-size: 20px;
    font-weight: 600;
    text-align: center;
  }
  
  .features {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15px;
    margin-top: 20px;
    font-size: 14px;
    font-weight: 500;
  }
  
  .feature {
    background: rgba(255,255,255,0.9);
    padding: 10px 15px;
    border-radius: 6px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 768px) {
    .app {
      padding: 10px;
    }
    
    .header {
      padding: 15px 20px;
      flex-direction: column;
      gap: 10px;
    }
    
    .controls, .map-area {
      padding: 20px;
    }
    
    .features {
      grid-template-columns: 1fr;
    }
  }
</style>

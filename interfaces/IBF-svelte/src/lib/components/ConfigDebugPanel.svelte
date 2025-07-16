<script lang="ts">
  import config from '../config';
  
  export let showDetails = false;
  
  function toggleDetails() {
    showDetails = !showDetails;
  }
  
  function testConfiguration() {
    console.log('🔧 Current Configuration:', config);
    console.log('Environment Variables:', {
      VITE_DISABLE_AUTHENTICATION: import.meta.env.VITE_DISABLE_AUTHENTICATION,
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
      VITE_USE_IBF_API: import.meta.env.VITE_USE_IBF_API,
      VITE_DEBUG_MODE: import.meta.env.VITE_DEBUG_MODE,
      VITE_SHOW_DEBUG_PANEL: import.meta.env.VITE_SHOW_DEBUG_PANEL
    });
  }
</script>

<div class="config-debug">
  <button class="config-toggle" on:click={toggleDetails}>
    🔧 Configuration {showDetails ? '▼' : '▶'}
  </button>
  
  {#if showDetails}
    <div class="config-details">
      <h4>🔧 Current Configuration</h4>
      
      <div class="config-grid">
        <div class="config-item">
          <span class="label">Authentication:</span>
          <span class="value {config.disableAuthentication ? 'disabled' : 'enabled'}">
            {config.disableAuthentication ? '🔓 DISABLED' : '🔒 ENABLED'}
          </span>
        </div>
        
        <div class="config-item">
          <span class="label">Data Source:</span>
          <span class="value">
            {#if config.useMockData}
              📝 Mock Data
            {:else if config.useIbfApi}
              🌍 IBF API
            {:else}
              🔗 Custom API
            {/if}
          </span>
        </div>
        
        <div class="config-item">
          <span class="label">Debug Mode:</span>
          <span class="value {config.debugMode ? 'enabled' : 'disabled'}">
            {config.debugMode ? '✅ ON' : '❌ OFF'}
          </span>
        </div>
        
        <div class="config-item">
          <span class="label">Debug Panel:</span>
          <span class="value {config.showDebugPanel ? 'enabled' : 'disabled'}">
            {config.showDebugPanel ? '✅ VISIBLE' : '❌ HIDDEN'}
          </span>
        </div>
      </div>
      
      <div class="config-actions">
        <button class="test-btn" on:click={testConfiguration}>
          🧪 Test Configuration
        </button>
      </div>
      
      <div class="config-help">
        <h5>💡 Quick Fixes:</h5>
        <ul>
          <li><strong>Still seeing login?</strong> Check that VITE_DISABLE_AUTHENTICATION=true in .env.local</li>
          <li><strong>Want IBF API?</strong> Set VITE_USE_IBF_API=true and VITE_USE_MOCK_DATA=false</li>
          <li><strong>Environment not updating?</strong> Restart the dev server (Ctrl+C, then npm run dev)</li>
        </ul>
      </div>
    </div>
  {/if}
</div>

<style>
  .config-debug {
    margin: 15px 0;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }
  
  .config-toggle {
    width: 100%;
    padding: 12px 16px;
    background: #f3f4f6;
    border: none;
    border-radius: 8px 8px 0 0;
    cursor: pointer;
    font-weight: 500;
    text-align: left;
    transition: background-color 0.2s;
  }
  
  .config-toggle:hover {
    background: #e5e7eb;
  }
  
  .config-details {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
  }
  
  .config-details h4 {
    margin: 0 0 12px 0;
    color: #374151;
    font-size: 14px;
  }
  
  .config-details h5 {
    margin: 16px 0 8px 0;
    color: #374151;
    font-size: 13px;
  }
  
  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .config-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: white;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    font-size: 12px;
  }
  
  .label {
    color: #6b7280;
    font-weight: 500;
  }
  
  .value {
    font-weight: 600;
  }
  
  .value.enabled {
    color: #059669;
  }
  
  .value.disabled {
    color: #dc2626;
  }
  
  .config-actions {
    margin: 12px 0;
  }
  
  .test-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    font-weight: 500;
  }
  
  .test-btn:hover {
    background: #2563eb;
  }
  
  .config-help {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    border-radius: 4px;
    padding: 12px;
    margin-top: 12px;
  }
  
  .config-help ul {
    margin: 8px 0 0 0;
    padding-left: 16px;
    font-size: 11px;
    line-height: 1.4;
  }
  
  .config-help li {
    margin: 4px 0;
    color: #92400e;
  }
  
  @media (max-width: 768px) {
    .config-grid {
      grid-template-columns: 1fr;
    }
  }
</style>

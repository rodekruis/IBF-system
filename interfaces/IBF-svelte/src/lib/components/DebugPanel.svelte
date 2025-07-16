<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../services/api';
  
  let testResults: any = {};
  let testing = false;
  
  async function runTests() {
    testing = true;
    testResults = {};
    
    try {
      // Test countries endpoint
      const countriesResult = await api.getCountries();
      testResults.countries = {
        success: !!countriesResult.data,
        count: countriesResult.data?.length || 0,
        error: countriesResult.error
      };
      
      // Test dashboard data for Uganda
      const dashboardResult = await api.getDashboardData('UGA');
      testResults.dashboard = {
        success: !!dashboardResult.data,
        hasEvents: !!dashboardResult.data?.events?.length,
        hasLayers: !!dashboardResult.data?.layers?.length,
        error: dashboardResult.error
      };
      
      // Test health check
      const healthResult = await api.healthCheck();
      testResults.health = {
        success: !!healthResult.data,
        status: healthResult.data?.status,
        error: healthResult.error
      };
      
    } catch (error) {
      testResults.error = error.message;
    } finally {
      testing = false;
    }
  }
  
  onMount(() => {
    runTests();
  });
</script>

<div class="debug-panel">
  <h3>🔧 API Debug Panel</h3>
  
  <button on:click={runTests} disabled={testing} class="test-button">
    {#if testing}
      🔄 Testing...
    {:else}
      🧪 Run Tests
    {/if}
  </button>
  
  {#if Object.keys(testResults).length > 0}
    <div class="test-results">
      {#if testResults.countries}
        <div class="test-item" class:success={testResults.countries.success} class:error={!testResults.countries.success}>
          <strong>Countries API:</strong>
          {#if testResults.countries.success}
            ✅ {testResults.countries.count} countries loaded
          {:else}
            ❌ {testResults.countries.error}
          {/if}
        </div>
      {/if}
      
      {#if testResults.dashboard}
        <div class="test-item" class:success={testResults.dashboard.success} class:error={!testResults.dashboard.success}>
          <strong>Dashboard API:</strong>
          {#if testResults.dashboard.success}
            ✅ Dashboard loaded
            {#if testResults.dashboard.hasEvents}📍 Has events{/if}
            {#if testResults.dashboard.hasLayers}🗺️ Has layers{/if}
          {:else}
            ❌ {testResults.dashboard.error}
          {/if}
        </div>
      {/if}
      
      {#if testResults.health}
        <div class="test-item" class:success={testResults.health.success} class:error={!testResults.health.success}>
          <strong>Health Check:</strong>
          {#if testResults.health.success}
            ✅ {testResults.health.status}
          {:else}
            ❌ {testResults.health.error}
          {/if}
        </div>
      {/if}
      
      {#if testResults.error}
        <div class="test-item error">
          <strong>General Error:</strong> ❌ {testResults.error}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .debug-panel {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin: 10px 0;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 12px;
  }
  
  .debug-panel h3 {
    margin: 0 0 12px 0;
    color: #374151;
    font-size: 14px;
  }
  
  .test-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 12px;
    margin-bottom: 12px;
  }
  
  .test-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
  
  .test-results {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .test-item {
    padding: 8px 12px;
    border-radius: 4px;
    border-left: 4px solid #6b7280;
  }
  
  .test-item.success {
    background: #f0f9ff;
    border-left-color: #10b981;
  }
  
  .test-item.error {
    background: #fef2f2;
    border-left-color: #ef4444;
  }
</style>

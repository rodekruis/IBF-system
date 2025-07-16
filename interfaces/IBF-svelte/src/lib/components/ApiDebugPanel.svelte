<script lang="ts">
  import { onMount } from 'svelte';
  import { api } from '../services/api';
  import { ibfApiService } from '../services/ibfApi';
  import config from '../config';
  
  let apiStatus = 'checking...';
  let ibfApiStatus = 'checking...';
  let mockDataStatus = 'available';
  let currentMode = 'unknown';
  
  let testResults: any = {};
  let isTestingIBF = false;
  
  onMount(() => {
    updateStatus();
  });
  
  function updateStatus() {
    // Current configuration
    if (config.useMockData) {
      currentMode = 'Mock Data';
    } else if (config.useIbfApi) {
      currentMode = 'IBF API';
    } else {
      currentMode = 'Custom API';
    }
  }
  
  async function testMockData() {
    try {
      const result = await api.healthCheck();
      if (result.data) {
        mockDataStatus = 'working';
      } else {
        mockDataStatus = 'error: ' + result.error;
      }
    } catch (error) {
      mockDataStatus = 'error: ' + (error as Error).message;
    }
  }
  
  async function testIBFApi() {
    isTestingIBF = true;
    testResults = {};
    
    try {
      console.log('Testing IBF API connectivity...');
      
      // Test health check
      const healthResult = await ibfApiService.healthCheck();
      testResults.health = healthResult;
      
      // Test countries
      const countriesResult = await ibfApiService.getCountries();
      testResults.countries = {
        success: !!countriesResult.data,
        count: countriesResult.data?.length || 0,
        error: countriesResult.error
      };
      
      // Test first country details if available
      if (countriesResult.data && countriesResult.data.length > 0) {
        const firstCountry = countriesResult.data[0];
        
        // Test disaster types
        const disasterResult = await ibfApiService.getDisasterTypes(firstCountry.countryCodeISO3);
        testResults.disasters = {
          country: firstCountry.countryCodeISO3,
          success: !!disasterResult.data,
          count: disasterResult.data?.length || 0,
          error: disasterResult.error
        };
        
        // Test admin areas
        const adminResult = await ibfApiService.getAdminAreas(firstCountry.countryCodeISO3);
        testResults.adminAreas = {
          country: firstCountry.countryCodeISO3,
          success: !!adminResult.data,
          count: adminResult.data?.length || 0,
          error: adminResult.error
        };
        
        // Test events if disaster types available
        if (disasterResult.data && disasterResult.data.length > 0) {
          const firstDisaster = disasterResult.data[0];
          const eventsResult = await ibfApiService.getEvents(
            firstCountry.countryCodeISO3, 
            firstDisaster.disasterType
          );
          testResults.events = {
            country: firstCountry.countryCodeISO3,
            disaster: firstDisaster.disasterType,
            success: !!eventsResult.data,
            count: eventsResult.data?.length || 0,
            error: eventsResult.error
          };
        }
      }
      
      ibfApiStatus = 'tested - check results below';
    } catch (error) {
      ibfApiStatus = 'error: ' + (error as Error).message;
      testResults.error = (error as Error).message;
    } finally {
      isTestingIBF = false;
    }
  }
  
  async function testCurrentAPI() {
    try {
      const result = await api.healthCheck();
      if (result.data) {
        apiStatus = 'working';
      } else {
        apiStatus = 'error: ' + result.error;
      }
    } catch (error) {
      apiStatus = 'error: ' + (error as Error).message;
    }
  }
</script>

<div class="api-debug-panel">
  <h3>🔧 API Debug Panel</h3>
  
  <div class="status-section">
    <h4>Current Configuration</h4>
    <div class="status-grid">
      <div class="status-item">
        <span class="label">Mode:</span>
        <span class="value mode">{currentMode}</span>
      </div>
      <div class="status-item">
        <span class="label">Mock Data:</span>
        <span class="value" class:enabled={config.useMockData}>
          {config.useMockData ? 'Enabled' : 'Disabled'}
        </span>
      </div>
      <div class="status-item">
        <span class="label">IBF API:</span>
        <span class="value" class:enabled={config.useIbfApi}>
          {config.useIbfApi ? 'Enabled' : 'Disabled'}
        </span>
      </div>
    </div>
  </div>
  
  <div class="actions-section">
    <h4>API Testing</h4>
    <div class="action-buttons">
      <button on:click={testCurrentAPI} class="test-btn">
        Test Current API
      </button>
      <button on:click={testMockData} class="test-btn">
        Test Mock Data
      </button>
      <button 
        on:click={testIBFApi} 
        class="test-btn ibf-btn" 
        disabled={isTestingIBF}
      >
        {isTestingIBF ? 'Testing IBF API...' : 'Test IBF API'}
      </button>
    </div>
    
    <div class="status-results">
      <div class="status-item">
        <span class="label">Current API:</span>
        <span class="value">{apiStatus}</span>
      </div>
      <div class="status-item">
        <span class="label">Mock Data:</span>
        <span class="value">{mockDataStatus}</span>
      </div>
      <div class="status-item">
        <span class="label">IBF API:</span>
        <span class="value">{ibfApiStatus}</span>
      </div>
    </div>
  </div>
  
  {#if Object.keys(testResults).length > 0}
    <div class="test-results">
      <h4>IBF API Test Results</h4>
      
      {#if testResults.health}
        <div class="result-item">
          <strong>Health Check:</strong>
          {#if testResults.health.data}
            <span class="success">✅ {testResults.health.data.status}</span>
          {:else}
            <span class="error">❌ {testResults.health.error}</span>
          {/if}
        </div>
      {/if}
      
      {#if testResults.countries}
        <div class="result-item">
          <strong>Countries:</strong>
          {#if testResults.countries.success}
            <span class="success">✅ {testResults.countries.count} countries loaded</span>
          {:else}
            <span class="error">❌ {testResults.countries.error}</span>
          {/if}
        </div>
      {/if}
      
      {#if testResults.disasters}
        <div class="result-item">
          <strong>Disasters ({testResults.disasters.country}):</strong>
          {#if testResults.disasters.success}
            <span class="success">✅ {testResults.disasters.count} disaster types</span>
          {:else}
            <span class="error">❌ {testResults.disasters.error}</span>
          {/if}
        </div>
      {/if}
      
      {#if testResults.adminAreas}
        <div class="result-item">
          <strong>Admin Areas ({testResults.adminAreas.country}):</strong>
          {#if testResults.adminAreas.success}
            <span class="success">✅ {testResults.adminAreas.count} admin areas</span>
          {:else}
            <span class="error">❌ {testResults.adminAreas.error}</span>
          {/if}
        </div>
      {/if}
      
      {#if testResults.events}
        <div class="result-item">
          <strong>Events ({testResults.events.country}/{testResults.events.disaster}):</strong>
          {#if testResults.events.success}
            <span class="success">✅ {testResults.events.count} events</span>
          {:else}
            <span class="error">❌ {testResults.events.error}</span>
          {/if}
        </div>
      {/if}
      
      {#if testResults.error}
        <div class="result-item">
          <strong>Error:</strong>
          <span class="error">❌ {testResults.error}</span>
        </div>
      {/if}
    </div>
  {/if}
  
  <div class="instructions">
    <h4>How to Switch to IBF API</h4>
    <ol>
      <li>Create <code>.env.local</code> file</li>
      <li>Set <code>VITE_USE_IBF_API=true</code></li>
      <li>Set <code>VITE_USE_MOCK_DATA=false</code></li>
      <li>Restart the development server</li>
      <li>Test the connection using the button above</li>
    </ol>
    
    <p class="note">
      <strong>Note:</strong> The IBF API at <code>https://ibf-test.510.global</code> may require authentication. 
      Contact the 510 team if you encounter permission errors.
    </p>
  </div>
</div>

<style>
  .api-debug-panel {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    font-family: 'Monaco', 'Consolas', monospace;
    font-size: 0.9rem;
  }
  
  .api-debug-panel h3 {
    margin: 0 0 1rem 0;
    color: #495057;
  }
  
  .api-debug-panel h4 {
    margin: 1rem 0 0.5rem 0;
    color: #6c757d;
    font-size: 1rem;
  }
  
  .status-grid, .status-results {
    display: grid;
    gap: 0.5rem;
    margin: 0.5rem 0;
  }
  
  .status-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.25rem 0;
  }
  
  .label {
    font-weight: 600;
    color: #495057;
  }
  
  .value {
    color: #6c757d;
  }
  
  .value.enabled {
    color: #28a745;
    font-weight: 600;
  }
  
  .value.mode {
    color: #007bff;
    font-weight: 600;
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    margin: 0.5rem 0;
    flex-wrap: wrap;
  }
  
  .test-btn {
    padding: 0.375rem 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
  }
  
  .test-btn:hover {
    background: #0056b3;
  }
  
  .test-btn:disabled {
    background: #6c757d;
    cursor: not-allowed;
  }
  
  .ibf-btn {
    background: #28a745;
  }
  
  .ibf-btn:hover {
    background: #1e7e34;
  }
  
  .test-results {
    background: white;
    border: 1px solid #dee2e6;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem 0;
  }
  
  .result-item {
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .success {
    color: #28a745;
  }
  
  .error {
    color: #dc3545;
  }
  
  .instructions {
    background: #e3f2fd;
    border-left: 4px solid #2196f3;
    padding: 1rem;
    margin: 1rem 0;
  }
  
  .instructions ol {
    margin: 0.5rem 0;
    padding-left: 1.5rem;
  }
  
  .instructions code {
    background: #ffffff;
    padding: 0.125rem 0.25rem;
    border-radius: 3px;
    font-size: 0.875rem;
  }
  
  .note {
    margin: 0.5rem 0 0 0;
    font-size: 0.875rem;
    color: #6c757d;
  }
</style>

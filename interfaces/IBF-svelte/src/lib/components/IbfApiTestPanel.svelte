<script lang="ts">
  import { ibfApiService } from '../services/ibfApi';
  import config from '../config';

  let testResults: any = {};
  let testing = false;
  let showResults = false;

  async function testIbfAuthentication() {
    testing = true;
    testResults = {};

    try {
      console.log('🧪 Starting IBF API authentication test...');
      console.log('📋 Open browser DevTools Console (F12) to see detailed request/response logs');

      // Test 1: Check configuration
      testResults.config = {
        status: config.useIbfApi ? 'enabled' : 'disabled',
        hasCredentials: !!(config.ibfApiEmail && config.ibfApiPassword),
        email: config.ibfApiEmail || 'Not set',
        password: config.ibfApiPassword ? '***hidden***' : 'Not set'
      };

      if (!config.useIbfApi) {
        testResults.message = 'IBF API is disabled. Enable it by setting VITE_USE_IBF_API=true';
        return;
      }

      if (!config.ibfApiEmail || !config.ibfApiPassword) {
        testResults.message = 'IBF API credentials not configured. Set VITE_IBF_API_EMAIL and VITE_IBF_API_PASSWORD';
        return;
      }

      // Test 2: Try authentication check endpoint (might be restricted)
      try {
        const authResult = await fetch('https://ibf-pivot.510.global/api/authentication', {
          headers: {
            'Authorization': `Bearer ${await ibfApiService.getIbfToken()}`,
            'Accept': 'application/json'
          }
        });
        const authData = await authResult.json();
        testResults.auth = {
          status: authResult.status === 200 ? 'success' : 'warning',
          data: authData,
          error: authResult.status !== 200 ? `Auth endpoint restricted (${authResult.status}) - this is normal for limited user accounts` : undefined
        };
      } catch (error) {
        testResults.auth = {
          status: 'warning',
          error: `Auth endpoint check failed - this is normal for limited user accounts`
        };
      }

      // Test 3: Try health check (might work without auth)
      try {
        const healthResult = await ibfApiService.healthCheck();
        testResults.health = {
          status: healthResult.status === 200 ? 'success' : 'error',
          data: healthResult.data,
          error: healthResult.error
        };
      } catch (error) {
        testResults.health = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Health check failed'
        };
      }

      // Test 4: Try to get countries (will trigger authentication)
      try {
        console.log('🔐 Testing authenticated endpoint...');
        const countriesResult = await ibfApiService.getCountries();
        testResults.countries = {
          status: countriesResult.status === 200 ? 'success' : 'error',
          count: countriesResult.data?.length || 0,
          data: countriesResult.data?.slice(0, 3), // Show first 3 countries
          error: countriesResult.error
        };
      } catch (error) {
        testResults.countries = {
          status: 'error',
          error: error instanceof Error ? error.message : 'Countries request failed'
        };
      }

      // Test 5: If countries worked, test disaster types and admin areas for first country
      if (testResults.countries?.status === 'success' && testResults.countries.data?.length > 0) {
        const firstCountry = testResults.countries.data[0];

        // Test disaster types
        try {
          const disasterResult = await ibfApiService.getDisasterTypes(firstCountry.countryCodeISO3);
          testResults.disasters = {
            status: disasterResult.status === 200 ? 'success' : 'error',
            country: firstCountry.countryCodeISO3,
            count: disasterResult.data?.length || 0,
            data: disasterResult.data,
            error: disasterResult.error
          };
        } catch (error) {
          testResults.disasters = {
            status: 'error',
            country: firstCountry.countryCodeISO3,
            error: error instanceof Error ? error.message : 'Disaster types request failed'
          };
        }

        // Test admin areas
        try {
          const adminResult = await ibfApiService.getAdminAreas(firstCountry.countryCodeISO3, 2);
          testResults.adminAreas = {
            status: adminResult.status === 200 ? 'success' :
                   (adminResult.status === 403 ? 'warning' : 'error'),
            country: firstCountry.countryCodeISO3,
            count: adminResult.data?.length || 0,
            error: adminResult.status === 403 ?
                  'Admin areas access restricted - this is normal for limited user accounts' :
                  adminResult.error
          };
        } catch (error) {
          testResults.adminAreas = {
            status: 'warning',
            country: firstCountry.countryCodeISO3,
            error: 'Admin areas access restricted - this is normal for limited user accounts'
          };
        }

        // Test events if we have disaster types
        if (testResults.disasters?.status === 'success' && testResults.disasters.data?.length > 0) {
          try {
            const firstDisaster = testResults.disasters.data[0];
            const eventsResult = await ibfApiService.getEvents(
              firstCountry.countryCodeISO3,
              firstDisaster.disasterType
            );
            testResults.events = {
              status: eventsResult.status === 200 ? 'success' : 'error',
              country: firstCountry.countryCodeISO3,
              disasterType: firstDisaster.disasterType,
              count: eventsResult.data?.length || 0,
              error: eventsResult.error
            };
          } catch (error) {
            testResults.events = {
              status: 'error',
              error: error instanceof Error ? error.message : 'Events request failed'
            };
          }
        }
      }

    } catch (error) {
      testResults.error = error instanceof Error ? error.message : 'Test failed';
    } finally {
      testing = false;
      showResults = true;
    }
  }

  function clearResults() {
    testResults = {};
    showResults = false;
  }
</script>

<div class="ibf-test-panel">
  <div class="panel-header">
    <h3>🌍 IBF API Authentication Test</h3>
    <div class="panel-actions">
      <button class="test-btn" on:click={testIbfAuthentication} disabled={testing}>
        {testing ? '🔄 Testing...' : '🧪 Test IBF API'}
      </button>
      {#if showResults}
        <button class="clear-btn" on:click={clearResults}>Clear</button>
      {/if}
    </div>
  </div>

  <!-- Info panel about token-based authentication -->
  <div class="info-panel">
    <div class="info-box">
      <h4>🔧 Token-Based Authentication</h4>
      <p>The IBF API uses <strong>bearer tokens</strong> returned from the login endpoint for authentication.</p>
      <ul>
        <li>• Login to /user/login returns an authentication token</li>
        <li>• Token is included in Authorization header as "Bearer &#123;token&#125;"</li>
        <li>• Check console for detailed token extraction and usage logs</li>
        <li>• Protected endpoints require valid bearer token</li>
      </ul>
    </div>
  </div>

  {#if showResults}
    <div class="test-results">

      <!-- Configuration Check -->
      <div class="result-section">
        <h4>⚙️ Configuration</h4>
        <div class="result-grid">
          <div class="result-item status-{testResults.config?.status}">
            <span class="label">IBF API:</span>
            <span class="value">{testResults.config?.status}</span>
          </div>
          <div class="result-item status-{testResults.config?.hasCredentials ? 'success' : 'error'}">
            <span class="label">Credentials:</span>
            <span class="value">{testResults.config?.hasCredentials ? 'configured' : 'missing'}</span>
          </div>
          <div class="result-item">
            <span class="label">Email:</span>
            <span class="value">{testResults.config?.email}</span>
          </div>
        </div>
      </div>

      {#if testResults.message}
        <div class="result-message">
          <div class="message-box warning">
            <strong>⚠️ Setup Required:</strong> {testResults.message}
          </div>
        </div>
      {:else if showResults}
        <div class="result-message">
          <div class="message-box {testResults.countries?.status === 'success' ? 'success' : 'info'}">
            <strong>🎯 Authentication Status:</strong>
            {#if testResults.countries?.status === 'success'}
              ✅ IBF API authentication successful! You have basic access to load countries and disaster data.
              {#if testResults.auth?.status === 'warning' || testResults.adminAreas?.status === 'warning'}
                Some advanced features may be restricted based on your user permissions.
              {/if}
            {:else}
              ❌ IBF API authentication failed. Check your credentials and try again.
            {/if}
          </div>
        </div>
      {/if}

      <!-- Authentication Check -->
      {#if testResults.auth}
        <div class="result-section">
          <h4>🔐 Authentication Check</h4>
          <div class="result-item status-{testResults.auth.status}">
            <span class="label">Status:</span>
            <span class="value">
              {testResults.auth.status === 'success' ? '✅ Authenticated' :
               testResults.auth.status === 'warning' ? '⚠️ Limited Access' : '❌ Failed'}
            </span>
          </div>
          {#if testResults.auth.error}
            <div class="error-detail">{testResults.auth.error}</div>
          {/if}
          {#if testResults.auth.data}
            <div class="data-preview">
              <pre>{JSON.stringify(testResults.auth.data, null, 2)}</pre>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Health Check -->
      {#if testResults.health}
        <div class="result-section">
          <h4>❤️ Health Check</h4>
          <div class="result-item status-{testResults.health.status}">
            <span class="label">Status:</span>
            <span class="value">
              {testResults.health.status === 'success' ? '✅ Connected' : '❌ Failed'}
            </span>
          </div>
          {#if testResults.health.error}
            <div class="error-detail">{testResults.health.error}</div>
          {/if}
          {#if testResults.health.data}
            <div class="data-preview">
              <pre>{JSON.stringify(testResults.health.data, null, 2)}</pre>
            </div>
          {/if}
        </div>
      {/if}

      <!-- Countries Test -->
      {#if testResults.countries}
        <div class="result-section">
          <h4>🌍 Countries (Authenticated)</h4>
          <div class="result-item status-{testResults.countries.status}">
            <span class="label">Status:</span>
            <span class="value">
              {testResults.countries.status === 'success' ?
                `✅ Success (${testResults.countries.count} countries)` :
                '❌ Failed'}
            </span>
          </div>
          {#if testResults.countries.error}
            <div class="error-detail">{testResults.countries.error}</div>
          {/if}
          {#if testResults.countries.data}
            <div class="countries-preview">
              {#each testResults.countries.data as country}
                <div class="country-item">
                  🏳️ {country.countryName} ({country.countryCodeISO3})
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Disaster Types Test -->
      {#if testResults.disasters}
        <div class="result-section">
          <h4>🌪️ Disaster Types ({testResults.disasters.country})</h4>
          <div class="result-item status-{testResults.disasters.status}">
            <span class="label">Status:</span>
            <span class="value">
              {testResults.disasters.status === 'success' ?
                `✅ Success (${testResults.disasters.count} disaster types)` :
                '❌ Failed'}
            </span>
          </div>
          {#if testResults.disasters.error}
            <div class="error-detail">{testResults.disasters.error}</div>
          {/if}
          {#if testResults.disasters.data}
            <div class="disasters-preview">
              {#each testResults.disasters.data as disaster}
                <div class="disaster-item">
                  🌪️ {disaster.disasterType} ({disaster.active ? 'active' : 'inactive'})
                </div>
              {/each}
            </div>
          {/if}
        </div>
      {/if}

      <!-- Admin Areas Test -->
      {#if testResults.adminAreas}
        <div class="result-section">
          <h4>🗺️ Admin Areas ({testResults.adminAreas.country})</h4>
          <div class="result-item status-{testResults.adminAreas.status}">
            <span class="label">Status:</span>
            <span class="value">
              {testResults.adminAreas.status === 'success' ?
                `✅ Success (${testResults.adminAreas.count} areas)` :
                testResults.adminAreas.status === 'warning' ?
                '⚠️ Access Restricted' :
                '❌ Failed'}
            </span>
          </div>
          {#if testResults.adminAreas.error}
            <div class="error-detail">{testResults.adminAreas.error}</div>
          {/if}
        </div>
      {/if}

      <!-- Events Test -->
      {#if testResults.events}
        <div class="result-section">
          <h4>🚨 Events Test</h4>
          <div class="result-item status-{testResults.events.status}">
            <span class="label">Country:</span>
            <span class="value">{testResults.events.country}</span>
          </div>
          {#if testResults.events.disasterType}
          <div class="result-item status-{testResults.events.status}">
            <span class="label">Disaster Type:</span>
            <span class="value">{testResults.events.disasterType}</span>
          </div>
          {/if}
          <div class="result-item status-{testResults.events.status}">
            <span class="label">Events:</span>
            <span class="value">
              {testResults.events.status === 'success' ?
                `${testResults.events.count} events found` :
                'Failed to load'}
            </span>
          </div>
          {#if testResults.events.error}
            <div class="error-detail">{testResults.events.error}</div>
          {/if}
        </div>
      {/if}

      <!-- General Error -->
      {#if testResults.error}
        <div class="result-section">
          <div class="message-box error">
            <strong>❌ Test Error:</strong> {testResults.error}
          </div>
        </div>
      {/if}

    </div>
  {/if}

  <!-- Instructions -->
  <div class="instructions">
    <h4>📋 Setup Instructions</h4>
    <ol>
      <li><strong>Get IBF API credentials</strong> from the 510.global team</li>
      <li><strong>Add to .env.local:</strong>
        <pre>VITE_IBF_API_EMAIL=your-email@example.com
VITE_IBF_API_PASSWORD=your-password
VITE_USE_IBF_API=true
VITE_USE_MOCK_DATA=false</pre>
      </li>
      <li><strong>Restart</strong> the development server</li>
      <li><strong>Test</strong> using the button above</li>
      <li><strong>Debug</strong>: Open DevTools Console (F12) to see detailed request/response logs</li>
    </ol>
  </div>
</div>

<style>
  .ibf-test-panel {
    margin: 20px 0;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    background: #f9fafb;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px;
    background: #f3f4f6;
    border-bottom: 1px solid #e5e7eb;
    border-radius: 8px 8px 0 0;
  }

  .panel-header h3 {
    margin: 0;
    font-size: 16px;
    color: #374151;
  }

  .info-panel {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
  }

  .info-box {
    background: #eff6ff;
    border: 1px solid #3b82f6;
    border-radius: 6px;
    padding: 12px;
  }

  .info-box h4 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: #1d4ed8;
  }

  .info-box p {
    margin: 0 0 8px 0;
    font-size: 13px;
    color: #1e40af;
  }

  .info-box ul {
    margin: 0;
    padding-left: 16px;
    font-size: 12px;
    color: #1e40af;
  }

  .info-box li {
    margin: 4px 0;
  }

  .panel-actions {
    display: flex;
    gap: 8px;
  }

  .test-btn {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
  }

  .test-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .test-btn:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .clear-btn {
    background: #6b7280;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
  }

  .clear-btn:hover {
    background: #4b5563;
  }

  .test-results {
    padding: 16px;
  }

  .result-section {
    margin-bottom: 20px;
    padding: 12px;
    background: white;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
  }

  .result-section h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #374151;
  }

  .result-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 8px;
  }

  .result-item {
    display: flex;
    justify-content: space-between;
    padding: 8px 12px;
    background: #f9fafb;
    border-radius: 4px;
    border: 1px solid #e5e7eb;
    font-size: 12px;
  }

  .result-item.status-success {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  .result-item.status-warning {
    background: #fef3c7;
    border-color: #f59e0b;
  }

  .result-item.status-error {
    background: #fef2f2;
    border-color: #ef4444;
  }

  .result-item.status-enabled {
    background: #f0fdf4;
    border-color: #22c55e;
  }

  .result-item.status-disabled {
    background: #fef3c7;
    border-color: #f59e0b;
  }

  .label {
    color: #6b7280;
    font-weight: 500;
  }

  .value {
    font-weight: 600;
    color: #374151;
  }

  .error-detail {
    margin-top: 8px;
    padding: 8px;
    background: #fef2f2;
    border: 1px solid #fca5a5;
    border-radius: 4px;
    font-size: 11px;
    color: #dc2626;
    font-family: monospace;
  }

  .data-preview {
    margin-top: 8px;
    padding: 8px;
    background: #f3f4f6;
    border-radius: 4px;
    font-size: 10px;
    max-height: 150px;
    overflow-y: auto;
  }

  .data-preview pre {
    margin: 0;
    color: #374151;
  }

  .countries-preview,
  .disasters-preview {
    margin-top: 8px;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .country-item {
    padding: 4px 8px;
    background: #e0f2fe;
    border-radius: 4px;
    font-size: 11px;
    color: #0c4a6e;
  }

  .disaster-item {
    padding: 4px 8px;
    background: #fef3c7;
    border-radius: 4px;
    font-size: 11px;
    color: #92400e;
  }

  .message-box {
    padding: 12px;
    border-radius: 4px;
    font-size: 12px;
  }

  .message-box.success {
    background: #f0fdf4;
    border: 1px solid #22c55e;
    color: #15803d;
  }

  .message-box.info {
    background: #eff6ff;
    border: 1px solid #3b82f6;
    color: #1d4ed8;
  }

  .message-box.warning {
    background: #fef3c7;
    border: 1px solid #f59e0b;
    color: #92400e;
  }

  .message-box.error {
    background: #fef2f2;
    border: 1px solid #ef4444;
    color: #dc2626;
  }

  .instructions {
    padding: 16px;
    border-top: 1px solid #e5e7eb;
    background: #f8fafc;
  }

  .instructions h4 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #374151;
  }

  .instructions ol {
    margin: 0;
    padding-left: 20px;
    font-size: 12px;
    line-height: 1.5;
    color: #4b5563;
  }

  .instructions li {
    margin: 8px 0;
  }

  .instructions pre {
    margin: 8px 0;
    padding: 8px;
    background: #374151;
    color: #f9fafb;
    border-radius: 4px;
    font-size: 10px;
    overflow-x: auto;
  }
</style>

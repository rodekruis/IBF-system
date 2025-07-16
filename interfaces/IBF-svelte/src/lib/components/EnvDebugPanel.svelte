<script lang="ts">
  import config from '../config';
  
  // Debug the actual config values
  console.log('🔧 Current Configuration:', {
    useIbfApi: config.useIbfApi,
    useMockData: config.useMockData,
    ibfApiEmail: config.ibfApiEmail,
    ibfApiPassword: config.ibfApiPassword ? '***set***' : 'not set',
    raw_env: {
      VITE_USE_IBF_API: import.meta.env.VITE_USE_IBF_API,
      VITE_USE_MOCK_DATA: import.meta.env.VITE_USE_MOCK_DATA,
      VITE_IBF_API_EMAIL: import.meta.env.VITE_IBF_API_EMAIL,
      VITE_IBF_API_PASSWORD: import.meta.env.VITE_IBF_API_PASSWORD ? '***set***' : 'not set'
    }
  });
</script>

<div class="env-debug">
  <h4>🔧 Environment Debug</h4>
  <div class="env-grid">
    <div class="env-item">
      <span class="label">USE_IBF_API:</span>
      <span class="value {config.useIbfApi ? 'success' : 'error'}">
        {config.useIbfApi} (raw: {import.meta.env.VITE_USE_IBF_API})
      </span>
    </div>
    <div class="env-item">
      <span class="label">USE_MOCK_DATA:</span>
      <span class="value {!config.useMockData ? 'success' : 'warning'}">
        {config.useMockData} (raw: {import.meta.env.VITE_USE_MOCK_DATA})
      </span>
    </div>
    <div class="env-item">
      <span class="label">IBF_API_EMAIL:</span>
      <span class="value {config.ibfApiEmail ? 'success' : 'error'}">
        {config.ibfApiEmail || 'not set'} (raw: {import.meta.env.VITE_IBF_API_EMAIL || 'not set'})
      </span>
    </div>
    <div class="env-item">
      <span class="label">IBF_API_PASSWORD:</span>
      <span class="value {config.ibfApiPassword ? 'success' : 'error'}">
        {config.ibfApiPassword ? '***set***' : 'not set'} (raw: {import.meta.env.VITE_IBF_API_PASSWORD ? '***set***' : 'not set'})
      </span>
    </div>
  </div>
</div>

<style>
  .env-debug {
    margin: 10px 0;
    padding: 12px;
    background: #f8f9fa;
    border: 1px solid #dee2e6;
    border-radius: 6px;
    font-size: 12px;
  }
  
  .env-debug h4 {
    margin: 0 0 8px 0;
    color: #495057;
  }
  
  .env-grid {
    display: grid;
    gap: 4px;
  }
  
  .env-item {
    display: flex;
    justify-content: space-between;
    padding: 4px 8px;
    background: white;
    border-radius: 3px;
  }
  
  .label {
    color: #6c757d;
    font-weight: 500;
  }
  
  .value {
    font-family: monospace;
    font-weight: 600;
  }
  
  .value.success {
    color: #28a745;
  }
  
  .value.warning {
    color: #ffc107;
  }
  
  .value.error {
    color: #dc3545;
  }
</style>

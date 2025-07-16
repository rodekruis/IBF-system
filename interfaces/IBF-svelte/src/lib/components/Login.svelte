<script lang="ts">
  import { auth } from '../stores/auth';

  function handleLogin() {
    auth.login();
  }
</script>

<div class="login-container">
  <div class="login-card">
    <div class="login-header">
      <h1>IBF Dashboard</h1>
      <p>Impact-Based Forecasting System</p>
    </div>
    
    <div class="login-content">
      <p>Please sign in to access the dashboard</p>
      
      <button 
        class="login-button"
        on:click={handleLogin}
      >
        <svg class="microsoft-icon" viewBox="0 0 24 24" fill="currentColor">
          <path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z"/>
        </svg>
        Sign in with Microsoft
      </button>
    </div>
    
    <div class="login-footer">
      <p>Secure authentication via Azure Active Directory</p>
    </div>
  </div>
</div>

<style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 1rem;
  }

  .login-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
    padding: 2rem;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .login-header h1 {
    color: #333;
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
    font-weight: 600;
  }

  .login-header p {
    color: #666;
    margin: 0 0 2rem 0;
    font-size: 1rem;
  }

  .login-content p {
    color: #555;
    margin-bottom: 1.5rem;
    font-size: 1rem;
  }

  .login-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.875rem 1.5rem;
    background: #0078d4;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .login-button:hover {
    background: #106ebe;
  }

  .microsoft-icon {
    width: 20px;
    height: 20px;
  }

  .login-footer {
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #eee;
  }

  .login-footer p {
    color: #888;
    font-size: 0.875rem;
    margin: 0;
  }
</style>

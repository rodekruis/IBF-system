<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { authService, isLoggingIn, authError } from '../services/auth';
  
  const dispatch = createEventDispatcher();
  
  let email = '';
  let password = '';
  let showPassword = false;
  
  async function handleLogin() {
    if (!email || !password) {
      return;
    }
    
    const success = await authService.loginWithIBF(email, password);
    
    if (success) {
      dispatch('login-success');
    }
  }
  
  function handleClose() {
    dispatch('close');
  }
  
  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }
  
  // Handle Enter key
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }
</script>

<!-- Login Popup Overlay -->
<div class="login-overlay" on:click={handleClose} on:keydown={(e) => e.key === 'Escape' && handleClose()} role="dialog" tabindex="-1">
  <div class="login-popup" on:click={(e) => e.stopPropagation()} role="dialog">
    <!-- Header -->
    <div class="popup-header">
      <h2>Sign in to IBF Dashboard</h2>
      <button class="close-btn" on:click={handleClose} aria-label="Close">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
    
    <!-- Error Message -->
    {#if $authError}
      <div class="error-message">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        {$authError}
      </div>
    {/if}
    
    <!-- Login Form -->
    <form on:submit|preventDefault={handleLogin} class="login-form">
      <div class="form-group">
        <label for="email">Email Address</label>
        <input
          id="email"
          type="email"
          bind:value={email}
          placeholder="Enter your IBF account email"
          required
          disabled={$isLoggingIn}
          on:keydown={handleKeydown}
        />
      </div>
      
      <div class="form-group">
        <label for="password">Password</label>
        <div class="password-input">
          {#if showPassword}
            <input
              id="password"
              type="text"
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={$isLoggingIn}
              on:keydown={handleKeydown}
            />
          {:else}
            <input
              id="password"
              type="password"
              bind:value={password}
              placeholder="Enter your password"
              required
              disabled={$isLoggingIn}
              on:keydown={handleKeydown}
            />
          {/if}
          <button
            type="button"
            class="password-toggle"
            on:click={togglePasswordVisibility}
            disabled={$isLoggingIn}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {#if showPassword}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                <line x1="1" y1="1" x2="23" y2="23"></line>
              </svg>
            {:else}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            {/if}
          </button>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" on:click={handleClose} disabled={$isLoggingIn}>
          Cancel
        </button>
        <button type="submit" class="btn btn-primary" disabled={$isLoggingIn || !email || !password}>
          {#if $isLoggingIn}
            <svg class="spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12a9 9 0 11-6.219-8.56"/>
            </svg>
            Signing in...
          {:else}
            Sign In
          {/if}
        </button>
      </div>
    </form>
    
    <!-- Footer -->
    <div class="popup-footer">
      <p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <circle cx="12" cy="16" r="1"></circle>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        Secure authentication via IBF API
      </p>
    </div>
  </div>
</div>

<style>
  .login-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .login-popup {
    background: white;
    border-radius: 12px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    width: 100%;
    max-width: 400px;
    max-height: 90vh;
    overflow-y: auto;
    animation: slideIn 0.2s ease-out;
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-20px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  .popup-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.5rem 1.5rem 1rem 1.5rem;
    border-bottom: 1px solid #e2e8f0;
  }

  .popup-header h2 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
    color: #1e293b;
  }

  .close-btn {
    background: none;
    border: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #64748b;
    border-radius: 6px;
    transition: all 0.2s;
  }

  .close-btn:hover {
    background: #f1f5f9;
    color: #1e293b;
  }

  .error-message {
    margin: 1rem 1.5rem 0 1.5rem;
    padding: 0.75rem;
    background: #fef2f2;
    border: 1px solid #fecaca;
    border-radius: 8px;
    color: #dc2626;
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .login-form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }

  .form-group input {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 1rem;
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .form-group input:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .form-group input:disabled {
    background: #f9fafb;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .password-input {
    position: relative;
  }

  .password-toggle {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 0.25rem;
    border-radius: 4px;
    transition: color 0.2s;
  }

  .password-toggle:hover:not(:disabled) {
    color: #374151;
  }

  .password-toggle:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }

  .form-actions {
    display: flex;
    gap: 0.75rem;
    margin-top: 1.5rem;
  }

  .btn {
    flex: 1;
    padding: 0.75rem 1rem;
    border: none;
    border-radius: 8px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  .btn-secondary {
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
  }

  .btn-secondary:hover:not(:disabled) {
    background: #f1f5f9;
  }

  .btn-primary {
    background: #3b82f6;
    color: white;
  }

  .btn-primary:hover:not(:disabled) {
    background: #2563eb;
  }

  .spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  .popup-footer {
    padding: 1rem 1.5rem 1.5rem 1.5rem;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    border-radius: 0 0 12px 12px;
  }

  .popup-footer p {
    margin: 0;
    font-size: 0.75rem;
    color: #64748b;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  /* Mobile responsiveness */
  @media (max-width: 480px) {
    .login-overlay {
      padding: 0.5rem;
    }

    .popup-header {
      padding: 1rem 1rem 0.75rem 1rem;
    }

    .popup-header h2 {
      font-size: 1.125rem;
    }

    .login-form {
      padding: 1rem;
    }

    .popup-footer {
      padding: 0.75rem 1rem 1rem 1rem;
    }
  }
</style>

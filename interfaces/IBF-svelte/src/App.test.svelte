<script lang="ts">
  import { onMount } from 'svelte';
  
  let message = 'IBF Dashboard - Test';
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
    
    <div class="content">
      <p>Basic test - if you see this, Svelte is working!</p>
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
  
  .content {
    padding: 2rem;
    text-align: center;
    font-size: 1.2rem;
  }
</style>

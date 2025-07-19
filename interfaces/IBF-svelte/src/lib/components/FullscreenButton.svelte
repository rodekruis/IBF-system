<!-- FullscreenButton.svelte -->
<script>
  import { onMount, onDestroy } from 'svelte';

  export let showButton = true;
  
  let isFullscreen = false;
  let isInIframe = false;

  onMount(() => {
    // Check if we're running in an iframe
    isInIframe = window.self !== window.top;
    
    // Listen for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
  });

  onDestroy(() => {
    document.removeEventListener('fullscreenchange', handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
  });

  function handleFullscreenChange() {
    isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );
  }

  function toggleFullscreen() {
    if (isInIframe) {
      // If we're in an iframe, try to make the iframe fullscreen
      // This works if the parent allows it via iframe permissions
      try {
        if (!isFullscreen) {
          const iframe = window.frameElement;
          if (iframe) {
            if (iframe.requestFullscreen) {
              iframe.requestFullscreen();
            } else if (iframe.webkitRequestFullscreen) {
              iframe.webkitRequestFullscreen();
            } else if (iframe.mozRequestFullScreen) {
              iframe.mozRequestFullScreen();
            } else if (iframe.msRequestFullscreen) {
              iframe.msRequestFullscreen();
            }
          } else {
            // Fallback: try to make the document fullscreen
            requestDocumentFullscreen();
          }
        } else {
          exitFullscreen();
        }
      } catch (error) {
        console.warn('Fullscreen request failed:', error);
        // Fallback to document fullscreen
        requestDocumentFullscreen();
      }
    } else {
      // Not in iframe, make document fullscreen
      if (!isFullscreen) {
        requestDocumentFullscreen();
      } else {
        exitFullscreen();
      }
    }
  }

  function requestDocumentFullscreen() {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  function exitFullscreen() {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
  }
</script>

{#if showButton && !isInIframe}
  <button
    class="fullscreen-btn"
    class:fullscreen-active={isFullscreen}
    on:click={toggleFullscreen}
    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
  >
    {#if isFullscreen}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
      </svg>
    {:else}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
      </svg>
    {/if}
  </button>
{/if}

<style>
  .fullscreen-btn {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
    background: rgba(0, 33, 77, 0.9); /* IBF navy-900 with transparency */
    color: white;
    border: none;
    border-radius: 8px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
  }

  .fullscreen-btn:hover {
    background: rgba(0, 33, 77, 1);
    transform: scale(1.05);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }

  .fullscreen-btn:active {
    transform: scale(0.95);
  }

  .fullscreen-btn svg {
    transition: transform 0.2s ease;
  }

  .fullscreen-active {
    background: rgba(220, 38, 127, 0.9); /* Different color when active */
  }

  .fullscreen-active:hover {
    background: rgba(220, 38, 127, 1);
  }

  /* Ensure button is visible on all screen sizes */
  @media (max-width: 768px) {
    .fullscreen-btn {
      top: 15px;
      right: 15px;
      padding: 10px;
    }
  }

  @media (max-width: 480px) {
    .fullscreen-btn {
      top: 10px;
      right: 10px;
      padding: 8px;
    }
    
    .fullscreen-btn svg {
      width: 16px;
      height: 16px;
    }
  }
</style>

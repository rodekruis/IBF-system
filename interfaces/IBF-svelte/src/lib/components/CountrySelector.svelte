<script lang="ts">
  import { selectedCountry, countries } from '../stores/app';
  
  export let compact = false;
  export let placeholder = 'Select a country';
  
  let isOpen = false;
  let searchTerm = '';
  
  $: filteredCountries = $countries.filter(country => 
    country.countryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.countryCodeISO3.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  function selectCountry(country: any) {
    selectedCountry.set(country);
    isOpen = false;
    searchTerm = '';
  }
  
  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      // Focus search input after dropdown opens
      setTimeout(() => {
        const input = document.querySelector('.country-search') as HTMLInputElement;
        input?.focus();
      }, 10);
    }
  }
</script>

<div class="country-selector" class:compact>
  <button 
    class="selector-button"
    on:click={toggleDropdown}
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <div class="selected-content">
      {#if $selectedCountry}
        <div class="country-flag">
          <!-- Country flag placeholder or emoji -->
          🌍
        </div>
        <span class="country-name">{$selectedCountry.countryName}</span>
      {:else}
        <span class="placeholder">{placeholder}</span>
      {/if}
    </div>
    <div class="chevron" class:rotated={isOpen}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M4.427 9.573L8 6l3.573 3.573a.5.5 0 0 0 .707-.707L8.354 4.939a.5.5 0 0 0-.707 0L3.72 8.866a.5.5 0 1 0 .707.707z"/>
      </svg>
    </div>
  </button>
  
  {#if isOpen}
    <div class="dropdown">
      <div class="search-container">
        <input
          type="text"
          class="country-search"
          placeholder="Search countries..."
          bind:value={searchTerm}
          on:keydown={(e) => e.key === 'Escape' && (isOpen = false)}
        />
      </div>
      
      <ul class="countries-list" role="listbox">
        {#each filteredCountries as country (country.countryCodeISO3)}
          <li role="option" aria-selected={$selectedCountry?.countryCodeISO3 === country.countryCodeISO3}>
            <button
              class="country-option"
              class:selected={$selectedCountry?.countryCodeISO3 === country.countryCodeISO3}
              on:click={() => selectCountry(country)}
            >
              <div class="country-flag">🌍</div>
              <div class="country-info">
                <div class="country-name">{country.countryName}</div>
                <div class="country-code">{country.countryCodeISO3}</div>
              </div>
            </button>
          </li>
        {:else}
          <li class="no-results">
            <div>No countries found</div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<!-- Close dropdown when clicking outside -->
<svelte:window on:click={(e) => {
  if (!e.target.closest('.country-selector')) {
    isOpen = false;
  }
}} />

<style>
  .country-selector {
    position: relative;
    width: 100%;
    max-width: 300px;
  }
  
  .country-selector.compact {
    max-width: 200px;
  }
  
  .selector-button {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 0.875rem;
  }
  
  .selector-button:hover {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  
  .selector-button:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
  
  .selected-content {
    display: flex;
    align-items: center;
    gap: 8px;
    flex: 1;
    text-align: left;
  }
  
  .country-flag {
    font-size: 1.2em;
    display: flex;
    align-items: center;
  }
  
  .country-name {
    color: #374151;
    font-weight: 500;
  }
  
  .placeholder {
    color: #9ca3af;
  }
  
  .chevron {
    transition: transform 0.2s ease;
    color: #6b7280;
  }
  
  .chevron.rotated {
    transform: rotate(180deg);
  }
  
  .dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    margin-top: 4px;
    max-height: 300px;
    overflow: hidden;
  }
  
  .search-container {
    padding: 8px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  .country-search {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #d1d5db;
    border-radius: 4px;
    font-size: 0.875rem;
    outline: none;
  }
  
  .country-search:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 1px #3b82f6;
  }
  
  .countries-list {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 240px;
    overflow-y: auto;
  }
  
  .country-option {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border: none;
    background: none;
    cursor: pointer;
    text-align: left;
    transition: background-color 0.15s ease;
  }
  
  .country-option:hover {
    background-color: #f3f4f6;
  }
  
  .country-option.selected {
    background-color: #eff6ff;
    color: #1d4ed8;
  }
  
  .country-info {
    flex: 1;
  }
  
  .country-name {
    font-weight: 500;
    margin-bottom: 2px;
  }
  
  .country-code {
    font-size: 0.75rem;
    color: #6b7280;
    text-transform: uppercase;
  }
  
  .no-results {
    padding: 16px 12px;
    text-align: center;
    color: #6b7280;
    font-size: 0.875rem;
  }
  
  /* Compact mode adjustments */
  .compact .selector-button {
    padding: 6px 8px;
    font-size: 0.8rem;
  }
  
  .compact .country-flag {
    font-size: 1em;
  }
  
  .compact .dropdown {
    max-height: 250px;
  }
  
  /* Mobile responsive */
  @media (max-width: 768px) {
    .country-selector {
      max-width: 100%;
    }
    
    .dropdown {
      max-height: 250px;
    }
  }
</style>

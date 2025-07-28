import 'zone.js';

// Polyfills for web components
if (!window.customElements) {
  import('@webcomponents/custom-elements').catch(() => {
    console.warn('Custom Elements polyfill not available');
  });
}

// Additional polyfills for older browsers
if (!window.HTMLElement.prototype.attachShadow) {
  import('@webcomponents/shadydom').catch(() => {
    console.warn('ShadyDOM polyfill not available');
  });
}

// Polyfill for IntersectionObserver (needed by Ionic virtual scrolling)
if (!window.IntersectionObserver) {
  import('intersection-observer').catch(() => {
    console.warn('IntersectionObserver polyfill not available');
  });
}

// Ensure console methods exist
if (!window.console) {
  window.console = {
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
  } as any;
}

console.log('📦 IBF Dashboard web component polyfills loaded');

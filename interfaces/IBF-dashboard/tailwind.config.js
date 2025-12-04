import aspectRatio from '@tailwindcss/aspect-ratio';
import forms from '@tailwindcss/forms';

export default {
  content: ['./src/**/*.{html,ts}'],
  theme: {
    extend: {
      colors: {
        'ibf-primary': 'var(--ion-color-ibf-primary)',
        'ibf-secondary': 'var(--ion-color-ibf-secondary)',
        'ibf-tertiary': 'var(--ion-color-ibf-tertiary)',
        'ibf-white': 'var(--ion-color-ibf-white)',
        'ibf-black': 'var(--ion-color-ibf-black)',
        'ibf-grey': 'var(--ion-color-ibf-grey)',
        'ibf-no-alert-primary': 'var(--ion-color-ibf-no-alert-primary)',
        'ibf-glofas-trigger': 'var(--ion-color-ibf-glofas-trigger)',
        'fiveten-neutral-0': 'var(--ion-color-fiveten-neutral-0)',
        'fiveten-navy-900': 'var(--ion-color-fiveten-navy-900)',
        'fiveten-yellow-500': 'var(--ion-color-fiveten-yellow-500)',
        'fiveten-yellow-700': 'var(--ion-color-fiveten-yellow-700)',
        'fiveten-orange-500': 'var(--ion-color-fiveten-orange-500)',
        'fiveten-red-500': 'var(--ion-color-fiveten-red-500)',
      },
    },
  },
  plugins: [aspectRatio, forms],
  safelist: [
    { pattern: /(bg|text)-fiveten-neutral-0/ },
    { pattern: /(bg|text)-fiveten-navy-900/ },
    { pattern: /(bg|text)-fiveten-yellow-(500|700)/ },
    { pattern: /(bg|text)-fiveten-orange-500/ },
    { pattern: /(bg|text)-fiveten-red-500/ },
    { pattern: /(bg|text)-ibf-glofas-trigger/ },
    { pattern: /(bg|text)-ibf-no-alert-primary/ },
  ],
};

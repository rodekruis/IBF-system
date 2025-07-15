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
        'ibf-gray': 'var(--ion-color-ibf-gray)',
        'ibf-no-alert-primary': 'var(--ion-color-ibf-no-alert-primary)',
        'ibf-glofas-trigger': 'var(--ion-color-ibf-glofas-trigger)',
        'fiveten-yellow-500': 'var(--ion-color-fiveten-yellow-500)',
        'fiveten-orange-500': 'var(--ion-color-fiveten-orange-500)',
        'fiveten-orange-700': 'var(--ion-color-fiveten-orange-700)',
      },
    },
  },
  plugins: [aspectRatio, forms],
  safelist: [
    { pattern: /(bg|text)-fiveten-(yellow|orange)-(500|700)/ },
    { pattern: /(bg|text)-ibf-glofas-trigger/ },
  ],
};

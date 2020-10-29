// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // APIs
  api_url: 'http://localhost:3000/api/',

  // Feature-flags:
  useServiceWorker: false,

  // Geoserver
  geoserver_url:
    'http://ibf-system.westeurope.cloudapp.azure.com/geoserver/ibf-system/wms',
};

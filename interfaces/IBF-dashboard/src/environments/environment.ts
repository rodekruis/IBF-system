// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,

  // API
  api_url: 'http://ibf-system-test.westeurope.cloudapp.azure.com/api/',

  // feature-flags
  useServiceWorker: false,

  // geoserver
  geoserver_url:
    'http://ibf-system-test.westeurope.cloudapp.azure.com/geoserver/ibf-system/wms',

  // version
  ibf_system_version: 'v0.0.0',
};

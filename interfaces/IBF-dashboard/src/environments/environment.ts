// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  configuration: 'development',
  apiUrl: 'http://localhost:3000/api', // API
  useServiceWorker: false, // feature-flags
  geoserverUrl: 'http://localhost:8081/geoserver/ibf-system/wms', // geoserver
  ibfSystemVersion: 'v0.0.0', // version
  ibfVideoGuideUrl: 'https://www.youtube-nocookie.com/embed/O3VlrH_pCeo', // video guide url
  applicationInsightsInstrumentationKey: '', // application insights instrumentation key
  applicationInsightsUrl: '', // application insights url
  supportEmailAddress: 'ibf-support@510.global',
};

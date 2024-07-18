// This file can be replaced during build by using the `fileReplacements` array.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  configuration: 'development',
  apiUrl: `http://localhost:4000/api`, // API
  useServiceWorker: false, // feature-flags
  geoserverUrl: 'http://localhost:8081/geoserver/ibf-system/wms', // geoserver
  ibfSystemVersion: 'v0.0.0', // version
  ibfVideoGuideUrl: 'https://bit.ly/IBF-video-Zambia', // video guide url
  ibfPdfGuideUrl:
    'https://510ibfsystem.blob.core.windows.net/manuals/IBF%20Manual-Zambia-Published.pdf', // video guide url
  applicationInsightsInstrumentationKey: '', // application insights instrumentation key
  applicationInsightsUrl: '', // application insights url
  supportEmailAddress: 'ibf-support@510.global',
  whatsNewUrl:
    'https://github.com/rodekruis/IBF-system/blob/master/WHAT_IS_NEW_IN_IBF.md',
};

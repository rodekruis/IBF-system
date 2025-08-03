// This file can be replaced during build by using the `fileReplacements` array.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  configuration: 'development',
  apiUrl: 'https://ibf-test.510.global/api', // API
  apiToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxOTE2YmJjNS1iOWUyLTRhM2YtYWEyZC04MWQ1NGI1YzNmMDciLCJlbWFpbCI6Im12YW5kZXJ2ZWVuQHJlZGNyb3NzLm5sIiwiZmlyc3ROYW1lIjoiRXNwb0NSTSIsIm1pZGRsZU5hbWUiOm51bGwsImxhc3ROYW1lIjoiQWRtaW4iLCJ1c2VyUm9sZSI6InZpZXdlciIsImNvdW50cmllcyI6WyJVR0EiLCJaTUIiLCJNV0kiLCJTU0QiLCJLRU4iLCJFVEgiLCJQSEwiLCJaV0UiLCJMU08iXSwiZGlzYXN0ZXJUeXBlcyI6WyJkcm91Z2h0IiwiZmxhc2gtZmxvb2RzIiwiZmxvb2RzIiwibWFsYXJpYSIsInR5cGhvb24iXSwiZXhwIjoxNzU4NjQ3MDk1LjEwNiwiaWF0IjoxNzUzNDYzMDk1fQ.RDGFYZlEsIhmcHMblG8e6SFfyE1nzpFkMnk46XFS8no', // Add your API authentication token here
  useServiceWorker: false, // feature-flags
  geoserverUrl: 'https://ibf.510.global/geoserver/ibf-system/wms', // geoserver
  ibfSystemVersion: 'v0.321.106', // version
  ibfVideoGuideUrl: 'https://bit.ly/IBF-video-Zambia', // video guide url
  ibfPdfGuideUrl:
    'https://510ibfsystem.blob.core.windows.net/manuals/IBF%20Manual-Zambia-Published.pdf', // video guide url
  applicationInsightsInstrumentationKey: '', // application insights instrumentation key
  applicationInsightsUrl: '', // application insights url
  supportEmailAddress: 'ibf-support@510.global',
  whatsNewUrl:
    'https://github.com/rodekruis/IBF-system/blob/master/WHAT_IS_NEW_IN_IBF.md',
  assetBasePath: '/client/custom/modules/ibf-dashboard', // Base path for assets in embedded mode
};

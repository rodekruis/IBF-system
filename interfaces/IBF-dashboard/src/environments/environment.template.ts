export const environment = {
  configuration: process.env['NG_CONFIGURATION'],
  apiUrl: process.env['API_SERVICE_URL'], // API
  apiToken: process.env['API_TOKEN'], // API authentication token
  useServiceWorker: process.env['NG_USE_SERVICE_WORKER'], // feature-flags
  geoserverUrl: process.env['NG_GEOSERVER_URL'], // geoserver
  ibfSystemVersion: process.env['NG_IBF_SYSTEM_VERSION'], // version
  ibfVideoGuideUrl: process.env['NG_IBF_VIDEO_GUIDE_URL'], // video guide url
  ibfPdfGuideUrl: process.env['NG_IBF_PDF_GUIDE_URL'], // video guide url
  applicationInsightsInstrumentationKey:
    process.env['NG_APPLICATION_INSIGHTS_INSTRUMENTATION_KEY'], // application insights instrumentation key
  applicationInsightsUrl: process.env['NG_APPLICATION_INSIGHTS_URL'], // application insights url endpoint
  supportEmailAddress: process.env['SUPPORT_EMAIL_ADDRESS'], // email address for support
  whatsNewUrl: process.env['WHATS_NEW_URL'], // WHAT_IS_NEW_IN_IBF.md url
};

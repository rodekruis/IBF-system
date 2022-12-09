export const DEBUG = ['production', 'test'].indexOf(process.env.NODE_ENV) < 0;
export const PORT = 3000;
export const SCHEME = DEBUG ? 'http' : 'https';

// Configure Internal and External API URL's
// ---------------------------------------------------------------------------

export const API_PATHS = {
  whatsAppStatus: 'notifications/whatsapp/status',
  whatsAppIncoming: 'notifications/whatsapp/incoming',
  eventMapImage: 'event/event-map-image',
};
const baseApiUrl = process.env.EXTERNAL_API_SERVICE_URL + 'api/';
const rootUrl =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${PORT}/`
    : process.env.EXTERNAL_API_SERVICE_URL;
export const EXTERNAL_API = {
  root: rootUrl,
  rootApi: `${rootUrl}/api`,
  whatsAppStatus: baseApiUrl + API_PATHS.whatsAppStatus,
  whatsAppIncoming: baseApiUrl + API_PATHS.whatsAppIncoming,
  eventMapImage: baseApiUrl + API_PATHS.eventMapImage,
};

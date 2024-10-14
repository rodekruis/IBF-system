export const DEBUG = ['production', 'test'].indexOf(process.env.NODE_ENV) < 0;
export const PORT = 3000;

// Configure Internal and External API URL's
// ---------------------------------------------------------------------------

export const API_PATHS = {
  whatsAppStatus: 'notification/whatsapp/status',
  whatsAppIncoming: 'notification/whatsapp/incoming',
};
const baseApiUrl = process.env.EXTERNAL_API_SERVICE_URL + 'api/';
const rootUrl =
  process.env.NODE_ENV === 'development'
    ? `http://localhost:${process.env.LOCAL_PORT_IBF_SERVICE}/`
    : process.env.EXTERNAL_API_SERVICE_URL;
export const INTERNAL_GEOSERVER_API_URL =
  'http://ibf-geoserver:8080/geoserver/rest';
export const EXTERNAL_API = {
  root: rootUrl,
  whatsAppStatus: baseApiUrl + API_PATHS.whatsAppStatus,
  whatsAppIncoming: baseApiUrl + API_PATHS.whatsAppIncoming,
};

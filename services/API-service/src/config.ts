export const ENV = process.env.NODE_ENV || 'development';

export const DEV = ENV === 'development';
export const CI = ENV === 'ci';
export const TEST = ENV === 'test';
export const DEMO = ENV === 'staging';
export const PROD = ENV === 'production';

export const PORT = 3000;
export const DUNANT_EMAIL = 'dunant@redcross.nl';
export const PLACEHOLDER_SECRET = 'fill_in_secret';
export const forbidUnknownValues = false; // FIX: set to true after fixing type errors https://stackoverflow.com/a/75127940/1753041

// Configure Internal and External API URL's
// ---------------------------------------------------------------------------

export const API_PATHS = {
  whatsAppStatus: 'notification/whatsapp/status',
  whatsAppIncoming: 'notification/whatsapp/incoming',
};
const baseApiUrl = process.env.EXTERNAL_API_SERVICE_URL + 'api/';
const rootUrl = DEV
  ? `http://localhost:${process.env.LOCAL_PORT_IBF_SERVICE}/`
  : process.env.EXTERNAL_API_SERVICE_URL;
export const INTERNAL_GEOSERVER_API_URL =
  'http://ibf-geoserver:8080/geoserver/rest';
export const EXTERNAL_API = {
  root: rootUrl,
  whatsAppStatus: baseApiUrl + API_PATHS.whatsAppStatus,
  whatsAppIncoming: baseApiUrl + API_PATHS.whatsAppIncoming,
};

// Set this to true to temporarily test with old pipeline upload. Remove after all pipelines migrated.
export const MOCK_USE_OLD_PIPELINE_UPLOAD = false;

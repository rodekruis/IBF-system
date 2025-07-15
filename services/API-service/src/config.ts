export const ENV = process.env.NODE_ENV || 'development';

export const DEV = ENV === 'development';
export const CI = ENV === 'ci';
export const TEST = ENV === 'test';
export const DEMO = ENV === 'staging';
export const PROD = ENV === 'production';

export const DEFAULT_PORT = 3000;
export const DUNANT_EMAIL = 'dunant@redcross.nl';
export const forbidUnknownValues = false; // FIX: set to true after fixing type errors https://stackoverflow.com/a/75127940/1753041

// Configure Internal and External API URL's
// ---------------------------------------------------------------------------

export const API_SERVICE_URL = process.env.API_SERVICE_URL;

export const WHATSAPP_STATUS_API_PATH = 'notification/whatsapp/status';
export const WHATSAPP_INCOMING_API_PATH = 'notification/whatsapp/incoming';
export const WHATSAPP_STATUS_API_URL = `${API_SERVICE_URL}/${WHATSAPP_STATUS_API_PATH}`;
export const WHATSAPP_INCOMING_API_URL = `${API_SERVICE_URL}/${WHATSAPP_INCOMING_API_PATH}`;

export const INTERNAL_GEOSERVER_API_URL =
  'http://ibf-geoserver:8080/geoserver/rest';

// Set this to true to temporarily test with old pipeline upload. Remove after all pipelines migrated.
export const MOCK_USE_OLD_PIPELINE_UPLOAD = false;

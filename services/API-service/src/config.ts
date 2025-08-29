import { MailerOptions } from '@nestjs-modules/mailer';

import path from 'path';

import { MjmlAdapter } from './api/email/mjml-adapter';

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

export const SMTP_CONFIG: MailerOptions = {
  transport: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USERNAME || 'username',
      pass: process.env.SMTP_PASSWORD || 'password',
    },
  },
  defaults: { from: process.env.SMTP_FROM || 'noreply@example.com' },
  preview: true,
  template: {
    dir: path.join(__dirname, '/api/email/templates'),
    adapter: new MjmlAdapter('ejs', { inlineCssEnabled: false }),
    options: { strict: true },
  },
};

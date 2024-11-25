// eslint-disable-next-line @typescript-eslint/no-require-imports
export const twilioClient = require('twilio')(
  process.env.TWILIO_SID,
  process.env.TWILIO_AUTHTOKEN,
);
// eslint-disable-next-line @typescript-eslint/no-require-imports
export const twilio = require('twilio');

// Infobip integration has been removed. This file remains as a compatibility stub
// in case other modules still require it. It will throw helpful errors.
const loggingService = require('./logging.service');
const logger = loggingService.getLogger();

function missing() {
  throw new Error('Infobip SMS service has been removed. Use Twilio (SMS_PROVIDER=twilio) or implement another provider.');
}

module.exports = {
  init: async () => {
    logger.warn('[SMS] Infobip service stub called: init() - service removed');
    missing();
  },
  sendSms: async () => {
    logger.warn('[SMS] Infobip service stub called: sendSms() - service removed');
    missing();
  },
  sendVerificationCodeSms: async () => {
    logger.warn('[SMS] Infobip service stub called: sendVerificationCodeSms() - service removed');
    missing();
  }
};

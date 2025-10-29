const loggingService = require('./logging.service');
const { parsePhoneNumber } = require('libphonenumber-js');
const { BadRequestError } = require('../utils/errors');

const logger = loggingService.getLogger();

const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;

let client = null;
function initClient() {
  if (!client) {
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('Missing Twilio credentials: TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN');
    }
    // lazy require so package is optional until used
    const twilio = require('twilio');
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
}

function formatPhoneNumber(phone) {
  try {
    const phoneNumber = parsePhoneNumber(phone);
    if (!phoneNumber || !phoneNumber.isValid()) {
      throw new BadRequestError('Invalid phone number format');
    }
    return phoneNumber.format('E.164');
  } catch (error) {
    logger.error('[Twilio] Error formatting phone number:', error.message);
    throw new BadRequestError('Invalid phone number format');
  }
}

async function init() {
  initClient();
  logger.info('[Twilio] Client initialized');
}

async function sendSms(to, text, from) {
  initClient();

  const formatted = formatPhoneNumber(to);
  const fromNumber = from || TWILIO_FROM_NUMBER;
  if (!fromNumber) {
    throw new Error('Missing TWILIO_FROM_NUMBER environment variable');
  }

  try {
    logger.info('[Twilio] Sending SMS', { to: formatted, from: fromNumber });
    const message = await client.messages.create({
      body: text,
      from: fromNumber,
      to: formatted
    });
    logger.info('[Twilio] Message sent', { sid: message.sid, status: message.status });
    return message;
  } catch (error) {
    logger.error('[Twilio] Failed to send SMS', { message: error.message, code: error.code, more: error.more });
    throw new Error(`Twilio send failed: ${error.message}`);
  }
}

async function sendVerificationCodeSms(phone, code) {
  const template = process.env.INFOBIP_MESSAGE_TEMPLATE || 'Your Foxus verification code is {{pin}}. Valid for 15 minutes.';
  const text = template.replace('{{pin}}', code);
  return await sendSms(phone, text);
}

module.exports = {
  init,
  sendSms,
  sendVerificationCodeSms
};

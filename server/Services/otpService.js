const crypto = require('crypto');

const OTP_LENGTH = 6;
const OTP_EXPIRES_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = 30;

const generateOtp = () => {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = (10 ** OTP_LENGTH) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
};

const hashOtp = (otp) => crypto.createHash('sha256').update(String(otp)).digest('hex');

const getOtpExpiryDate = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() + OTP_EXPIRES_MINUTES);
  return now;
};

const getResendAvailableDate = () => {
  const now = new Date();
  now.setSeconds(now.getSeconds() + RESEND_COOLDOWN_SECONDS);
  return now;
};

module.exports = {
  OTP_EXPIRES_MINUTES,
  RESEND_COOLDOWN_SECONDS,
  generateOtp,
  hashOtp,
  getOtpExpiryDate,
  getResendAvailableDate
};

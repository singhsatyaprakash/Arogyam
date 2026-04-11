const crypto = require('crypto');
const Razorpay = require('razorpay');

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_API_KEY;
  const keySecret = process.env.RAZORPAY_API_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_API_KEY and RAZORPAY_API_SECRET must be configured in server env');
  }

  return { keyId, keySecret };
};

const getRazorpayInstance = () => {
  const { keyId, keySecret } = getRazorpayConfig();
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

const verifyRazorpaySignature = ({ orderId, paymentId, signature }) => {
  const { keySecret } = getRazorpayConfig();
  const payload = `${orderId}|${paymentId}`;
  const expected = crypto.createHmac('sha256', keySecret).update(payload).digest('hex');
  return expected === signature;
};

module.exports = {
  getRazorpayConfig,
  getRazorpayInstance,
  verifyRazorpaySignature
};

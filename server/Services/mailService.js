const nodemailer = require('nodemailer');

let transporter;
// we can use Amazon SES for email service at high demand user level...
const getTransporter = () => {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
    return transporter;
  }

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    return transporter;
  }

  throw new Error('Email service is not configured. Set SMTP_* or EMAIL_USER/EMAIL_PASS env vars.');
};

const sendOtpEmail = async ({ to, name, role, otp, purpose = 'registration' }) => {
  const safeName = name || 'User';
  const appName = process.env.APP_NAME || 'Arogyam';
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  if (!from) {
    throw new Error('MAIL_FROM or sender email is not configured');
  }

  const transporterInstance = getTransporter();

  const isPasswordReset = purpose === 'password_reset';
  const heading = isPasswordReset ? `${appName} Password Reset OTP` : `${appName} Email Verification`;
  const roleText = role === 'doctor' ? 'doctor' : 'patient';
  const otpText = isPasswordReset
    ? `Your OTP for ${roleText} password reset is:`
    : `Your OTP for ${roleText} registration is:`;
  const actionText = isPasswordReset ? 'reset your password' : 'complete your registration';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f766e;">${heading}</h2>
      <p>Hello ${safeName},</p>
      <p>${otpText}</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #111827; margin: 16px 0;">${otp}</div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>Use this OTP to ${actionText} in ${appName}.</p>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;

  await transporterInstance.sendMail({
    from,
    to,
    subject: isPasswordReset ? `${appName} Password Reset OTP` : `${appName} OTP Verification`,
    html,
    text: `Hello ${safeName}, your OTP is ${otp}. It is valid for 10 minutes. Use it to ${actionText}.`
  });
};

module.exports = {
  sendOtpEmail
};

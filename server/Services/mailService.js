const nodemailer = require('nodemailer');

let transporter;

class MailServiceError extends Error {
  constructor(message, publicMessage, statusCode = 500) {
    super(message);
    this.name = 'MailServiceError';
    this.publicMessage = publicMessage || 'Email service error';
    this.statusCode = statusCode;
  }
}

const toCleanString = (value) => String(value || '').trim();

const getMailErrorResponse = (error) => {
  if (error instanceof MailServiceError) {
    return {
      status: error.statusCode || 500,
      message: error.publicMessage || 'Email service error'
    };
  }

  return {
    status: 500,
    message: 'Internal server error'
  };
};
// we can use Amazon SES for email service at high demand user level...
const getTransporter = () => {
  if (transporter) return transporter;

  const smtpHost = toCleanString(process.env.SMTP_HOST);
  const smtpPort = toCleanString(process.env.SMTP_PORT);
  const smtpUser = toCleanString(process.env.SMTP_USER);
  const smtpPass = toCleanString(process.env.SMTP_PASS);

  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: String(process.env.SMTP_SECURE || 'false') === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });
    return transporter;
  }

  const emailUser = toCleanString(process.env.EMAIL_USER);
  // Gmail app passwords are often copied with spaces; normalize to avoid auth failures.
  const emailPass = toCleanString(process.env.EMAIL_PASS).replace(/\s+/g, '');

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
    return transporter;
  }

  throw new MailServiceError(
    'Email service is not configured. Set SMTP_* or EMAIL_USER/EMAIL_PASS env vars.',
    'Email service is not configured on server. Please set SMTP or EMAIL credentials.',
    500
  );
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

  try {
    await transporterInstance.sendMail({
      from,
      to,
      subject: isPasswordReset ? `${appName} Password Reset OTP` : `${appName} OTP Verification`,
      html,
      text: `Hello ${safeName}, your OTP is ${otp}. It is valid for 10 minutes. Use it to ${actionText}.`
    });
  } catch (error) {
    if (error?.code === 'EAUTH') {
      throw new MailServiceError(
        `Email authentication failed: ${error.message}`,
        'Email authentication failed. Verify SMTP/EMAIL credentials.',
        500
      );
    }
    if (['ECONNECTION', 'ESOCKET', 'ETIMEDOUT'].includes(error?.code)) {
      throw new MailServiceError(
        `Email server connection error: ${error.message}`,
        'Unable to connect to email service. Please try again later.',
        503
      );
    }
    throw new MailServiceError(
      `Failed to send OTP email: ${error.message}`,
      'Failed to send OTP email. Please try again.',
      500
    );
  }
};

const sendAdminCredentialsEmail = async ({ to, name, adminEmail, password }) => {
  const safeName = name || 'Admin';
  const appName = process.env.APP_NAME || 'Arogyam';
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  if (!from) {
    throw new Error('MAIL_FROM or sender email is not configured');
  }

  const transporterInstance = getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #0f766e;">${appName} Admin Account Created</h2>
      <p>Hello ${safeName},</p>
      <p>Your admin account has been created. Use the following credentials to login:</p>
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:14px; margin:16px 0;">
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${adminEmail}</p>
        <p style="margin:0;"><strong>Password:</strong> ${password}</p>
      </div>
      <p>For security, please change your password after your first login.</p>
    </div>
  `;

  try {
    await transporterInstance.sendMail({
      from,
      to,
      subject: `${appName} Admin Credentials`,
      html,
      text: `Hello ${safeName}, your ${appName} admin account is ready. Email: ${adminEmail}, Password: ${password}. Please change password after first login.`
    });
  } catch (error) {
    throw new MailServiceError(
      `Failed to send admin credentials email: ${error.message}`,
      'Failed to send admin credentials email. Check email service configuration.',
      500
    );
  }
};

const sendAdminPasswordResetOtpEmail = async ({ to, name, otp }) => {
  const safeName = name || 'Admin';
  const appName = process.env.APP_NAME || 'Arogyam';
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER;

  if (!from) {
    throw new Error('MAIL_FROM or sender email is not configured');
  }

  const transporterInstance = getTransporter();

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #be123c;">${appName} Admin Password Reset OTP</h2>
      <p>Hello ${safeName},</p>
      <p>Your OTP for admin password reset is:</p>
      <div style="font-size: 28px; font-weight: 700; letter-spacing: 8px; color: #111827; margin: 16px 0;">${otp}</div>
      <p>This OTP will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email and secure your account.</p>
    </div>
  `;

  try {
    await transporterInstance.sendMail({
      from,
      to,
      subject: `${appName} Admin Password Reset OTP`,
      html,
      text: `Hello ${safeName}, your admin password reset OTP is ${otp}. It is valid for 10 minutes.`
    });
  } catch (error) {
    throw new MailServiceError(
      `Failed to send admin password reset OTP email: ${error.message}`,
      'Failed to send admin OTP email. Please try again later.',
      500
    );
  }
};

module.exports = {
  sendOtpEmail,
  sendAdminCredentialsEmail,
  sendAdminPasswordResetOtpEmail,
  getMailErrorResponse
};

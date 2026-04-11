const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Admin = require('../Models/admin.model');
const PendingVerification = require('../Models/pendingVerification.model');
const { sendAdminCredentialsEmail, sendAdminPasswordResetOtpEmail } = require('../Services/mailService');
const {
  OTP_EXPIRES_MINUTES,
  RESEND_COOLDOWN_SECONDS,
  generateOtp,
  hashOtp,
  getOtpExpiryDate,
  getResendAvailableDate
} = require('../Services/otpService');

const defaultAdminName = process.env.ADMIN_NAME || 'Super Admin';
const defaultAdminEmail = String(process.env.ADMIN_EMAIL || 'admin@arogyam.com').toLowerCase();
const defaultAdminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
const MAX_OTP_ATTEMPTS = 5;
const PASSWORD_RESET_OTP_PURPOSE = 'password_reset';

const ensureDefaultAdmin = async () => {
  const hasAdmin = await Admin.exists({ role: 'admin' });
  if (hasAdmin) return;

  const hash = await bcrypt.hash(defaultAdminPassword, 10);
  await Admin.create({
    name: defaultAdminName,
    email: defaultAdminEmail,
    password: hash,
    role: 'admin'
  });
};

const loginAdmin = async (req, res) => {
  try {
    await ensureDefaultAdmin();

    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Provide email and password' });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (admin.isBlocked) {
      return res.status(403).json({ success: false, message: 'Account blocked' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: 'admin' },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    admin.token = token;
    admin.lastLogin = Date.now();
    await admin.save();

    const safeAdmin = admin.getSafeProfile ? admin.getSafeProfile() : admin.toObject();

    return res.status(200).json({
      success: true,
      message: 'Admin login successful',
      data: {
        admin: safeAdmin,
        token
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const createAdmin = async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();

    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required' });
    }

    const existing = await Admin.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Admin with this email already exists' });
    }

    const generatedPassword = crypto.randomBytes(6).toString('base64url');
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      createdBy: req.user?.id || null
    });

    await sendAdminCredentialsEmail({
      to: email,
      name,
      adminEmail: email,
      password: generatedPassword
    });

    const safeAdmin = newAdmin.getSafeProfile ? newAdmin.getSafeProfile() : newAdmin.toObject();

    return res.status(201).json({
      success: true,
      message: 'New admin created and credentials sent to email',
      data: { admin: safeAdmin }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const validateAdminToken = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select('-password -__v');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Token valid',
      data: { admin }
    });
  } catch (error) {
    console.error('Validate admin token error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logoutAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.token = null;
    await admin.save();

    return res.status(200).json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.error('Admin logout error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sendAdminForgotPasswordOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    await ensureDefaultAdmin();

    const admin = await Admin.findOne({ email, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ success: false, message: 'No admin account found with this email' });
    }

    const existingPending = await PendingVerification.findOne({
      email,
      role: 'admin',
      purpose: PASSWORD_RESET_OTP_PURPOSE
    });

    if (existingPending && new Date(existingPending.resendAvailableAt) > new Date()) {
      const waitSeconds = Math.ceil((new Date(existingPending.resendAvailableAt).getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting another OTP`
      });
    }

    const otp = generateOtp();
    await PendingVerification.findOneAndUpdate(
      { email, role: 'admin', purpose: PASSWORD_RESET_OTP_PURPOSE },
      {
        $set: {
          otpHash: hashOtp(otp),
          otpExpiresAt: getOtpExpiryDate(),
          resendAvailableAt: getResendAvailableDate(),
          failedAttempts: 0,
          payload: {}
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendAdminPasswordResetOtpEmail({
      to: email,
      name: admin.name,
      otp
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to admin email',
      data: {
        email,
        expiresInMinutes: OTP_EXPIRES_MINUTES,
        resendInSeconds: RESEND_COOLDOWN_SECONDS
      }
    });
  } catch (error) {
    console.error('Send admin forgot password OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetAdminPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();
    const newPassword = String(req.body?.newPassword || '');

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const pending = await PendingVerification.findOne({
      email,
      role: 'admin',
      purpose: PASSWORD_RESET_OTP_PURPOSE
    });

    if (!pending) {
      return res.status(404).json({ success: false, message: 'No pending password reset found' });
    }

    if (new Date(pending.otpExpiresAt) < new Date()) {
      await PendingVerification.deleteOne({ _id: pending._id });
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP' });
    }

    if (hashOtp(otp) !== pending.otpHash) {
      pending.failedAttempts = (pending.failedAttempts || 0) + 1;
      if (pending.failedAttempts >= MAX_OTP_ATTEMPTS) {
        await PendingVerification.deleteOne({ _id: pending._id });
        return res.status(400).json({ success: false, message: 'Too many invalid attempts. Please request a new OTP' });
      }
      await pending.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const admin = await Admin.findOne({ email, role: 'admin' });
    if (!admin) {
      await PendingVerification.deleteOne({ _id: pending._id });
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    admin.token = null;
    await admin.save();

    await PendingVerification.deleteOne({ _id: pending._id });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please login again.'
    });
  } catch (error) {
    console.error('Reset admin password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  loginAdmin,
  createAdmin,
  validateAdminToken,
  logoutAdmin,
  sendAdminForgotPasswordOtp,
  resetAdminPassword
};

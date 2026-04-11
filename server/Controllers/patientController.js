const Patient = require('../Models/patient.model');
const ChatConnection = require('../Models/chatConnection.model');
const PendingVerification = require('../Models/pendingVerification.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { sendOtpEmail } = require('../Services/mailService');
const {
  OTP_EXPIRES_MINUTES,
  RESEND_COOLDOWN_SECONDS,
  generateOtp,
  hashOtp,
  getOtpExpiryDate,
  getResendAvailableDate
} = require('../Services/otpService');

const MAX_OTP_ATTEMPTS = 5;
const REGISTRATION_OTP_PURPOSE = 'registration';
const PASSWORD_RESET_OTP_PURPOSE = 'password_reset';

const validatePatientRegistrationPayload = (payload = {}) => {
  const { name, email, phone, password, age, gender } = payload;

  if (!name || !email || !phone || !password || age === undefined || !gender) {
    return { ok: false, message: 'Please provide name, email, phone, password, age and gender' };
  }

  const normalizedGender = String(gender).toLowerCase();
  if (!['male', 'female', 'other'].includes(normalizedGender)) {
    return { ok: false, message: 'Gender must be male, female or other' };
  }

  const ageNumber = Number(age);
  if (!Number.isFinite(ageNumber) || ageNumber < 0) {
    return { ok: false, message: 'Age must be a valid non-negative number' };
  }

  return {
    ok: true,
    data: {
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      phone: String(phone).trim(),
      password: String(password),
      age: ageNumber,
      gender: normalizedGender
    }
  };
};

const sendPatientRegistrationOtp = async (req, res) => {
  try {
    const validation = validatePatientRegistrationPayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ success: false, message: validation.message });
    }

    const data = validation.data;
    const existing = await Patient.findOne({ email: data.email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const existingPending = await PendingVerification.findOne({
      email: data.email,
      role: 'patient',
      purpose: REGISTRATION_OTP_PURPOSE
    });
    if (existingPending && new Date(existingPending.resendAvailableAt) > new Date()) {
      const waitSeconds = Math.ceil((new Date(existingPending.resendAvailableAt).getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting another OTP`
      });
    }

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    await PendingVerification.findOneAndUpdate(
      { email: data.email, role: 'patient', purpose: REGISTRATION_OTP_PURPOSE },
      {
        $set: {
          otpHash: hashOtp(otp),
          otpExpiresAt: getOtpExpiryDate(),
          resendAvailableAt: getResendAvailableDate(),
          failedAttempts: 0,
          payload: {
            name: data.name,
            email: data.email,
            phone: data.phone,
            password: hashedPassword,
            age: data.age,
            gender: data.gender
          }
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail({ to: data.email, name: data.name, role: 'patient', otp });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: data.email,
        expiresInMinutes: OTP_EXPIRES_MINUTES,
        resendInSeconds: RESEND_COOLDOWN_SECONDS
      }
    });
  } catch (error) {
    console.error('Send patient registration OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resendPatientRegistrationOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const pending = await PendingVerification.findOne({
      email,
      role: 'patient',
      purpose: REGISTRATION_OTP_PURPOSE
    });
    if (!pending) {
      return res.status(404).json({ success: false, message: 'No pending verification found for this email' });
    }

    if (new Date(pending.resendAvailableAt) > new Date()) {
      const waitSeconds = Math.ceil((new Date(pending.resendAvailableAt).getTime() - Date.now()) / 1000);
      return res.status(429).json({
        success: false,
        message: `Please wait ${waitSeconds}s before requesting another OTP`
      });
    }

    const otp = generateOtp();
    pending.otpHash = hashOtp(otp);
    pending.otpExpiresAt = getOtpExpiryDate();
    pending.resendAvailableAt = getResendAvailableDate();
    pending.failedAttempts = 0;
    await pending.save();

    await sendOtpEmail({
      to: email,
      name: pending.payload?.name,
      role: 'patient',
      otp
    });

    return res.status(200).json({
      success: true,
      message: 'OTP resent successfully',
      data: { resendInSeconds: RESEND_COOLDOWN_SECONDS }
    });
  } catch (error) {
    console.error('Resend patient registration OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const verifyPatientRegistrationOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const otp = String(req.body?.otp || '').trim();

    if (!email || !otp) {
      return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    const pending = await PendingVerification.findOne({
      email,
      role: 'patient',
      purpose: REGISTRATION_OTP_PURPOSE
    });
    if (!pending) {
      return res.status(404).json({ success: false, message: 'No pending verification found' });
    }

    if (new Date(pending.otpExpiresAt) < new Date()) {
      await PendingVerification.deleteOne({ _id: pending._id });
      return res.status(400).json({ success: false, message: 'OTP expired. Please request a new OTP' });
    }

    if (hashOtp(otp) !== pending.otpHash) {
      pending.failedAttempts = (pending.failedAttempts || 0) + 1;
      if (pending.failedAttempts >= MAX_OTP_ATTEMPTS) {
        await PendingVerification.deleteOne({ _id: pending._id });
        return res.status(400).json({ success: false, message: 'Too many invalid attempts. Please register again' });
      }
      await pending.save();
      return res.status(400).json({ success: false, message: 'Invalid OTP' });
    }

    const payload = pending.payload || {};
    const existing = await Patient.findOne({ email });
    if (existing) {
      await PendingVerification.deleteOne({ _id: pending._id });
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const patient = new Patient({
      name: payload.name,
      email,
      phone: payload.phone,
      password: payload.password,
      age: Number(payload.age),
      gender: payload.gender
    });

    await patient.save();

    const token = jwt.sign(
      { id: patient._id, email: patient.email, role: 'patient' },
      process.env.JWT_SECRET || 'your_jwt_secret_key_here',
      { expiresIn: '7d' }
    );

    patient.token = token;
    patient.lastLogin = Date.now();
    await patient.save();

    await PendingVerification.deleteOne({ _id: pending._id });

    const patientData = patient.toObject();
    delete patientData.password;
    delete patientData.__v;

    return res.status(201).json({
      success: true,
      message: 'Patient registered successfully',
      data: { patient: patientData, token }
    });
  } catch (error) {
    console.error('Verify patient registration OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Register patient...
const registerPatient = async (req, res) => {
  return sendPatientRegistrationOtp(req, res);
};

// Login patient...
const loginPatient = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password){
      return res.status(400).json({ success: false, message: 'Provide email and password' });
    }

    const patient = await Patient.findOne({ email: email.toLowerCase() });
    if (!patient){
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const matchPassword = await bcrypt.compare(password, patient.password);
    if (!matchPassword) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (patient.isBlocked){
      return res.status(403).json({ success: false, message: 'Account blocked' });
    }

    const token = jwt.sign({ id: patient._id, email: patient.email, role: 'patient' }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    patient.token = token;
    patient.lastLogin = Date.now();
    await patient.save();

    delete patient.password;
    return res.status(200).json({ success: true, message: 'Login successful', data: { patient, token } });
  } 
  catch (error) {
    console.error('Patient login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get patient profile
// const getPatientProfile = async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.user.id).select('-password -__v');
//     if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });
//     res.status(200).json({ success: true, data: patient });
//   } catch (error) {
//     console.error('Get patient profile error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// Logout patient
// const logoutPatient = async (req, res) => {
//   try {
//     const patient = await Patient.findById(req.user.id);
//     if (!patient) return res.status(404).json({ success: false, message: 'Patient not found' });

//     patient.token = null;
//     await patient.save();

//     res.status(200).json({ success: true, message: 'Logged out successfully' });
//   } catch (error) {
//     console.error('Patient logout error:', error);
//     res.status(500).json({ success: false, message: 'Internal server error' });
//   }
// };

// Get patient's doctor connections list...
const getConnectionsList = async (req, res) => {
  try {
    // Use patientId from body or authenticated user
    const patientId = req.body.patientId || req.user.id;
    
    if (!patientId) {
      return res.status(400).json({ success: false, message: 'Patient ID is required' });
    }

    // Verify patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Get all chat connections for this patient
    const connections = await ChatConnection.find({ patient: patientId })
      .populate('doctor', 'name email phone specialization profileImage') // Get doctor details
      .sort({ lastActivityAt: -1 }) // Most recent activity first
      .lean();

    // Map connections to include calculated fields
    const connectionsList = connections.map(conn => ({
      ...conn,
      isActive: new Date() < new Date(conn.expiresAt) && conn.status === 'active',
      timeRemaining: Math.max(0, new Date(conn.expiresAt) - new Date()) // milliseconds remaining
    }));

    res.status(200).json({
      success: true,
      message: 'Connections retrieved successfully',
      data: {
        total: connectionsList.length,
        connections: connectionsList
      }
    });
  } catch (error) {
    console.error('Get connections list error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const validatePatientToken = async (req, res) => {
  try {
    const patient = await Patient.findById(req.user.id).select('-password -__v -token');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Token is valid',
      data: { patient }
    });
  } catch (error) {
    console.error('Validate patient token error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const logoutPatient = async (req, res) => {
  try {
    await Patient.findByIdAndUpdate(req.user.id, { $set: { token: null } });
    return res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Patient logout error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const sendPatientForgotPasswordOtp = async (req, res) => {
  try {
    const email = String(req.body?.email || '').trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const patient = await Patient.findOne({ email });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'No patient account found with this email' });
    }

    const existingPending = await PendingVerification.findOne({
      email,
      role: 'patient',
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
      { email, role: 'patient', purpose: PASSWORD_RESET_OTP_PURPOSE },
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

    await sendOtpEmail({
      to: email,
      name: patient.name,
      role: 'patient',
      otp,
      purpose: PASSWORD_RESET_OTP_PURPOSE
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email,
        expiresInMinutes: OTP_EXPIRES_MINUTES,
        resendInSeconds: RESEND_COOLDOWN_SECONDS
      }
    });
  } catch (error) {
    console.error('Send patient forgot password OTP error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const resetPatientPassword = async (req, res) => {
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
      role: 'patient',
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

    const patient = await Patient.findOne({ email });
    if (!patient) {
      await PendingVerification.deleteOne({ _id: pending._id });
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    patient.password = await bcrypt.hash(newPassword, 10);
    patient.token = null;
    await patient.save();

    await PendingVerification.deleteOne({ _id: pending._id });

    return res.status(200).json({
      success: true,
      message: 'Password updated successfully. Please login again.'
    });
  } catch (error) {
    console.error('Reset patient password error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = {
  registerPatient,
  sendPatientRegistrationOtp,
  resendPatientRegistrationOtp,
  verifyPatientRegistrationOtp,
  sendPatientForgotPasswordOtp,
  resetPatientPassword,
  loginPatient,
  // getPatientProfile,
  // logoutPatient,
  getConnectionsList,
  validatePatientToken,
  logoutPatient
};

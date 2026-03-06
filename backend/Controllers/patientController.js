const Patient = require('../Models/patient.model');
const ChatConnection = require('../Models/chatConnection.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Register patient...
const registerPatient = async (req, res) => {
  try {
    const { name, email, phone, password, age, gender } = req.body;

    if (!name || !email || !phone || !password || age === undefined || !gender) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, phone, password, age and gender' });
    }

    const existing = await Patient.findOne({ email: email.toLowerCase() });
    if (existing){ 
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const hashed = await bcrypt.hash(password, 10);

    const patient = new Patient({
      name,
      email: email.toLowerCase(),
      phone,
      password: hashed,
      age: Number(age),
      gender:gender.toLowerCase()
    });

    await patient.save();

    const token = jwt.sign({ id: patient._id, email: patient.email, role: 'patient' }, process.env.JWT_SECRET || 'your_jwt_secret_key_here', { expiresIn: '7d' });

    // Use getPublicProfile() if available (keeps parity with doctorController), fallback to manual sanitize
    delete patient.password;
    return res.status(201).json({ success: true, message: 'Patient registered', data: { patient, token } });
  }
  catch (error) {
    console.error('Patient register error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
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
module.exports = {
  registerPatient,
  loginPatient,
  // getPatientProfile,
  // logoutPatient,
  getConnectionsList
};

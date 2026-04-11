const jwt = require('jsonwebtoken');
const Doctor = require('../Models/doctor.model');

// Simple pass-through login limiter placeholder
const doctorLoginLimiter = (req, res, next) => {
  // Replace with real rate limiting logic if needed
  next();
};

// Authenticate doctor via JWT bearer token
const authenticateDoctor = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const doctorId = decoded.id || decoded.Id;
    if (!doctorId || decoded.role !== 'doctor') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const doctor = await Doctor.findById(doctorId).select('token isBlocked email');
    if (!doctor || doctor.isBlocked) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!doctor.token || doctor.token !== token) {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }

    req.user = { id: doctorId, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = {
  doctorLoginLimiter,
  authenticateDoctor
};
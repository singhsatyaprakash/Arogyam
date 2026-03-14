const jwt = require('jsonwebtoken');

// Placeholder rate limiter for patient login
const patientLoginLimiter = (req, res, next) => {
  // Replace with real rate-limiting if needed
  next();
};

const authenticatePatient = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const patientId = decoded.id || decoded.Id;
    if (!patientId || decoded.role !== 'patient') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    req.user = { id: patientId, email: decoded.email, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = {
  patientLoginLimiter,
  authenticatePatient
};

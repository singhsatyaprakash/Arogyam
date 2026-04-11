const jwt = require('jsonwebtoken');
const Admin = require('../Models/admin.model');

const adminLoginLimiter = (req, res, next) => {
  next();
};

const authenticateAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key_here');
    const adminId = decoded.id || decoded.Id;

    if (!adminId || decoded.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const admin = await Admin.findById(adminId).select('email token isBlocked role');
    if (!admin || admin.isBlocked || admin.role !== 'admin') {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!admin.token || admin.token !== token) {
      return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }

    req.user = {
      id: adminId,
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = {
  adminLoginLimiter,
  authenticateAdmin
};

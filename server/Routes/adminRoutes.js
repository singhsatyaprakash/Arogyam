const express = require('express');
const router = express.Router();

const adminController = require('../Controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');

router.post('/login', adminMiddleware.adminLoginLimiter, adminController.loginAdmin);
router.post('/forgot-password/send-otp', adminController.sendAdminForgotPasswordOtp);
router.post('/forgot-password/reset', adminController.resetAdminPassword);
router.get('/validate', adminMiddleware.authenticateAdmin, adminController.validateAdminToken);
router.post('/logout', adminMiddleware.authenticateAdmin, adminController.logoutAdmin);
router.post('/create', adminMiddleware.authenticateAdmin, adminController.createAdmin);

module.exports = router;

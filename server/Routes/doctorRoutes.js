const express = require('express');
const router = express.Router();
const doctorController = require('../Controllers/doctorController');
const doctorMiddleware = require('../middlewares/doctorMiddleware');

// Public routes
router.post('/register', doctorController.registerDoctor);
router.post('/register/send-otp', doctorController.sendDoctorRegistrationOtp);
router.post('/register/resend-otp', doctorController.resendDoctorRegistrationOtp);
router.post('/register/verify-otp', doctorController.verifyDoctorRegistrationOtp);
router.post('/login', doctorMiddleware.doctorLoginLimiter, doctorController.loginDoctor);
router.post('/forgot-password/send-otp', doctorController.sendDoctorForgotPasswordOtp);
router.post('/forgot-password/reset', doctorController.resetDoctorPassword);

router.post('/getConnectionsList', doctorController.getConnectionsList);

router.get('/available', doctorController.getAvailableDoctors);

// Protected routes (require authentication)
router.get('/profile', doctorMiddleware.authenticateDoctor, doctorController.getDoctorProfile);
router.put('/profile', doctorMiddleware.authenticateDoctor, doctorController.updateDoctorProfile);
router.get('/validate', doctorMiddleware.authenticateDoctor, doctorController.validateDoctorToken);
router.post('/logout', doctorMiddleware.authenticateDoctor, doctorController.logoutDoctor);

// Slot management (doctor-auth)
router.post('/slots', doctorMiddleware.authenticateDoctor, doctorController.createDoctorSlots);

// Public slot calendar
router.get('/:doctorId/slots', doctorController.getDoctorSlots);

// Admin routes (optional - for admin panel)
router.get('/all', doctorMiddleware.authenticateDoctor, doctorController.getAllDoctors);

// Test route (MUST be before "/:doctorId")
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Doctor routes are working!',
    timestamp: new Date().toISOString()
  });
});

// Public doctor details (safe) (keep last among simple GETs)
router.get('/:doctorId', doctorController.getDoctorByIdPublic);


module.exports = router;
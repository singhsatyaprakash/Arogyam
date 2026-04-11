const express = require('express');
const router = express.Router();
const patientController = require('../Controllers/patientController');
const patientMiddleware = require('../middlewares/patientMiddleware');


router.post('/register', patientController.registerPatient);
router.post('/register/send-otp', patientController.sendPatientRegistrationOtp);
router.post('/register/resend-otp', patientController.resendPatientRegistrationOtp);
router.post('/register/verify-otp', patientController.verifyPatientRegistrationOtp);
router.post('/login', patientController.loginPatient);
router.post('/forgot-password/send-otp', patientController.sendPatientForgotPasswordOtp);
router.post('/forgot-password/reset', patientController.resetPatientPassword);

// router.get('/profile', patientController.getPatientProfile);
// router.post('/logout', patientController.logoutPatient);

router.post('/getConnectionsList',patientController.getConnectionsList);
router.get('/validate', patientMiddleware.authenticatePatient, patientController.validatePatientToken);
router.post('/logout', patientMiddleware.authenticatePatient, patientController.logoutPatient);


module.exports = router;

const express = require('express');
const router = express.Router();
const patientController = require('../Controllers/patientController');


router.post('/register', patientController.registerPatient);
router.post('/login', patientController.loginPatient);

// router.get('/profile', patientController.getPatientProfile);
// router.post('/logout', patientController.logoutPatient);

router.post('/getConnectionsList',patientController.getConnectionsList);


module.exports = router;

const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/appointmentController');
const appointmentMiddleware = require('../middlewares/appointmentMiddleware');
const doctorMiddleware = require('../middlewares/doctorMiddleware');

router.get('/search', appointmentController.searchDoctors);

router.get('/availability',appointmentController.getAvailability);

//add a middleware for payement verfication..
router.post('/confirm-payment',appointmentController.confirmPayment);

router.get('/patient/:patientId',appointmentMiddleware.validatePatientAppointmentsParams,appointmentController.getPatientAppointments);

// NEW: cancel appointment (also releases slot)
router.post('/:appointmentId/cancel',appointmentMiddleware.validateCancelAppointment,appointmentController.cancelAppointment);

// NEW: reschedule appointment (PATIENT)
router.post('/:appointmentId/reschedule',appointmentMiddleware.validateRescheduleAppointment,appointmentController.rescheduleAppointment);


// Simple route to get appointments by doctor ID (no auth required)
router.get('/doctor/:doctorId/list', appointmentController.getAppointmentsByDoctorId);

// Doctor cancels (also releases slot)
router.post('/:appointmentId/doctor-cancel',doctorMiddleware.authenticateDoctor,appointmentController.doctorCancelAppointment);

// Doctor reschedules (reserve new slot, update appt, release old slot)
router.post('/:appointmentId/doctor-reschedule',doctorMiddleware.authenticateDoctor,appointmentController.doctorRescheduleAppointment);

// Doctor marks appointment completed (after video call ends)
router.post('/:appointmentId/doctor-complete',doctorMiddleware.authenticateDoctor,appointmentController.doctorCompleteAppointment);

// Public single doctor by id
router.get('/doctor/:id', appointmentController.getDoctor);



// NEW: Chat routes (before slot routes for clarity)
router.post('/confirm-payment-chat',appointmentMiddleware.validateConfirmPaymentChatBody,appointmentController.confirmPaymentChat);

router.get('/chat/:patientId',appointmentMiddleware.validatePatientAppointmentsParams,appointmentController.getPatientChats);

router.post('/chat/:chatId/close',appointmentController.closeChat);




module.exports = router;
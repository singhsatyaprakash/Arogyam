const express = require('express');
const router = express.Router();
const appointmentController = require('../Controllers/appointmentContoller');
const appointmentMiddleware = require('../middlewares/appointmentMiddleware');
const doctorMiddleware = require('../middlewares/doctorMiddleware');

const mw = (fn) => (typeof fn === 'function' ? fn : (req, res, next) => next());
const h = (fn) =>
  (typeof fn === 'function'
    ? fn
    : (req, res) => res.status(501).json({ success: false, message: 'Handler not implemented' }));

router.get('/search', h(appointmentController.searchDoctors));

/**
 * IMPORTANT:
 * Define exact /doctor/me routes BEFORE /doctor/:id
 * otherwise "/doctor/me" is treated as { id: "me" }.
 */

// ===============================
// Doctor-auth appointment routes
// ===============================
router.get(
  '/doctor/me',
  mw(doctorMiddleware.authenticateDoctor),
  h(appointmentController.getDoctorAppointments)
);

// Upcoming (booked + scheduledAt >= now)
router.get(
  '/doctor/me/upcoming',
  mw(doctorMiddleware.authenticateDoctor),
  h(appointmentController.getDoctorUpcomingAppointments)
);

// Doctor cancels (also releases slot)
router.post(
  '/:appointmentId/doctor-cancel',
  mw(doctorMiddleware.authenticateDoctor),
  h(appointmentController.doctorCancelAppointment)
);

// Doctor reschedules (reserve new slot, update appt, release old slot)
router.post(
  '/:appointmentId/doctor-reschedule',
  mw(doctorMiddleware.authenticateDoctor),
  h(appointmentController.doctorRescheduleAppointment)
);

// Public single doctor by id (MUST stay after /doctor/me)
router.get('/doctor/:id', h(appointmentController.getDoctor));

router.get(
  '/availability',
  h(appointmentController.getAvailability)
);

// NEW: Chat routes (before slot routes for clarity)
router.post(
  '/confirm-payment-chat',
  mw(appointmentMiddleware.validateConfirmPaymentChatBody),
  h(appointmentController.confirmPaymentChat)
);

router.get(
  '/chat/:patientId',
  mw(appointmentMiddleware.validatePatientAppointmentsParams),
  h(appointmentController.getPatientChats)
);

router.post(
  '/chat/:chatId/close',
  h(appointmentController.closeChat)
);

// Slot-based routes (video/in-person)
router.post(
  '/confirm-payment',
  mw(appointmentMiddleware.validateConfirmPaymentBody),
  h(appointmentController.confirmPayment)
);

// NEW: patient appointments
router.get(
  '/patient/:patientId',
  mw(appointmentMiddleware.validatePatientAppointmentsParams),
  h(appointmentController.getPatientAppointments)
);

// NEW: cancel appointment (also releases slot)
router.post(
  '/:appointmentId/cancel',
  mw(appointmentMiddleware.validateCancelAppointment),
  h(appointmentController.cancelAppointment)
);

// NEW: cancel slot directly (if required)
router.post(
  '/cancel-slot',
  mw(appointmentMiddleware.validateCancelSlotBody),
  h(appointmentController.cancelSlot)
);

// NEW: reschedule appointment
router.post(
  '/:appointmentId/reschedule',
  mw(appointmentMiddleware.validateRescheduleAppointment), // safe no-op if not implemented
  h(appointmentController.rescheduleAppointment)
);

module.exports = router;
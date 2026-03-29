const express = require("express");
const doctorMiddleware = require("../middlewares/doctorMiddleware");
const patientMiddleware = require("../middlewares/patientMiddleware");
const videoController = require("../Controllers/videoController");

const router = express.Router();

router.post(
  "/appointments/:appointmentId/session/doctor",
  doctorMiddleware.authenticateDoctor,
  videoController.createOrGetDoctorSession
);

router.post(
  "/appointments/:appointmentId/session/patient",
  patientMiddleware.authenticatePatient,
  videoController.createOrGetPatientSession
);

router.get(
  "/sessions/:sessionId/doctor",
  doctorMiddleware.authenticateDoctor,
  videoController.getDoctorSession
);

router.get(
  "/sessions/:sessionId/patient",
  patientMiddleware.authenticatePatient,
  videoController.getPatientSession
);

router.post(
  "/sessions/:sessionId/join/doctor",
  doctorMiddleware.authenticateDoctor,
  videoController.joinDoctorSession
);

router.post(
  "/sessions/:sessionId/join/patient",
  patientMiddleware.authenticatePatient,
  videoController.joinPatientSession
);

router.post(
  "/sessions/:sessionId/leave/doctor",
  doctorMiddleware.authenticateDoctor,
  videoController.leaveDoctorSession
);

router.post(
  "/sessions/:sessionId/leave/patient",
  patientMiddleware.authenticatePatient,
  videoController.leavePatientSession
);

// History routes
router.get(
  "/history/doctor",
  doctorMiddleware.authenticateDoctor,
  videoController.getDoctorCallHistory
);

router.get(
  "/history/patient",
  patientMiddleware.authenticatePatient,
  videoController.getPatientCallHistory
);

module.exports = router;
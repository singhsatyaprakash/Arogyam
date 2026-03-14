const mongoose = require("mongoose");

const isYYYYMMDD = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s);
const isHHMM = (s) => typeof s === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const isValidType = (t) => ["chat", "voice", "video", "in-person"].includes(t);
const isObjectId = (v) => mongoose.isValidObjectId(String(v || ""));

const hhmmToMins = (hhmm) => {
  if (!isHHMM(hhmm)) return NaN;
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

exports.validateAvailabilityQuery = (req, res, next) => {
  const { doctorId, date, type } = req.query;

  if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });
  if (!isObjectId(doctorId)) return res.status(400).json({ success: false, message: "Invalid doctorId" });

  if (!date || !isYYYYMMDD(date)) return res.status(400).json({ success: false, message: "date is required (YYYY-MM-DD)" });
  if (type && !isValidType(type)) return res.status(400).json({ success: false, message: "Invalid type" });

  const day = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(day.getTime())) return res.status(400).json({ success: false, message: "Invalid date" });

  return next();
};

exports.validateBookSlotBody = (req, res, next) => {
  const { patientId, doctorId, date, type, startTime, endTime } = req.body || {};

  if (!patientId) return res.status(400).json({ success: false, message: "patientId is required" });
  if (!isObjectId(patientId)) return res.status(400).json({ success: false, message: "Invalid patientId" });

  if (!doctorId) return res.status(400).json({ success: false, message: "doctorId is required" });
  if (!isObjectId(doctorId)) return res.status(400).json({ success: false, message: "Invalid doctorId" });

  if (!date || !isYYYYMMDD(date)) return res.status(400).json({ success: false, message: "date is required (YYYY-MM-DD)" });
  if (!type || !isValidType(type)) return res.status(400).json({ success: false, message: "type is required (chat/voice/video/in-person)" });
  if (!startTime || !isHHMM(startTime)) return res.status(400).json({ success: false, message: "startTime is required (HH:mm)" });
  if (!endTime || !isHHMM(endTime)) return res.status(400).json({ success: false, message: "endTime is required (HH:mm)" });

  const sM = hhmmToMins(startTime);
  const eM = hhmmToMins(endTime);
  if (!(eM > sM)) return res.status(400).json({ success: false, message: "endTime must be after startTime" });

  const day = new Date(`${date}T00:00:00.000Z`);
  if (Number.isNaN(day.getTime())) return res.status(400).json({ success: false, message: "Invalid date" });

  return next();
};

// NEW: GET /appointments/patient/:patientId
exports.validatePatientAppointmentsParams = (req, res, next) => {
  const { patientId } = req.params;
  if (!patientId || !isObjectId(patientId)) return res.status(400).json({ success: false, message: "Invalid patientId" });
  return next();
};

// NEW: POST /appointments/:appointmentId/cancel
exports.validateCancelAppointment = (req, res, next) => {
  const { appointmentId } = req.params;
  const { patientId, reason } = req.body || {};
  if (!appointmentId || !isObjectId(appointmentId)) return res.status(400).json({ success: false, message: "Invalid appointmentId" });
  if (!patientId || !isObjectId(patientId)) return res.status(400).json({ success: false, message: "patientId is required" });
  if (reason && typeof reason !== "string") return res.status(400).json({ success: false, message: "reason must be a string" });
  return next();
};

// NEW: POST /appointments/confirm-payment
exports.validateConfirmPaymentBody = (req, res, next) => {
  const { patientId, doctorId, date, type, time } = req.body || {};

  if (!patientId || !isObjectId(patientId)) return res.status(400).json({ success: false, message: "Invalid patientId" });
  if (!doctorId || !isObjectId(doctorId)) return res.status(400).json({ success: false, message: "Invalid doctorId" });
  if (!date || !isYYYYMMDD(date)) return res.status(400).json({ success: false, message: "date is required (YYYY-MM-DD)" });
  if (!type || !isValidType(type)) return res.status(400).json({ success: false, message: "type is required (chat/voice/video/in-person)" });
  if (!time || !isHHMM(time)) return res.status(400).json({ success: false, message: "time is required (HH:mm)" });

  return next();
};

// NEW: POST /appointments/cancel-slot
exports.validateCancelSlotBody = (req, res, next) => {
  const { doctorId, date, time } = req.body || {};
  if (!doctorId || !isObjectId(doctorId)) return res.status(400).json({ success: false, message: "Invalid doctorId" });
  if (!date || !isYYYYMMDD(date)) return res.status(400).json({ success: false, message: "date is required (YYYY-MM-DD)" });
  if (!time || !isHHMM(time)) return res.status(400).json({ success: false, message: "time is required (HH:mm)" });
  return next();
};

// NEW: POST /appointments/confirm-payment-chat
exports.validateConfirmPaymentChatBody = (req, res, next) => {
  const { patientId, doctorId, type } = req.body || {};

  if (!patientId || !isObjectId(patientId)) return res.status(400).json({ success: false, message: "Invalid patientId" });
  if (!doctorId || !isObjectId(doctorId)) return res.status(400).json({ success: false, message: "Invalid doctorId" });
  if (type !== "chat") return res.status(400).json({ success: false, message: "type must be 'chat'" });

  return next();
};

// NEW: POST /appointments/:appointmentId/reschedule (PATIENT)
exports.validateRescheduleAppointment = (req, res, next) => {
  const { appointmentId } = req.params;
  const { patientId, date, time } = req.body || {};
  
  if (!appointmentId || !isObjectId(appointmentId)) return res.status(400).json({ success: false, message: "Invalid appointmentId" });
  if (!patientId || !isObjectId(patientId)) return res.status(400).json({ success: false, message: "patientId is required" });
  if (!date || !isYYYYMMDD(date)) return res.status(400).json({ success: false, message: "date is required (YYYY-MM-DD)" });
  if (!time || !isHHMM(time)) return res.status(400).json({ success: false, message: "time is required (HH:mm)" });
  
  return next();
};
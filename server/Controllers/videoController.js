const mongoose = require("mongoose");
const Appointment = require("../Models/appointment.model");
const VideoSession = require("../Models/VideoSession.model");

const populateSessionQuery = (query) =>
  query
    .populate({
      path: "appointment",
      select:
        "type status date startTime endTime notes paymentStatus cancelReason cancelledAt",
    })
    .populate("doctor", "name specialization profileImage email")
    .populate("patient", "name profileImage email");

const getRoomId = (appointmentId) => `video-room-${String(appointmentId)}`;

const getActorIdFromRequest = (req) => String(req.user?.id || req.user?.Id || "");

const getSessionWithAccess = async ({ sessionId, actorId, actorType }) => {
  if (!mongoose.Types.ObjectId.isValid(String(sessionId))) {
    return { error: { code: 400, message: "Invalid session id" } };
  }

  const session = await populateSessionQuery(VideoSession.findById(sessionId));
  if (!session) {
    return { error: { code: 404, message: "Video session not found" } };
  }

  const ownerId = actorType === "doctor" ? session.doctor?._id : session.patient?._id;
  if (String(ownerId || "") !== String(actorId || "")) {
    return { error: { code: 403, message: "You do not have access to this session" } };
  }

  return { session };
};

const sendError = (res, error, fallbackMessage) =>
  res.status(error?.code || 500).json({
    success: false,
    message: error?.message || fallbackMessage,
  });

//create the session if it doesn't exist, otherwise return the existing session for the appointment...
const createOrGetSession = async ({ req, res, actorType }) => {
  try {
    const { appointmentId } = req.params;
    const actorId = getActorIdFromRequest(req);

    if (!mongoose.Types.ObjectId.isValid(String(appointmentId))) {
      return res.status(400).json({ success: false, message: "Invalid appointment id" });
    }

    const appointment = await Appointment.findById(appointmentId).lean();
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    const participantId = actorType === "doctor" ? appointment.doctor : appointment.patient;
    if (String(participantId || "") !== actorId) {
      return res.status(403).json({ success: false, message: "You do not have access to this appointment" });
    }

    if (appointment.type !== "video") {
      return res.status(400).json({ success: false, message: "This appointment is not a video consultation" });
    }

    if (appointment.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Cancelled appointments cannot start a video session" });
    }

    // Use upsert so doctor/patient can safely call this at the same time
    // and still end up with one shared session for the same appointment.
    let session;
    try {
      session = await VideoSession.findOneAndUpdate(
        { appointment: appointment._id },
        {
          $setOnInsert: {
            appointment: appointment._id,
            doctor: appointment.doctor,
            patient: appointment.patient,
            roomId: getRoomId(appointment._id),
            provider: "webrtc",
            status: "scheduled",
          },
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );
    } catch (dbError) {
      // If two requests race and unique roomId conflicts, read the existing one.
      if (dbError?.code === 11000) {
        session = await VideoSession.findOne({ appointment: appointment._id });
      } else {
        throw dbError;
      }
    }

    const hydratedSession = await populateSessionQuery(VideoSession.findById(session._id));

    return res.json({
      success: true,
      message: "Video session is ready",
      data: hydratedSession,
    });
  } catch (error) {
    console.error("createOrGetSession error:", error);
    return sendError(res, null, "Failed to prepare video session");
  }
};

const getSession = async ({ req, res, actorType }) => {
  try {
    const actorId = getActorIdFromRequest(req);
    const { sessionId } = req.params;
    const { session, error } = await getSessionWithAccess({ sessionId, actorId, actorType });

    if (error) {
      return sendError(res, error, "Failed to load video session");
    }

    return res.json({ success: true, data: session });
  } catch (error) {
    console.error("getSession error:", error);
    return sendError(res, null, "Failed to load video session");
  }
};

const joinSession = async ({ req, res, actorType }) => {
  try {
    const actorId = getActorIdFromRequest(req);
    const { sessionId } = req.params;
    const lookup = await getSessionWithAccess({ sessionId, actorId, actorType });

    if (lookup.error) {
      return sendError(res, lookup.error, "Failed to join video session");
    }

    const session = await VideoSession.findById(lookup.session._id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Video session not found" });
    }

    const now = new Date();
    if (actorType === "doctor") {
      session.doctorJoinedAt = now;
    } else {
      session.patientJoinedAt = now;
    }

    const bothPresent = Boolean(session.doctorJoinedAt && session.patientJoinedAt);
    if (bothPresent) {
      session.status = "ongoing";
      if (!session.callStartedAt) {
        session.callStartedAt = now;
      }
    } else if (session.status !== "completed") {
      session.status = "scheduled";
    }

    await session.save();

    const hydratedSession = await populateSessionQuery(VideoSession.findById(session._id));
    return res.json({
      success: true,
      message: "Joined video session",
      data: hydratedSession,
    });
  } catch (error) {
    console.error("joinSession error:", error);
    return sendError(res, null, "Failed to join video session");
  }
};

const leaveSession = async ({ req, res, actorType }) => {
  try {
    const actorId = getActorIdFromRequest(req);
    const { sessionId } = req.params;
    const lookup = await getSessionWithAccess({ sessionId, actorId, actorType });

    if (lookup.error) {
      return sendError(res, lookup.error, "Failed to leave video session");
    }

    const session = await VideoSession.findById(lookup.session._id);
    if (!session) {
      return res.status(404).json({ success: false, message: "Video session not found" });
    }

    const endedAt = new Date();
    session.callEndedAt = endedAt;
    session.status = "completed";

    if (session.callStartedAt) {
      session.duration = Math.max(
        0,
        Math.round((endedAt.getTime() - session.callStartedAt.getTime()) / 1000)
      );
    }

    await session.save();
    await Appointment.updateOne(
      { _id: session.appointment, status: "booked" },
      { $set: { status: "completed" } }
    );

    const hydratedSession = await populateSessionQuery(VideoSession.findById(session._id));
    return res.json({
      success: true,
      message: `${actorType === "doctor" ? "Doctor" : "Patient"} left the video session`,
      data: hydratedSession,
    });
  } catch (error) {
    console.error("leaveSession error:", error);
    return sendError(res, null, "Failed to leave video session");
  }
};

const getDoctorCallHistory = async (req, res) => {
  try {
    const doctorId = getActorIdFromRequest(req);
    // console.log(doctorId);

    if (!mongoose.Types.ObjectId.isValid(String(doctorId))) {
      return res.status(400).json({ success: false, message: "Invalid doctor id" });
    }
    const history = await populateSessionQuery(
      VideoSession.find({ doctor: doctorId }).sort({ createdAt: -1 })
    );

    return res.json({
      success: true,
      data: history,
      total: history.length,
    });
  } catch (error) {
    console.error("getDoctorCallHistory error:", error);
    return sendError(res, null, "Failed to fetch video call history");
  }
};

const getPatientCallHistory = async (req, res) => {
  try {
    const patientId = getActorIdFromRequest(req);
    // console.log(patientId);

    if (!mongoose.Types.ObjectId.isValid(String(patientId))) {
      return res.status(400).json({ success: false, message: "Invalid patient id" });
    }

    const history = await populateSessionQuery(
      VideoSession.find({ patient: patientId }).sort({ createdAt: -1 })
    );
    console.log(history);
    return res.json({
      success: true,
      data: history,
      total: history.length,
    });
  } catch (error) {
    console.error("getPatientCallHistory error:", error);
    return sendError(res, null, "Failed to fetch video consultation history");
  }
};

exports.createOrGetDoctorSession = (req, res) =>
  createOrGetSession({ req, res, actorType: "doctor" });

exports.createOrGetPatientSession = (req, res) =>
  createOrGetSession({ req, res, actorType: "patient" });

exports.getDoctorSession = (req, res) => getSession({ req, res, actorType: "doctor" });

exports.getPatientSession = (req, res) => getSession({ req, res, actorType: "patient" });

exports.joinDoctorSession = (req, res) => joinSession({ req, res, actorType: "doctor" });

exports.joinPatientSession = (req, res) => joinSession({ req, res, actorType: "patient" });

exports.leaveDoctorSession = (req, res) => leaveSession({ req, res, actorType: "doctor" });

exports.leavePatientSession = (req, res) => leaveSession({ req, res, actorType: "patient" });

exports.getDoctorCallHistory = getDoctorCallHistory;

exports.getPatientCallHistory = getPatientCallHistory;
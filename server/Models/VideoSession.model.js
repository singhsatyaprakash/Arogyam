const mongoose = require("mongoose");

const videoSessionSchema = new mongoose.Schema(
{
    appointment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Appointment",
        required: true
    },

    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Doctor",
        required: true
    },

    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Patient",
        required: true
    },

    roomId: {
        type: String,
        required: true,
        unique: true
    },

    provider: {
        type: String,
        enum: ["agora", "twilio", "webrtc", "socket"],
        default: "webrtc"
    },

    status: {
        type: String,
        enum: ["scheduled","ongoing","completed","missed"],
        default: "scheduled"
    },

    doctorJoinedAt: Date,

    patientJoinedAt: Date,

    callStartedAt: Date,

    callEndedAt: Date,

    duration: Number, // seconds

    recordingUrl: String,

    notes: String

},
{ timestamps: true }
);

videoSessionSchema.index({ appointment: 1 });
videoSessionSchema.index({ doctor: 1, patient: 1, createdAt: -1 });

module.exports = mongoose.model("VideoSession", videoSessionSchema);
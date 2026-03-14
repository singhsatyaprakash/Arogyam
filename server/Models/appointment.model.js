const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Patient",
      required: true
    },

    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true
    },

    // consultation type: in-person | video | chat | voice
    type: {
      type: String,
      enum: ["in-person", "video", "chat", "voice"],
      required: true
    },

    // NEW: stable slot identity (avoid TZ issues in UI/cancel)
    date: { type: String, default: "" },      // YYYY-MM-DD
    startTime: { type: String, default: "" }, // HH:mm
    endTime: { type: String, default: "" },   // HH:mm

    // reference to a booked slot record:
    // - legacy: Doctor.slots._id
    // - new: DoctorDaySchedule.slots._id (booked-only storage)
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },

    // fee charged at booking time (copied from doctor.consultationFee[type])
    fee: {
      type: Number,
      default: 0
    },

    // status of appointment lifecycle
    status: {
      type: String,
      enum: ["booked", "cancelled", "completed"],
      default: "booked"
    },

    // NEW: cancellation metadata (optional but useful)
    cancelledAt: { type: Date, default: null },
    cancelReason: { type: String, default: "" },

    // optional notes from patient or admin
    notes: {
      type: String,
      default: ""
    },

    // payment state
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "waived"],
      default: "pending"
    }
  },
  { timestamps: true }
);

// NEW: indexes for faster listing
appointmentSchema.index({ patient: 1, date: -1, startTime: -1 });
appointmentSchema.index({ doctor: 1, date: -1, startTime: -1 });
appointmentSchema.index({ doctor: 1, status: 1, date: 1, startTime: 1 });
appointmentSchema.index({ doctor: 1, date: 1, startTime: 1, status: 1 }); // NEW

// instance method: return safe public appointment object
appointmentSchema.methods.getPublicDetails = function () {
  const obj = this.toObject({ getters: true, virtuals: false });
  // keep useful fields only
  delete obj.__v;
  return obj;
};

// static: find appointments by patient id
appointmentSchema.statics.findByPatient = function (patientId) {
  if (!patientId) return Promise.resolve([]);
  return this.find({ patient: patientId }).sort({ date: -1, startTime: -1 });
};

// static: find upcoming appointments for a doctor
appointmentSchema.statics.findUpcomingByDoctor = function (doctorId) {
  if (!doctorId) return Promise.resolve([]);
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const mm = String(now.getUTCMinutes()).padStart(2, "0");
  const nowDate = `${y}-${m}-${d}`;
  const nowTime = `${hh}:${mm}`;

  return this.find({
    doctor: doctorId,
    status: "booked",
    $or: [
      { date: { $gt: nowDate } },
      { date: nowDate, startTime: { $gte: nowTime } }
    ]
  }).sort({ date: 1, startTime: 1 });
};

// NEW: static find appointments by doctor id
appointmentSchema.statics.findByDoctor = function (doctorId) {
  if (!doctorId) return Promise.resolve([]);
  return this.find({ doctor: doctorId }).sort({ date: -1, startTime: -1 });
};

// NEW: cleaner JSON serialization for API responses
appointmentSchema.set("toJSON", {
  virtuals: false,
  versionKey: false,
  transform: (_doc, ret) => {
    delete ret.__v;
    return ret;
  }
});

module.exports = mongoose.model("Appointment", appointmentSchema);

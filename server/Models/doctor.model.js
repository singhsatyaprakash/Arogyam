const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    specialization: {
      type: String,
      required: true
    },
    experience: {
      type: Number, 
      required: true
    },
    qualifications: { type: [String], default: [] },
    languages: { type: [String], default: [] },

    consultationFee: {
      chat: { type: Number, default: 0 },
      voice: { type: Number, default: 0 },
      video: { type: Number, default: 0 }
    },

    contactRevealFee: { // new - fee to reveal contact details
      type: Number,
      default: 50
    },

    isOnline: {
      type: Boolean,
      default: false
    },
    availability: {
      from: { type: String, default: "" },
      to: { type: String, default: "" }
    },

    // NEW: used when generating booking-history slots on-demand
    slotDurationMinutes: {
      type: Number,
      default: 15,
      min: 5,
      max: 180
    },

    // slots for appointment booking
    slots: [
      {
        date: { type: Date, required: true },
        time: { type: String, required: true },
        type: { type: String, enum: ['chat', 'video', 'voice', 'in-person'], required: true },
        isBooked: { type: Boolean, default: false }
      }
    ],

    // Verification
    isVerified: {
      type: Boolean,
      default: false
    },

    verificationDocs: {
      medicalLicense: String,
      governmentId: String
    },
    rating: {
      type: Number,
      default: 0
    },
    totalReviews: {
      type: Number,
      default: 0
    },

    // Profile
    profileImage: {
      type: String,
      default: "",
      trim: true
    },
    bio: {
      type: String,
      default: "",
      trim: true
    },

    // Security & Role
    role: {
      type: String,
      default: "doctor"
    },

    // Account Status
    isBlocked: {
      type: Boolean,
      default: false
    },
    token:{
        type: String,
    },
    lastLogin: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Add instance method to return safe public profile
doctorSchema.methods.getPublicProfile = function() {
  const obj = this.toObject({ getters: true, virtuals: false });
  delete obj.password;
  delete obj.__v;
  delete obj.token;
  return obj;
};

// Add static helper to find by email (case-insensitive)
doctorSchema.statics.findByEmail = function(email) {
  if (!email) return null;
  return this.findOne({ email: email.toLowerCase() });
};

// NEW: resolve fee by consultation type (used by booking-history generation)
doctorSchema.methods.getConsultationFeeForType = function(type) {
  const feeMap = (this.consultationFee || {});
  if (!type) return 0;
  return Number(feeMap[type]) || 0;
};

// NEW: generate "HH:MM" slots for a day using availability + slotDurationMinutes
doctorSchema.methods.generateDailySlotTimes = function() {
  const fromStr = this?.availability?.from || "";
  const toStr = this?.availability?.to || "";
  const duration = Number(this?.slotDurationMinutes) || 15;

  // Expect "HH:MM" (24h). Return [] if not configured.
  const parseHM = (s) => {
    const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(String(s).trim());
    if (!m) return null;
    return { h: Number(m[1]), min: Number(m[2]) };
  };

  const from = parseHM(fromStr);
  const to = parseHM(toStr);
  if (!from || !to) return [];

  const start = from.h * 60 + from.min;
  const end = to.h * 60 + to.min;
  if (end <= start) return [];

  const pad2 = (n) => String(n).padStart(2, "0");
  const times = [];
  for (let t = start; t + duration <= end; t += duration) {
    const hh = Math.floor(t / 60);
    const mm = t % 60;
    times.push(`${pad2(hh)}:${pad2(mm)}`);
  }
  return times;
};

module.exports = mongoose.model("Doctor", doctorSchema);

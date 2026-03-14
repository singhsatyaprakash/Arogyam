const mongoose = require("mongoose");

const SLOT_TYPES = ["chat", "video", "voice", "in-person"];

const freeSlotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // "HH:MM"

    // NOTE: base slots are stored as just {time} in your controller.
    // Make type optional to support that shape.
    type: { type: String, enum: SLOT_TYPES, required: false, default: undefined },

    fee: { type: Number, default: 0 }
  },
  { _id: false }
);

// we want slot id to be stored in appointment model to track which slot is booked
const bookedSlotSchema = new mongoose.Schema(
  {
    time: { type: String, required: true }, // "HH:MM"
    type: { type: String, enum: SLOT_TYPES, required: true },
    fee: { type: Number, default: 0 },

    // Link to Appointment._id (your controllers treat this as the booking identity)
    bookingRef: { type: mongoose.Schema.Types.ObjectId, required: false },

    // Track who booked (so doctor-side ops can audit/debug)
    patient: { type: mongoose.Schema.Types.ObjectId, ref: "Patient", required: false },

    bookedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const bookingHistoryDoctorSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
      index: true
    },

    // date for which the booking history is stored (YYYY-MM-DD)
    date: {
      type: String,
      required: true,
      trim: true
    },

    // snapshot metadata (so changes to doctor availability later don't rewrite history meaning)
    slotDurationMinutes: { 
		type: Number, 
		default: 15 
	},

    // generated from doctor's availability (minus booked slots)
    freeSlots: { 
		type: [freeSlotSchema], 
		default: [] 
	},

    // stores booked slots only
    bookedSlots: { 
		type: [bookedSlotSchema], 
		default: [] 
	}
  },
  { timestamps: true }
);

// Ensure ONE document per doctor per date
bookingHistoryDoctorSchema.index({ doctor: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("BookingHistoryDoctor", bookingHistoryDoctorSchema);
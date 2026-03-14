const mongoose = require("mongoose");

const chatConnectionSchema = new mongoose.Schema(
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
    fee: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ["active", "closed", "expired"],
      default: "active"
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "refunded"],
      default: "pending"
    },
    // Chat validity period
    startedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      required: true
      // Set to 10 days from now on creation
    },
    // Chat messages count (optional tracking)
    messageCount: {
      type: Number,
      default: 0
    },
    // Last activity
    lastActivityAt: {
      type: Date,
      default: Date.now
    },
    // Close reason if manually closed
    closeReason: {
      type: String,
      default: ""
    },
    closedAt: {
      type: Date,
      default: null
    }
  },
  { timestamps: true }
);

// Indexes for faster queries
chatConnectionSchema.index({ patient: 1, doctor: 1 });
chatConnectionSchema.index({ patient: 1, status: 1 });
chatConnectionSchema.index({ doctor: 1, status: 1 });
chatConnectionSchema.index({ expiresAt: 1 }); // For cleanup job

// Instance method: check if chat is still valid
chatConnectionSchema.methods.isActive = function() {
  return this.status === "active" && new Date() < new Date(this.expiresAt);
};

// Instance method: get public details
chatConnectionSchema.methods.getPublicDetails = function() {
  const obj = this.toObject({ getters: true, virtuals: false });
  delete obj.__v;
  return obj;
};

// Static: find active chat between patient and doctor
chatConnectionSchema.statics.findActiveChat = function(patientId, doctorId) {
  return this.findOne({
    patient: patientId,
    doctor: doctorId,
    status: "active",
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model("ChatConnection", chatConnectionSchema);

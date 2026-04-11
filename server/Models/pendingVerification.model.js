const mongoose = require('mongoose');

const pendingVerificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    role: {
      type: String,
      enum: ['patient', 'doctor'],
      required: true,
      index: true
    },
    purpose: {
      type: String,
      enum: ['registration', 'password_reset'],
      required: true,
      default: 'registration',
      index: true
    },
    otpHash: {
      type: String,
      required: true
    },
    otpExpiresAt: {
      type: Date,
      required: true
    },
    resendAvailableAt: {
      type: Date,
      required: true
    },
    failedAttempts: {
      type: Number,
      default: 0
    },
    payload: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    }
  },
  { timestamps: true }
);

pendingVerificationSchema.index({ email: 1, role: 1, purpose: 1 }, { unique: true });
pendingVerificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 });

module.exports = mongoose.model('PendingVerification', pendingVerificationSchema);

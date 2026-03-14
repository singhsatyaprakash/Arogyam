const mongoose = require("mongoose");

const patientSchema = new mongoose.Schema(
  {
    // Basic Info (Required)
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    password: {
      type: String,
      required: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },

    // Optional Medical Info (Can be filled later)
    bloodGroup: {
      type: String,
    },

    height: {
      type: Number, // in cm
    },

    weight: {
      type: Number, // in kg
    },

    allergies: [
      {
        type: String,
      },
    ],

    existingConditions: [
      {
        type: String,
      },
    ],

    // Emergency Contact
    emergencyContact: {
      name: String,
      phone: String,
      relation: String,
    },

    // Profile
    profileImage: {
      type: String,
      default: "",
    },

    // Account & Security
    role: {
      type: String,
      default: "patient",
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    token: {
      type: String,
    },
    lastLogin: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Patient", patientSchema);

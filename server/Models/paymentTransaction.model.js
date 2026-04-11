const mongoose = require('mongoose');

const paymentTransactionSchema = new mongoose.Schema(
  {
    bookingType: {
      type: String,
      enum: ['appointment', 'chat'],
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true
    },
    appointment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Appointment',
      default: null
    },
    chatConnection: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatConnection',
      default: null
    },
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'INR'
    },
    status: {
      type: String,
      enum: ['created', 'paid', 'failed'],
      default: 'created',
      index: true
    },
    razorpayOrderId: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    razorpayPaymentId: {
      type: String,
      default: ''
    },
    razorpaySignature: {
      type: String,
      default: ''
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('PaymentTransaction', paymentTransactionSchema);

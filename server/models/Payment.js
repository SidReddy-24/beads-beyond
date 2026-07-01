const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
  },
  paymentId: {
    type: String, // Razorpay payment ID
    required: true,
    unique: true,
  },
  signature: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['Captured', 'Failed', 'Refunded'],
    default: 'Captured',
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

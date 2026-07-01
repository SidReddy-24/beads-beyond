const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: [true, 'Coupon code is required'],
    unique: true,
    uppercase: true,
    trim: true,
  },
  discountType: {
    type: String,
    enum: ['Percentage', 'Flat'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
    min: [0, 'Discount value must be positive'],
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    required: true,
    min: [1, 'Usage limit must be at least 1'],
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Coupon', couponSchema);

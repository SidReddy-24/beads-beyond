const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  sku: {
    type: String,
    required: [true, 'SKU is required'],
    unique: true,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
  },
  discount: {
    type: Number,
    default: 0, // In percentage e.g. 10 for 10%
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required'],
  },
  images: [{
    type: String, // Path on server e.g. /uploads/products/ring1.jpg
  }],
  tags: [{
    type: String,
  }],
  status: {
    type: String,
    enum: ['Draft', 'Published', 'Archived'],
    default: 'Published',
  },
  deleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  }
}, {
  timestamps: true
});

// Query middleware to filter out soft deleted products by default
productSchema.pre(/^find/, function(next) {
  // If the query does not explicitly set filter on deleted, filter out deleted products
  if (this.getFilter().deleted === undefined) {
    this.where({ deleted: false });
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);

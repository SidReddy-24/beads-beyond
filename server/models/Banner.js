const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  subtitle: {
    type: String,
    trim: true,
  },
  image: {
    type: String, // Server path e.g. /uploads/banners/hero.jpg
    required: true,
  },
  link: {
    type: String, // Destination link (e.g. /shop?category=earrings)
    default: '/shop',
  },
  active: {
    type: Boolean,
    default: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Banner', bannerSchema);

const Banner = require('../models/Banner');
const fs = require('fs');
const path = require('path');

exports.getBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find({ active: true });
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

exports.getAllBanners = async (req, res, next) => {
  try {
    const banners = await Banner.find();
    res.status(200).json({ success: true, data: banners });
  } catch (error) {
    next(error);
  }
};

exports.createBanner = async (req, res, next) => {
  try {
    const { title, subtitle, link } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a banner image' });
    }

    const image = `/uploads/banners/${req.file.filename}`;

    const banner = await Banner.create({ title, subtitle, image, link });
    res.status(201).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

exports.updateBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, subtitle, link, active } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    if (title) banner.title = title;
    if (subtitle !== undefined) banner.subtitle = subtitle;
    if (link) banner.link = link;
    if (active !== undefined) banner.active = active;

    if (req.file) {
      // Remove old image
      const oldPath = path.join(__dirname, '..', banner.image);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      banner.image = `/uploads/banners/${req.file.filename}`;
    }

    await banner.save();
    res.status(200).json({ success: true, data: banner });
  } catch (error) {
    next(error);
  }
};

exports.deleteBanner = async (req, res, next) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }

    // Delete image from disk
    const imagePath = path.join(__dirname, '..', banner.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await Banner.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: 'Banner deleted successfully' });
  } catch (error) {
    next(error);
  }
};

const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

exports.createProduct = async (req, res, next) => {
  try {
    const { name, sku, description, price, discount, stock, category, tags, status } = req.body;

    const images = req.files ? req.files.map(file => `/uploads/products/${file.filename}`) : [];

    const product = await Product.create({
      name, sku, description, price, discount, stock, category, images, tags: tags ? JSON.parse(tags) : [], status
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    let product = await Product.findOne({ _id: id, deleted: false });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const { name, sku, description, price, discount, stock, category, tags, status, existingImages } = req.body;

    let images = existingImages ? JSON.parse(existingImages) : product.images;

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      images = [...images, ...newImages];
    }

    product.name = name || product.name;
    product.sku = sku || product.sku;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.stock = stock !== undefined ? stock : product.stock;
    product.category = category || product.category;
    product.tags = tags ? JSON.parse(tags) : product.tags;
    product.status = status || product.status;
    product.images = images;

    await product.save();
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.softDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    product.deleted = true;
    product.deletedAt = new Date();
    await product.save();

    res.status(200).json({ success: true, message: 'Product moved to trash' });
  } catch (error) {
    next(error);
  }
};

exports.restoreProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    // Need to explicitly search with deleted true because pre-find middleware filters them out
    const product = await Product.findOne({ _id: id, deleted: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in trash' });
    }

    product.deleted = false;
    product.deletedAt = null;
    await product.save();

    res.status(200).json({ success: true, message: 'Product restored successfully' });
  } catch (error) {
    next(error);
  }
};

exports.permanentDeleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, deleted: true });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found in trash' });
    }

    // Delete associated images from disk
    product.images.forEach(img => {
      const fullPath = path.join(__dirname, '..', img);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    });

    await Product.deleteOne({ _id: id });
    res.status(200).json({ success: true, message: 'Product deleted permanently' });
  } catch (error) {
    next(error);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const { search, category, minPrice, maxPrice, discount, sort, page = 1, limit = 12, status } = req.query;

    const query = { deleted: false };

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (category) {
      // Support both ObjectId and category slug
      if (mongoose.Types.ObjectId.isValid(category)) {
        query.category = category;
      } else {
        // Treat as slug and look up the category
        const catDoc = await Category.findOne({ slug: category.toLowerCase() });
        if (catDoc) {
          query.category = catDoc._id;
        } else {
          // No matching category — return empty results
          return res.status(200).json({ success: true, count: 0, total: 0, pages: 0, currentPage: 1, data: [] });
        }
      }
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (discount) {
      query.discount = { $gte: Number(discount) };
    }

    if (status) {
      if (status !== 'all') {
        query.status = status;
      }
    } else {
      // Users should only see published products
      query.status = 'Published';
    }

    let sortOptions = {};
    if (sort === 'Latest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'priceAsc') {
      sortOptions = { price: 1 };
    } else if (sort === 'priceDesc') {
      sortOptions = { price: -1 };
    } else if (sort === 'bestSelling') {
      // Mock best selling with stock or sold count. Let's just sort by popularity/ratings/createdAt
      sortOptions = { createdAt: -1 };
    } else {
      sortOptions = { createdAt: -1 };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .populate('category', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: products
    });
  } catch (error) {
    next(error);
  }
};

exports.getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const product = await Product.findOne({ _id: id, deleted: false }).populate('category', 'name slug');

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

exports.getTrashProducts = async (req, res, next) => {
  try {
    // Explicitly querying deleted: true bypasses the prefind query hook
    const products = await Product.find({ deleted: true }).populate('category', 'name');
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    next(error);
  }
};

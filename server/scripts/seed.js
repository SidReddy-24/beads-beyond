const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Banner = require('../models/Banner');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/aura-jewelry');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany();
    await Category.deleteMany();
    await Product.deleteMany();
    await Coupon.deleteMany();
    await Banner.deleteMany();

    console.log('Cleared existing data.');

    // 1. Seed Admin & Regular User
    const adminUser = await User.create({
      name: 'B&B Admin',
      email: 'admin@beadsandbeyond.com',
      password: 'adminpassword123',
      role: 'admin'
    });

    const regularUser = await User.create({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'userpassword123',
      role: 'user',
      addresses: [{
        name: 'Jane Doe',
        phone: '9876543210',
        address: '123, Ivory Towers, Champagne Hills',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        isDefault: true
      }]
    });

    console.log('Seeded users (Admin: admin@beadsandbeyond.com / adminpassword123)');

    // 2. Seed Categories
    const categories = [
      { name: 'Earrings', slug: 'earrings', description: 'Delicate gold and diamond earrings.', image: '/uploads/products/earrings_cat.jpg' },
      { name: 'Rings', slug: 'rings', description: 'Premium engagement and fashion rings.', image: '/uploads/products/rings_cat.jpg' },
      { name: 'Bracelets', slug: 'bracelets', description: 'Elegant luxury hand-crafted wristwear.', image: '/uploads/products/bracelets_cat.jpg' },
      { name: 'Necklaces', slug: 'necklaces', description: 'Stunning neckpieces and diamond chokers.', image: '/uploads/products/necklaces_cat.jpg' },
      { name: 'Anklets', slug: 'anklets', description: 'Graceful anklets for modern styling.', image: '/uploads/products/anklets_cat.jpg' }
    ];

    const seededCategories = await Category.insertMany(categories);
    console.log('Seeded categories.');

    const catIdMap = {};
    seededCategories.forEach(c => {
      catIdMap[c.slug] = c._id;
    });

    // 3. Seed Products
    const products = [
      {
        name: 'Classic Rose Gold Engagement Ring',
        sku: 'RG-ENG-001',
        description: 'Exquisite 18k Rose Gold solitaire diamond engagement ring, designed to sparkle with timeless elegance.',
        price: 49999,
        discount: 10,
        stock: 15,
        category: catIdMap['rings'],
        images: ['/uploads/products/ring1.jpg'],
        tags: ['Rose Gold', 'Solitaire', 'Ring', 'Engagement'],
        status: 'Published'
      },
      {
        name: 'Champagne Gold Diamond Earrings',
        sku: 'CG-EAR-002',
        description: 'Sophisticated hoop earrings in solid Champagne Gold encrusted with premium brilliant-cut diamonds.',
        price: 34999,
        discount: 5,
        stock: 8,
        category: catIdMap['earrings'],
        images: ['/uploads/products/earrings1.jpg'],
        tags: ['Champagne Gold', 'Diamond', 'Hoop', 'Earrings'],
        status: 'Published'
      },
      {
        name: 'Delicate Infinite Gold Bracelet',
        sku: 'YG-BRC-003',
        description: 'Minimalist 14k Gold chain bracelet featuring a micro-pave infinity symbol for everyday premium aesthetics.',
        price: 19999,
        discount: 15,
        stock: 25,
        category: catIdMap['bracelets'],
        images: ['/uploads/products/bracelet1.jpg'],
        tags: ['Yellow Gold', 'Infinity', 'Bracelet', 'Minimalist'],
        status: 'Published'
      },
      {
        name: 'Swarovski Crystal Pendant Necklace',
        sku: 'SV-NCK-004',
        description: 'Luxury rhodium-plated sterling silver necklace with a large royal blue Swarovski crystal pendant.',
        price: 25999,
        discount: 0,
        stock: 12,
        category: catIdMap['necklaces'],
        images: ['/uploads/products/necklace1.jpg'],
        tags: ['Swarovski', 'Crystal', 'Silver', 'Pendant', 'Necklace'],
        status: 'Published'
      },
      {
        name: 'Dainty Silver Starry Anklet',
        sku: 'SV-ANK-005',
        description: 'A premium 925 sterling silver anklet decorated with tiny hanging stars and adjustable lobster clasp.',
        price: 4999,
        discount: 20,
        stock: 30,
        category: catIdMap['anklets'],
        images: ['/uploads/products/anklet1.jpg'],
        tags: ['Silver', 'Star', 'Anklet', 'Dainty'],
        status: 'Published'
      },
      {
        name: 'Royal Emerald Gold Ring',
        sku: 'YG-RNG-006',
        description: 'Stunning 18k Champagne Gold ring hosting a magnificent emerald green gemstone surrounded by diamond halo.',
        price: 79999,
        discount: 12,
        stock: 5,
        category: catIdMap['rings'],
        images: ['/uploads/products/ring2.jpg'],
        tags: ['Gold', 'Emerald', 'Halo', 'Ring'],
        status: 'Published'
      }
    ];

    await Product.insertMany(products);
    console.log('Seeded products.');

    // 4. Seed Coupons
    const coupons = [
      {
        code: 'BEADS10',
        discountType: 'Percentage',
        discountValue: 10,
        expiryDate: new Date('2030-12-31'),
        usageLimit: 500,
        active: true
      },
      {
        code: 'GOLD2000',
        discountType: 'Flat',
        discountValue: 2000,
        expiryDate: new Date('2030-12-31'),
        usageLimit: 200,
        active: true
      }
    ];

    await Coupon.insertMany(coupons);
    console.log('Seeded coupons.');

    // 5. Seed Banner
    const banners = [
      {
        title: 'Timeless Luxury Collections',
        subtitle: 'Crafted in 18K Champagne Gold & Brilliant Diamonds',
        image: '/uploads/banners/banner1.jpg',
        link: '/shop',
        active: true
      }
    ];

    await Banner.insertMany(banners);
    console.log('Seeded banners.');

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();

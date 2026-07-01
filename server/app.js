const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route files
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const couponRoutes = require('./routes/couponRoutes');
const orderRoutes = require('./routes/orderRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const wishlistRoutes = require('./routes/wishlistRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const mongoSanitize = require('express-mongo-sanitize');

// Connect to database
connectDB();

const app = express();

// CORS Allowed Origins list
const allowedOrigins = [
  'http://localhost:3000',
  'https://beadsandbeyond.com',
  'https://beads-beyond.vercel.app', // Future frontend deployment link
];

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5000, // Increased for dev
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use('/api/', limiter);

// Body parser
app.use(express.json({ limit: '10kb' })); // Body limit to guard against DOS entity size attacks
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// NoSQL Query Injection sanitization
app.use(mongoSanitize());

// Basic XSS Protection middleware (HTML stripping for body parameters)
app.use((req, res, next) => {
  if (req.body) {
    const sanitizeHTML = (val) => {
      if (typeof val === 'string') {
        return val.replace(/<[^>]*>/g, ''); // strip HTML tags
      }
      if (typeof val === 'object' && val !== null) {
        for (const key in val) {
          val[key] = sanitizeHTML(val[key]);
        }
      }
      return val;
    };
    req.body = sanitizeHTML(req.body);
  }
  next();
});

// Static uploads folder access
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/coupons', couponRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/wishlists', wishlistRoutes);
app.use('/api/v1/banners', bannerRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/payments', paymentRoutes);

// Base route
app.get('/', (req, res) => {
  res.send('Beads & Beyond API is running...');
});

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

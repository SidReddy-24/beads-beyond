const express = require('express');
const router = express.Router();
const { getAnalytics, getCustomers } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/auth');

router.get('/analytics', protect, admin, getAnalytics);
router.get('/customers', protect, admin, getCustomers);

module.exports = router;

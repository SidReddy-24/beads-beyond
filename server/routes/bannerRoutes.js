const express = require('express');
const router = express.Router();
const { getBanners, getAllBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/bannerController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getBanners);
router.get('/all', protect, admin, getAllBanners);

router.post('/', protect, admin, upload.single('image'), createBanner);
router.put('/:id', protect, admin, upload.single('image'), updateBanner);
router.delete('/:id', protect, admin, deleteBanner);

module.exports = router;

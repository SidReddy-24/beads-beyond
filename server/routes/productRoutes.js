const express = require('express');
const router = express.Router();
const {
  createProduct,
  updateProduct,
  softDeleteProduct,
  restoreProduct,
  permanentDeleteProduct,
  getProducts,
  getProductById,
  getTrashProducts
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', getProducts);
router.get('/trash', protect, admin, getTrashProducts);
router.get('/:id', getProductById);

router.post('/', protect, admin, upload.array('images', 5), createProduct);
router.put('/:id', protect, admin, upload.array('images', 5), updateProduct);
router.delete('/:id', protect, admin, softDeleteProduct);
router.put('/:id/restore', protect, admin, restoreProduct);
router.delete('/:id/permanent', protect, admin, permanentDeleteProduct);

module.exports = router;

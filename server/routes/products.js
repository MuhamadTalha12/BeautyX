import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductReview
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = express.Router();

// validation error handling helper
const validateFields = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map(err => err.msg).join(', ')
    });
  }
  next();
};

const validateProduct = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('slug').trim().notEmpty().withMessage('Product slug is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
  body('category').isIn(['bras', 'panties', 'sets', 'shapewear', 'sleepwear']).withMessage('Invalid product category'),
  body('colors').isArray().withMessage('Colors must be an array of strings'),
  body('sizes').isArray().withMessage('Sizes must be an array of strings'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('fabric').trim().notEmpty().withMessage('Fabric blend details are required'),
  body('images').isArray({ min: 1 }).withMessage('At least one image is required'),
  body('images.*.url').isURL().withMessage('Invalid image URL'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  validateFields
];

const validateReview = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be an integer between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Review comment is required'),
  validateFields
];

router.route('/')
  .get(getProducts)
  .post(protect, adminOnly, validateProduct, createProduct);

router.route('/:slug')
  .get(getProductBySlug);

router.route('/:id')
  .put(protect, adminOnly, validateProduct, updateProduct)
  .delete(protect, adminOnly, deleteProduct);

router.route('/:id/reviews')
  .post(protect, validateReview, createProductReview);

export default router;

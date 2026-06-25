import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  addOrderItems,
  getOrders,
  createPaymentIntent,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  trackOrder
} from '../controllers/orderController.js';
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

const validateOrder = [
  body('items').isArray({ min: 1 }).withMessage('At least one order item is required'),
  body('items.*.product').isMongoId().withMessage('Invalid product ID in items'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('items.*.price').isNumeric().withMessage('Price must be a number'),
  body('shippingAddress').isObject().withMessage('Shipping address must be an object'),
  body('shippingAddress.name').trim().notEmpty().withMessage('Recipient name is required'),
  body('shippingAddress.street').trim().notEmpty().withMessage('Street address is required'),
  body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
  body('shippingAddress.province').trim().notEmpty().withMessage('Province is required'),
  body('shippingAddress.phone').trim().notEmpty().withMessage('Phone number is required'),
  body('paymentMethod').isIn(['cod', 'card']).withMessage('Payment method must be cod or card'),
  body('total').isNumeric().withMessage('Total amount must be a number'),
  validateFields
];

router.route('/')
  .post(protect, validateOrder, addOrderItems)
  .get(protect, adminOnly, getOrders);

router.route('/checkout-session')
  .post(protect, createPaymentIntent);

router.route('/my-orders')
  .get(protect, getMyOrders);

router.route('/track')
  .post(trackOrder);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, adminOnly, updateOrderStatus);

export default router;

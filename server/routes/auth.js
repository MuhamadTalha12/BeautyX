import express from 'express';
import { body, validationResult } from 'express-validator';
import {
  registerUser,
  loginUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  googleAuth,
  getProfile,
  updateProfile,
  addAddress,
  updateAddress,
  deleteAddress,
  getCart,
  syncCart,
  getWishlist,
  syncWishlist,
  refreshSession,
  logoutUser,
  getAllUsers,
  updateUserStatus,
  deleteUser
} from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';
import { authLimiter } from '../middleware/security.js';

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

const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateFields
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
  validateFields
];

const validateForgotPassword = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  validateFields
];

const validateResetPassword = [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  validateFields
];

const validateAddress = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('street').trim().notEmpty().withMessage('Street address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('province').trim().notEmpty().withMessage('Province is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  validateFields
];

router.post('/register', authLimiter, validateRegister, registerUser);
router.post('/login', authLimiter, validateLogin, loginUser);
router.post('/refresh', refreshSession);
router.post('/logout', logoutUser);

router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password/:token', authLimiter, validateResetPassword, resetPassword);
router.post('/google', googleAuth);

// Protected routes
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

router.route('/addresses')
  .post(protect, validateAddress, addAddress);

router.route('/addresses/:id')
  .put(protect, validateAddress, updateAddress)
  .delete(protect, deleteAddress);

router.route('/cart')
  .get(protect, getCart)
  .post(protect, syncCart);

router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, syncWishlist);

// Admin User Management routes
router.route('/users')
  .get(protect, adminOnly, getAllUsers);

router.route('/users/:id')
  .delete(protect, adminOnly, deleteUser);

router.route('/users/:id/status')
  .put(protect, adminOnly, updateUserStatus);

export default router;

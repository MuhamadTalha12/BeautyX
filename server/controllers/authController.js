import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { sendEmail } from '../utils/sendEmail.js';

const getAccessSecret = () => process.env.JWT_SECRET || 'beautyx_access_secret_2026';
const getRefreshSecret = () => (process.env.JWT_SECRET ? process.env.JWT_SECRET + '_refresh' : 'beautyx_refresh_secret_2026');

const generateAccessToken = (id) => {
  return jwt.sign({ id }, getAccessSecret(), { expiresIn: '15m' });
};

const generateRefreshToken = (id) => {
  return jwt.sign({ id }, getRefreshSecret(), { expiresIn: '7d' });
};

const sendRefreshToken = (res, token) => {
  res.cookie('beautyx_refresh', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });
};

const clearRefreshTokenCookie = (res) => {
  res.clearCookie('beautyx_refresh', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      res.status(400);
      throw new Error('User already exists');
    }

    // Create verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      verificationToken
    });

    if (user) {
      // Send verification email via Resend
      const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${verificationToken}`;
      const emailHtml = `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
          <h2 style="font-family: serif; color: #1a1a1a; text-align: center; letter-spacing: 2px;">BEAUTYX INTIMATES</h2>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p>Hi ${user.name},</p>
          <p>Thank you for creating an account with BeautyX Intimates. Please verify your email address to unlock all premium member benefits.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #1a1a1a; color: #fff; padding: 12px 30px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px;">Verify Email Address</a>
          </div>
          <p style="color: #666; font-size: 12px;">If the button above does not work, copy and paste this link in your browser:</p>
          <p style="color: #666; font-size: 12px;">${verifyUrl}</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 11px; color: #999; text-align: center;">© 2026 BeautyX Intimates. All Rights Reserved.</p>
        </div>
      `;

      await sendEmail({
        to: user.email,
        subject: 'Verify Your BeautyX Account',
        html: emailHtml
      });

      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshTokens.push(refreshToken);
      await user.save();
      sendRefreshToken(res, refreshToken);

      res.status(201).json({
        success: true,
        token: accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          phone: user.phone,
          addresses: user.addresses
        }
      });
    } else {
      res.status(400);
      throw new Error('Invalid user data');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email }).select('+password');

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'suspended') {
        res.status(403);
        throw new Error('Your account has been suspended by the administrator.');
      }
      const accessToken = generateAccessToken(user._id);
      const refreshToken = generateRefreshToken(user._id);
      user.refreshTokens.push(refreshToken);
      await user.save();
      sendRefreshToken(res, refreshToken);

      res.json({
        success: true,
        token: accessToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
          phone: user.phone,
          addresses: user.addresses
        }
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Email Address
// @route   GET /api/auth/verify-email/:token
// @access  Public
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired verification token');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully! You can now log in.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404);
      throw new Error('User not found with this email');
    }

    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash and set resetToken fields
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    
    // Set expire (1 hour)
    user.resetPasswordExpire = Date.now() + 60 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="font-family: serif; color: #1a1a1a; text-align: center; letter-spacing: 2px;">BEAUTYX INTIMATES</h2>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p>Hi ${user.name},</p>
        <p>We received a request to reset the password for your BeautyX Intimates account. Click the button below to choose a new password. This link is valid for 1 hour.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #1a1a1a; color: #fff; padding: 12px 30px; text-decoration: none; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; border-radius: 2px;">Reset Password</a>
        </div>
        <p style="color: #666; font-size: 12px;">If you did not request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">© 2026 BeautyX Intimates. All Rights Reserved.</p>
      </div>
    `;

    await sendEmail({
      to: user.email,
      subject: 'BeautyX Password Reset Request',
      html: emailHtml
    });

    res.json({
      success: true,
      message: 'Reset password link sent successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      throw new Error('Invalid or expired reset token');
    }

    // Set new password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Google Authentication (OAuth / Token Verification)
// @route   POST /api/auth/google
// @access  Public
export const googleAuth = async (req, res, next) => {
  try {
    const { email, name, googleId, avatar } = req.body;

    if (!email) {
      res.status(400);
      throw new Error('Email is required from Google Auth');
    }

    // Try to find user by email
    let user = await User.findOne({ email });

    if (user) {
      // Connect Google ID if not present
      if (!user.googleId) {
        user.googleId = googleId;
        user.isVerified = true; // Google accounts are verified
        await user.save();
      }
    } else {
      // Create user
      user = await User.create({
        name,
        email,
        googleId,
        avatar: avatar || '',
        isVerified: true,
        // Set a random password for users who sign up via Google
        password: crypto.randomBytes(16).toString('hex')
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    user.refreshTokens.push(refreshToken);
    await user.save();
    sendRefreshToken(res, refreshToken);

    res.json({
      success: true,
      token: accessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user profile
// @route   GET /api/auth/profile
// @access  Private
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        success: true,
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
          isVerified: updatedUser.isVerified,
          phone: updatedUser.phone,
          addresses: updatedUser.addresses
        }
      });
    } else {
      res.status(404);
      throw new Error('User not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Add shipping address
// @route   POST /api/auth/addresses
// @access  Private
export const addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { name, street, city, province, phone, isDefault } = req.body;

    // If default, unset previous default addresses
    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    user.addresses.push({
      name,
      street,
      city,
      province,
      phone,
      isDefault: isDefault || user.addresses.length === 0
    });

    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update shipping address
// @route   PUT /api/auth/addresses/:id
// @access  Private
export const updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const addressId = req.params.id;
    const address = user.addresses.id(addressId);

    if (!address) {
      res.status(404);
      throw new Error('Address not found');
    }

    const { name, street, city, province, phone, isDefault } = req.body;

    if (isDefault) {
      user.addresses.forEach(addr => {
        addr.isDefault = false;
      });
    }

    address.name = name || address.name;
    address.street = street || address.street;
    address.city = city || address.city;
    address.province = province || address.province;
    address.phone = phone || address.phone;
    address.isDefault = isDefault !== undefined ? isDefault : address.isDefault;

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete shipping address
// @route   DELETE /api/auth/addresses/:id
// @access  Private
export const deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const addressId = req.params.id;
    
    // Filter out the address
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== addressId);

    // If default address was deleted, set the first remaining address as default
    if (user.addresses.length > 0 && !user.addresses.some(addr => addr.isDefault)) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    res.json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user cart
// @route   GET /api/auth/cart
// @access  Private
export const getCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('cart.product');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    
    // Map Mongoose structure to frontend format
    const cartItems = user.cart.map(item => {
      if (!item.product) return null;
      const p = item.product;
      return {
        _id: p._id,
        slug: p.slug,
        name: p.name,
        price: p.price,
        salePrice: p.salePrice,
        onSale: p.onSale,
        image: p.images?.[0]?.url || "",
        color: item.color,
        size: item.size,
        quantity: item.quantity
      };
    }).filter(Boolean);

    res.json({
      success: true,
      cart: cartItems
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync user cart
// @route   POST /api/auth/cart
// @access  Private
export const syncCart = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { items } = req.body; // array of { _id, color, size, quantity }
    
    user.cart = items.map(item => ({
      product: item._id,
      color: item.color,
      size: item.size,
      quantity: item.quantity
    }));

    await user.save();

    res.json({
      success: true,
      message: 'Cart synced successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user wishlist
// @route   GET /api/auth/wishlist
// @access  Private
export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist');
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    res.json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Sync user wishlist
// @route   POST /api/auth/wishlist
// @access  Private
export const syncWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    const { items } = req.body; // array of product _ids or full product objects
    
    // items could be strings or objects. Normalize to ID strings
    user.wishlist = items.map(item => typeof item === 'string' ? item : item._id);

    await user.save();

    res.json({
      success: true,
      message: 'Wishlist synced successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh session tokens (Rotation & Reuse detection)
// @route   POST /api/auth/refresh
// @access  Public
export const refreshSession = async (req, res, next) => {
  try {
    const token = req.cookies.beautyx_refresh;
    if (!token) {
      res.status(401);
      throw new Error('No refresh token provided');
    }

    let decoded;
    try {
      decoded = jwt.verify(token, getRefreshSecret());
    } catch (err) {
      clearRefreshTokenCookie(res);
      res.status(401);
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      clearRefreshTokenCookie(res);
      res.status(401);
      throw new Error('User not found');
    }

    if (user.status === 'suspended') {
      clearRefreshTokenCookie(res);
      res.status(403);
      throw new Error('Your account has been suspended by the administrator.');
    }

    const tokenIndex = user.refreshTokens.indexOf(token);
    if (tokenIndex === -1) {
      // Reuse detected! Revoke all tokens for this user
      user.refreshTokens = [];
      await user.save();
      clearRefreshTokenCookie(res);
      res.status(403);
      throw new Error('Token reuse detected: active sessions revoked');
    }

    // Token is valid - Rotate tokens
    const newAccessToken = generateAccessToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens[tokenIndex] = newRefreshToken;
    await user.save();

    sendRefreshToken(res, newRefreshToken);

    res.json({
      success: true,
      token: newAccessToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user & clear cookie
// @route   POST /api/auth/logout
// @access  Public
export const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies.beautyx_refresh;
    if (token) {
      try {
        const decoded = jwt.verify(token, getRefreshSecret());
        const user = await User.findById(decoded.id);
        if (user) {
          user.refreshTokens = user.refreshTokens.filter(t => t !== token);
          await user.save();
        }
      } catch (err) {
        // Ignore token verification errors during logout
      }
    }

    clearRefreshTokenCookie(res);
    res.json({ success: true, message: 'Successfully logged out' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users
// @route   GET /api/auth/users
// @access  Private/Admin
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user status (suspend/reactivate)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
export const updateUserStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['active', 'suspended'].includes(status)) {
      res.status(400);
      throw new Error('Invalid status value');
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Do not allow an admin to suspend themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot modify your own status');
    }

    user.status = status;
    // If suspended, drop all active token sessions
    if (status === 'suspended') {
      user.refreshTokens = [];
    }
    await user.save();

    res.json({
      success: true,
      message: `User account has been successfully ${status}`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }

    // Do not allow an admin to delete themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('You cannot delete your own admin account');
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User account has been permanently deleted'
    });
  } catch (error) {
    next(error);
  }
};

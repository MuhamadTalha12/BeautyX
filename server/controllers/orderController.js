import Stripe from 'stripe';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { sendEmail } from '../utils/sendEmail.js';

// Initialize Stripe (will run in mock mode if key is placeholder)
const getStripeInstance = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.includes('placeholder')) {
    return null;
  }
  return new Stripe(secretKey);
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, paymentIntentId, total } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Check stock for all items (by specific size if tracked)
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      
      if (product.sizeStock && product.sizeStock instanceof Map && product.sizeStock.has(item.size)) {
        const sizeAvailable = product.sizeStock.get(item.size) || 0;
        if (sizeAvailable < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name} (Size ${item.size}). Available: ${sizeAvailable}`);
        }
      } else {
        if (product.stock < item.quantity) {
          res.status(400);
          throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}`);
        }
      }
    }

    // Verify payment status with Stripe for card transactions
    if (paymentMethod === 'card' && typeof paymentIntentId === 'string' && !paymentIntentId.startsWith('mock_')) {
      const stripe = getStripeInstance();
      if (stripe) {
        try {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          if (paymentIntent.status !== 'succeeded') {
            res.status(400);
            throw new Error(`Stripe payment verification failed. Payment status: ${paymentIntent.status}`);
          }
          // Verify that paid amount matches the order total
          const stripeAmount = paymentIntent.amount / 100;
          if (Math.abs(stripeAmount - total) > 0.01) {
            res.status(400);
            throw new Error(`Stripe payment amount mismatch. Paid: ${stripeAmount}, Expected: ${total}`);
          }
        } catch (err) {
          res.status(400);
          throw new Error(`Failed to verify payment with Stripe: ${err.message}`);
        }
      }
    }

    // Create order
    const order = new Order({
      user: req.user._id,
      items,
      shippingAddress,
      paymentMethod,
      total,
      paymentIntentId,
      // If Cash on Delivery, payment status is pending. If card, it's paid or pending webhook confirmation
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (paymentIntentId ? 'paid' : 'pending')
    });

    const createdOrder = await order.save();

    // Deduct stock
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.sizeStock && product.sizeStock instanceof Map && product.sizeStock.has(item.size)) {
          const currentSizeStock = product.sizeStock.get(item.size) || 0;
          product.sizeStock.set(item.size, Math.max(0, currentSizeStock - item.quantity));
          await product.save();
        } else {
          product.stock = Math.max(0, product.stock - item.quantity);
          await product.save();
        }
      }
    }

    // Send order confirmation email via Resend
    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name} (${item.color}, ${item.size})</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">PKR ${item.price.toLocaleString()}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee;">
        <h2 style="font-family: serif; color: #1a1a1a; text-align: center; letter-spacing: 2px;">ORDER CONFIRMED</h2>
        <p style="text-align: center; font-size: 13px; color: #666;">Thank you for your order! We are preparing it for shipment.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p><strong>Order ID:</strong> ${createdOrder._id}</p>
        <p><strong>Shipping To:</strong></p>
        <p style="margin-left: 15px; color: #555;">
          ${shippingAddress.name}<br/>
          ${shippingAddress.street}<br/>
          ${shippingAddress.city}, ${shippingAddress.province}<br/>
          Phone: ${shippingAddress.phone}
        </p>
        <p><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background-color: #f9f9f9;">
              <th style="padding: 10px; text-align: left;">Item</th>
              <th style="padding: 10px; text-align: center;">Qty</th>
              <th style="padding: 10px; text-align: right;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
            <tr>
              <td colspan="2" style="padding: 15px 10px 10px; font-weight: bold; text-align: right;">Total Amount:</td>
              <td style="padding: 15px 10px 10px; font-weight: bold; text-align: right; color: #c9818c;">PKR ${total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 11px; color: #999; text-align: center;">© 2026 BeautyX Intimates. All Rights Reserved.</p>
      </div>
    `;

    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - BeautyX #${createdOrder._id}`,
      html: emailHtml
    });

    res.status(201).json({
      success: true,
      order: createdOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe PaymentIntent
// @route   POST /api/orders/checkout-session
// @access  Private
export const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount } = req.body; // amount is in PKR

    if (!amount) {
      res.status(400);
      throw new Error('Amount is required');
    }

    const stripe = getStripeInstance();

    if (!stripe) {
      // Return a simulated client secret for frontend testing in fallback mode
      console.log('\x1b[33m%s\x1b[0m', 'Stripe key is a placeholder. Returning mock clientSecret.');
      return res.json({
        success: true,
        clientSecret: 'mock_stripe_client_secret_xyz123',
        paymentIntentId: 'mock_pi_id_' + Math.random().toString(36).substr(2, 9)
      });
    }

    // Stripe expects amounts in cents, PKRs are 2-decimal
    const stripeAmount = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: stripeAmount,
      currency: 'pkr',
      metadata: { userId: req.user._id.toString() }
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify it is the user's order OR the user is an admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403);
      throw new Error('Not authorized to view this order');
    }

    res.json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (admin dashboard)
// @route   GET /api/orders
// @access  Private/Admin
export const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json({
      success: true,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
export const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    order.orderStatus = req.body.status || order.orderStatus;
    
    if (req.body.paymentStatus) {
      order.paymentStatus = req.body.paymentStatus;
    }

    const updatedOrder = await order.save();

    res.json({
      success: true,
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Stripe webhook handler
// @route   POST /api/orders/webhook
// @access  Public
export const stripeWebhook = async (req, res, next) => {
  const stripe = getStripeInstance();
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !sig || !webhookSecret || webhookSecret.includes('placeholder')) {
    // If webhook is invoked locally for testing, we can simulate updating the order status directly from payload
    const { type, data } = req.body;
    console.log(`[Stripe Webhook Mock] Received event: ${type}`);

    if (type === 'payment_intent.succeeded') {
      const paymentIntent = data.object;
      await Order.findOneAndUpdate(
        { paymentIntentId: paymentIntent.id },
        { paymentStatus: 'paid', orderStatus: 'processing' }
      );
    }
    return res.json({ received: true, mock: true });
  }

  let event;

  try {
    // Note: requires req.rawBody or express.raw() configurations on endpoints
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    res.status(400);
    return res.send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object;
    
    // Find order by PaymentIntent ID and update
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'paid', orderStatus: 'processing' }
    );
  } else if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object;
    await Order.findOneAndUpdate(
      { paymentIntentId: paymentIntent.id },
      { paymentStatus: 'failed' }
    );
  }

  res.json({ received: true });
};

// @desc    Track order status (public endpoint)
// @route   POST /api/orders/track
// @access  Public
export const trackOrder = async (req, res, next) => {
  try {
    const { orderId, email } = req.body;

    if (!orderId || !email) {
      res.status(400);
      throw new Error('Order ID and Email address are required');
    }

    // Validate if the input matches a MongoDB ObjectId format
    if (!orderId.match(/^[0-9a-fA-F]{24}$/)) {
      res.status(400);
      throw new Error('Invalid Order ID format');
    }

    const order = await Order.findById(orderId).populate('user', 'email');

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    // Verify the email matches the user who placed the order
    if (!order.user || order.user.email.toLowerCase() !== email.trim().toLowerCase()) {
      res.status(403);
      throw new Error('Unauthorized: Email does not match the order');
    }

    res.json({
      success: true,
      order: {
        _id: order._id,
        createdAt: order.createdAt,
        orderStatus: order.orderStatus,
        paymentStatus: order.paymentStatus,
        paymentMethod: order.paymentMethod,
        total: order.total,
        items: order.items,
        shippingAddress: order.shippingAddress
      }
    });
  } catch (error) {
    next(error);
  }
};

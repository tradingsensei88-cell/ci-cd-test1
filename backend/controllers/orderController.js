import Stripe from 'stripe';
import { orderService, productService } from '../services/dbService.js';

let stripe = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
}

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
export const addOrderItems = async (req, res, next) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentResult,
    } = req.body;

    if (!orderItems || orderItems.length === 0) {
      res.status(400);
      throw new Error('No order items');
    }

    // Verify stock and decrement stock
    for (const item of orderItems) {
      const product = await productService.findById(item.product);
      if (!product) {
        res.status(404);
        throw new Error(`Product not found: ${item.name}`);
      }
      if (product.countInStock < item.qty) {
        res.status(400);
        throw new Error(`Insufficient stock for ${product.name}. Available: ${product.countInStock}`);
      }
    }

    // Decrement stock levels
    for (const item of orderItems) {
      const product = await productService.findById(item.product);
      await productService.update(item.product, {
        countInStock: product.countInStock - item.qty,
      });
    }

    const order = await orderService.create({
      user: req.user._id,
      orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      isPaid: paymentResult ? paymentResult.status === 'succeeded' : false,
      paidAt: paymentResult && paymentResult.status === 'succeeded' ? new Date().toISOString() : null,
      paymentResult,
      status: 'Processing',
    });

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.findById(req.params.id);

    if (order) {
      // Check if logged in user owns the order, or is admin
      const isOwner = order.user === req.user._id || (order.user && order.user._id.toString() === req.user._id.toString());
      if (isOwner || req.user.isAdmin) {
        res.json(order);
      } else {
        res.status(403);
        throw new Error('Not authorized to view this order');
      }
    } else {
      res.status(404);
      throw new Error('Order not found');
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.findByUser(req.user._id);
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc    Create Stripe Checkout Session / Sim Checkout
// @route   POST /api/orders/checkout-session
// @access  Private
export const createCheckoutSession = async (req, res, next) => {
  try {
    const { cartItems } = req.body;

    if (!cartItems || cartItems.length === 0) {
      res.status(400);
      throw new Error('No items in cart');
    }

    if (stripe) {
      // Setup line items for Stripe Checkout
      const lineItems = cartItems.map((item) => {
        const itemPrice = item.discountPrice > 0 ? item.discountPrice : item.price;
        return {
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.name,
              images: item.images && item.images.length > 0 ? [item.images[0]] : [],
            },
            unit_amount: Math.round(itemPrice * 100), // Stripe expects cents
          },
          quantity: item.qty,
        };
      });

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${req.headers.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cart`,
      });

      res.json({ id: session.id, url: session.url, mode: 'stripe' });
    } else {
      // Mock Stripe Checkout Session when STRIPE_SECRET_KEY is absent
      const mockSessionId = `mock_session_${Math.random().toString(36).substring(2, 10)}${Date.now().toString(36)}`;
      res.json({
        id: mockSessionId,
        url: null, // React client will render custom Checkout simulator page directly
        mode: 'mock',
        message: 'Stripe simulated mode active. No secret key provided.',
      });
    }
  } catch (error) {
    next(error);
  }
};

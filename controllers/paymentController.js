const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const createOrder = async (req, res) => {
  try {
    console.log('POST /api/payment/order hit:', req.body);
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    let orderItems = [];
    let amount = 0;
    const address = req.body.address?.trim();

    if (!address) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address is required',
      });
    }

    if (req.body.cart) {
      // Handle cart checkout
      if (!user.cart || user.cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cart is empty',
        });
      }

      // Verify all products in cart are available
      for (const item of user.cart.items) {
        const product = await Product.findById(item.product);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: `Product ${item.product} not found`,
          });
        }
        if (product.quantity < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient quantity for ${product.name}`,
          });
        }

        orderItems.push({
          product: item.product,
          quantity: item.quantity,
          price: product.price,
        });
        amount += product.price * item.quantity;
      }

      amount = amount * 100; // Convert to paise
    } else {
      // Handle single product purchase
      const { productId, quantity = 1 } = req.body;

      if (!productId) {
        return res.status(400).json({
          success: false,
          message: 'Product ID is required',
        });
      }

      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      if (product.quantity < quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient product quantity',
        });
      }

      orderItems.push({
        product: productId,
        quantity: quantity,
        price: product.price,
      });
      amount = product.price * quantity * 100;
    }

    // Create Razorpay order
    const razorpayOrder = await razorpayInstance.orders.create({
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    // Create order in database
    const order = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount: amount / 100,
      razorpayOrderId: razorpayOrder.id,
      status: 'created',
      deliveryDetails: {
        address,
        status: 'pending',
        estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      },
    });

    res.status(201).json({
      success: true,
      key_id: RAZORPAY_ID_KEY,
      order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      product_name: req.body.productName || 'Multiple Items',
      description: req.body.description || 'Cart Checkout',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone || '9999999999',
      },
    });
  } catch (error) {
    console.error('Order creation error:', error);

    // Handle specific Razorpay errors
    if (error.error && error.error.description) {
      return res.status(400).json({
        success: false,
        message: `Razorpay error: ${error.error.description}`,
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create order',
      error: error.message,
    });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification data',
      });
    }

    // Generate expected signature
    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_SECRET_KEY)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature',
      });
    }

    // Find and update order
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        paidAt: new Date(),
      },
      { new: true }
    ).populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    // Update product quantities
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { quantity: -item.quantity },
      });
    }

    // If cart checkout, clear user's cart
    if (order.items.length > 1) {
      await User.findByIdAndUpdate(order.user, {
        $set: { cart: { items: [], total: 0 } },
      });
    }

    res.json({
      success: true,
      order,
      message: 'Payment verified successfully',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message,
    });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders',
      error: error.message,
    });
  }
};

const getBillingHistory = async (req, res) => {
  try {
    const orders = await Order.find({
      user: req.user._id,
      status: 'completed',
    }).sort('-paidAt');

    const totalSpent = orders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    res.status(200).json({
      success: true,
      orders,
      totalSpent,
    });
  } catch (error) {
    console.error('Error fetching billing history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch billing history',
      error: error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  getUserOrders,
  getBillingHistory,
};

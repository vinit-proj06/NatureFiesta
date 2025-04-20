const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  razorpayOrderId: {
    type: String,
    required: [true, 'Order must have a Razorpay order ID'],
    unique: true,
  },
  razorpayPaymentId: {
    type: String,
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user'],
  },
  items: [
    {
      product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: [true, 'Order item must have a product'],
      },
      quantity: {
        type: Number,
        required: [true, 'Order item must have a quantity'],
        min: [1, 'Quantity must be at least 1'],
      },
      price: {
        type: Number,
        required: [true, 'Order item must have a price'],
        min: [0, 'Price must be at least 0'],
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: [true, 'Order must have a total amount'],
    min: [0, 'Total amount must be at least 0'],
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'completed', 'cancelled', 'refunded'],
    default: 'created',
  },
  deliveryDetails: {
    address: String,
    status: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  paidAt: Date,
});

orderSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'items.product',
    select: 'name price imageCover category slug',
  });
  next();
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;

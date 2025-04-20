const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Razorpay = require('razorpay');

let razorpay;
try {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error(
      'Razorpay key_id or key_secret is missing in environment variables'
    );
  }
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.error('Razorpay initialization failed:', err.message);
  razorpay = null;
}

exports.getAdminBillings = catchAsync(async (req, res, next) => {
  const { date, status } = req.query;
  let query = { items: { $exists: true, $ne: [] } };

  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);
    query.paidAt = { $gte: start, $lte: end };
  }

  if (status && status !== 'All Payments') {
    query.status = status.toLowerCase();
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-paidAt')
    .select('razorpayOrderId razorpayPaymentId user totalAmount paidAt status');

  console.log('Admin billings:', { date, status, orderCount: orders.length });

  res.status(200).render('manageBillings', {
    title: 'Admin Panel - Billings',
    orders,
  });
});

exports.refundOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findOne({ razorpayOrderId: orderId }).populate(
    'user'
  );

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status !== 'completed') {
    return next(new AppError('Order cannot be refunded', 400));
  }

  // Create notification
  const notification = await Notification.create({
    user: order.user._id,
    message: `Your order ${order.razorpayOrderId.slice(-6).toUpperCase()} has been marked for refund. Amount: ₹${order.totalAmount.toFixed(2)}. Please contact support for further details.`,
  });

  order.status = 'refunded';
  await order.save();

  console.log('Notification sent:', {
    orderId,
    userId: order.user._id,
    notificationId: notification._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Refund notification sent to user',
  });
});

exports.getAdminOrders = catchAsync(async (req, res, next) => {
  const { search, status } = req.query;
  let query = { items: { $exists: true, $ne: [] } };

  if (search) {
    query.$or = [
      { razorpayOrderId: { $regex: search, $options: 'i' } },
      { 'user.name': { $regex: search, $options: 'i' } },
    ];
  }

  if (status && status !== 'All Statuses') {
    query.status = status.toLowerCase();
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort('-createdAt')
    .select('razorpayOrderId user totalAmount createdAt status');

  console.log('Admin orders:', { search, status, orderCount: orders.length });

  res.status(200).render('manageOrder', {
    title: 'Admin Panel - Orders',
    orders,
  });
});

exports.updateOrderStatus = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const { status } = req.body;

  if (!['pending', 'completed', 'cancelled'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const order = await Order.findOne({ razorpayOrderId: orderId });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  order.status = status;
  await order.save();

  console.log('Order status updated:', { orderId, status });

  res.status(200).json({
    status: 'success',
    message: 'Order status updated successfully',
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const { orderId } = req.params;
  const order = await Order.findOneAndDelete({ razorpayOrderId: orderId });

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  console.log('Order deleted:', { orderId });

  res.status(200).json({
    status: 'success',
    message: 'Order deleted successfully',
  });
});

exports.getAdminReviews = catchAsync(async (req, res, next) => {
  const { status } = req.query;
  let query = { user: { $ne: null } };

  if (status && status !== 'All Reviews') {
    query.status = status.toLowerCase();
  }

  const reviews = await Review.find(query)
    .populate({
      path: 'user',
      select: 'name photo',
      match: { _id: { $ne: null } },
    })
    .populate('product', 'name')
    .sort('-createdAt');

  const validReviews = reviews.filter((review) => review.user);

  console.log('Admin reviews:', { status, reviewCount: validReviews.length });

  res.status(200).render('manageReviews', {
    title: 'Admin Panel - Reviews',
    reviews: validReviews,
  });
});

exports.updateReviewStatus = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'flagged'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const review = await Review.findById(reviewId);
  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  review.status = status;
  await review.save();

  console.log('Review status updated:', { reviewId, status });

  res.status(200).json({
    status: 'success',
    message: 'Review status updated successfully',
  });
});

exports.deleteReview = catchAsync(async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findByIdAndDelete(reviewId);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  console.log('Review deleted:', { reviewId });

  res.status(200).json({
    status: 'success',
    message: 'Review deleted successfully',
  });
});

exports.getAdminUsers = catchAsync(async (req, res, next) => {
  const { search, role } = req.query;
  let query = {};

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (role && role !== 'All Roles') {
    query.role = role.toLowerCase();
  }

  const users = await User.find(query)
    .select('name email photo role active createdAt')
    .sort('-createdAt');

  console.log('Admin users:', { search, role, userCount: users.length });

  res.status(200).render('manageUsers', {
    title: 'Admin Panel - Users',
    users,
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const { role, active } = req.body;

  if (role && !['admin', 'customer', 'vendor'].includes(role)) {
    return next(new AppError('Invalid role', 400));
  }

  const updateData = {};
  if (role) updateData.role = role;
  if (typeof active === 'boolean') updateData.active = active;

  const user = await User.findByIdAndUpdate(userId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  console.log('User updated:', { userId, role, active });

  res.status(200).json({
    status: 'success',
    message: 'User updated successfully',
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const user = await User.findByIdAndDelete(userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  console.log('User deleted:', { userId });

  res.status(200).json({
    status: 'success',
    message: 'User deleted successfully',
  });
});

const Product = require('../models/productModel');
const Order = require('../models/orderModel');
const Review = require('../models/reviewModel');
const Notification = require('../models/notificationModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  console.log('Entered root route');
  const products = await Product.find();
  res.status(200).render('overview', {
    title: 'All Products',
    products,
  });
});

exports.getCategories = catchAsync(async (req, res, next) => {
  const category = req.params.category;
  console.log('Fetching products for category:', category);

  const products = await Product.find({
    category: { $regex: new RegExp(`^${category}$`, 'i') },
  });

  res.status(200).render('category', {
    title: category.charAt(0).toUpperCase() + category.slice(1),
    products,
  });
});

exports.getCategory = catchAsync(async (req, res) => {
  res.status(200).render('categories', {
    title: 'Category',
  });
});

exports.contact = catchAsync(async (req, res) => {
  res.status(200).render('contact', {
    title: 'Contact',
  });
});

exports.cart = catchAsync(async (req, res) => {
  const products = await Product.find();
  res.status(200).render('cart', {
    title: 'Cart',
    products,
  });
});

exports.getProduct = catchAsync(async (req, res, next) => {
  console.log('Fetching product with slug:', req.params.slug);
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) {
    console.log('Product not found for slug:', req.params.slug);
    return next(new AppError('Product not found', 404));
  }
  res.status(200).render('product', {
    title: product.name,
    product,
    user: req.user || null,
  });
});

exports.getLoginForm = catchAsync(async (req, res) => {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
});

exports.getAccount = catchAsync(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort('-createdAt')
    .limit(10);

  console.log('Notifications for user:', {
    userId: req.user._id,
    notificationCount: notifications.length,
  });

  res.status(200).render('account', {
    title: 'Your Account',
    user: req.user,
    notifications,
  });
});

exports.markNotificationRead = catchAsync(async (req, res, next) => {
  const { notificationId } = req.params;
  const notification = await Notification.findOne({
    _id: notificationId,
    user: req.user._id,
  });

  if (!notification) {
    return next(new AppError('Notification not found', 404));
  }

  notification.read = true;
  await notification.save();

  console.log('Notification marked as read:', {
    notificationId,
    userId: req.user._id,
  });

  res.status(200).json({
    status: 'success',
    message: 'Notification marked as read',
  });
});

exports.getOrders = catchAsync(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    status: { $in: ['created', 'pending', 'completed'] },
    items: { $exists: true, $ne: [] },
  })
    .sort('-createdAt')
    .populate({
      path: 'items.product',
      select: 'name price imageCover category slug',
    });

  const validOrders = orders.filter((order) =>
    order.items.every(
      (item) =>
        item.product &&
        item.product._id &&
        item.product.slug &&
        item.product.slug !== ''
    )
  );

  console.log(
    'Orders for user:',
    req.user._id,
    validOrders.map((o) => ({
      id: o._id,
      razorpayOrderId: o.razorpayOrderId,
      items: o.items.map((i) => ({
        productId: i.product?._id,
        slug: i.product?.slug,
      })),
    }))
  );

  res.status(200).render('orders', {
    title: 'Order History',
    orders: validOrders,
  });
});

exports.getOrder = catchAsync(async (req, res, next) => {
  const query = { razorpayOrderId: req.params.orderId };
  if (req.user.role !== 'admin') {
    query.user = req.user._id;
  }

  const order = await Order.findOne(query).populate({
    path: 'items.product',
    select: 'name price imageCover category slug',
  });

  if (!order) {
    console.log('Order not found:', {
      razorpayOrderId: req.params.orderId,
      userId: req.user._id,
      role: req.user.role,
    });
    return next(new AppError('Order not found', 404));
  }

  const invalidItems = order.items.filter(
    (item) => !item.product || !item.product._id
  );
  if (invalidItems.length > 0) {
    console.warn('Order has invalid items:', {
      orderId: order.razorpayOrderId,
      invalidItems: invalidItems.map((i) => i.product),
    });
  }

  console.log(
    'Order:',
    order._id,
    order.items.map((i) => ({
      productId: i.product?._id,
      slug: i.product?.slug,
    }))
  );

  res.status(200).render('orderConfirmation', {
    title: 'Order Confirmation',
    order,
  });
});

exports.deleteOrderItem = catchAsync(async (req, res, next) => {
  console.log('DELETE /orders/:orderId/:productId', {
    params: req.params,
    user: req.user?._id,
  });
  const { orderId, productId } = req.params;
  const order = await Order.findOne({
    razorpayOrderId: orderId,
    user: req.user._id,
  });

  if (!order) {
    console.log('Order not found:', { orderId, userId: req.user._id });
    return next(new AppError('Order not found', 404));
  }

  order.items = order.items.filter(
    (item) => item.product.toString() !== productId
  );
  order.totalAmount = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (order.items.length === 0) {
    await Order.deleteOne({ razorpayOrderId: orderId });
  } else {
    await order.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'Item deleted successfully',
  });
});

exports.getBilling = catchAsync(async (req, res) => {
  const orders = await Order.find({
    user: req.user._id,
    status: 'completed',
    items: { $exists: true, $ne: [] },
  })
    .sort('-paidAt')
    .populate({
      path: 'items.product',
      select: 'name price imageCover category slug',
    });

  const validOrders = orders.filter((order) =>
    order.items.every(
      (item) =>
        item.product &&
        item.product._id &&
        item.product.slug &&
        item.product.slug !== ''
    )
  );

  const totalSpent = validOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0
  );

  console.log(
    'Billing orders for user:',
    req.user._id,
    validOrders.map((o) => ({
      id: o._id,
      razorpayOrderId: o.razorpayOrderId,
      items: o.items.map((i) => ({
        productId: i.product?._id,
        slug: i.product?.slug,
      })),
    }))
  );

  res.status(200).render('billing', {
    title: 'Billing & Payments',
    orders: validOrders,
    totalSpent,
  });
});

exports.getReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user._id })
    .populate({
      path: 'product',
      select: 'name imageCover category slug',
    })
    .sort('-createdAt');

  console.log('Fetched reviews for user:', {
    userId: req.user._id,
    reviewCount: reviews.length,
    products: reviews.map((r) => ({
      reviewId: r._id,
      productId: r.product?._id,
      productName: r.product?.name,
    })),
  });

  res.status(200).render('reviews', {
    title: 'My Reviews',
    reviews,
  });
});

exports.getReviewForm = catchAsync(async (req, res, next) => {
  let review = null;
  if (req.params.id) {
    review = await Review.findOne({
      _id: req.params.id,
      user: req.user._id,
    }).populate({
      path: 'product',
      select: 'name imageCover category slug',
    });
    if (!review) {
      return next(new AppError('Review not found', 404));
    }
  }
  const orders = await Order.find({
    user: req.user._id,
    status: 'completed',
  }).populate('items.product');
  const products = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      if (
        item.product &&
        !products.some((p) => p._id.toString() === item.product._id.toString())
      ) {
        products.push(item.product);
      }
    });
  });
  res.status(200).render('reviewForm', {
    title: review ? 'Edit Review' : 'Add Review',
    review,
    products,
    error: req.query.error || null,
  });
});

exports.deleteOrder = catchAsync(async (req, res, next) => {
  const order = await Order.findOneAndDelete({
    _id: req.params.orderId,
    user: req.user._id,
  });
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  res.status(200).json({
    status: 'success',
    message: 'Order deleted successfully',
  });
});

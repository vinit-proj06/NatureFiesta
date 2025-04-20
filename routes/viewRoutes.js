const express = require('express');
const viewController = require('../controllers/viewsController');
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');

const router = express.Router();

router.get('/', viewController.getOverview);
router.get('/category', authController.isLoggedIn, viewController.getCategory);
router.get(
  '/categories/:category',
  authController.isLoggedIn,
  viewController.getCategories
);
router.get('/contact', viewController.contact);
router.get('/cart', viewController.cart);
router.get('/product/:slug', viewController.getProduct);
router.get('/login', viewController.getLoginForm);
router.get('/account', authController.protect, viewController.getAccount);

// Protected routes
router.use(authController.protect);

router.get('/me', userController.getMe, viewController.getAccount);
router.get('/reviews', viewController.getReviews);
router.get('/review/new', viewController.getReviewForm);
router.get('/review/:id/edit', viewController.getReviewForm);
router.get('/orders', viewController.getOrders);
router.get('/orders/:orderId', viewController.getOrder);
router.delete('/orders/:orderId/:productId', viewController.deleteOrderItem);
router.get('/billing', viewController.getBilling);
router.delete('/order/:orderId', viewController.deleteOrder);

// Admin routes
router.get(
  '/manageOrder',
  authController.restrictTo('admin'),
  adminController.getAdminOrders
);
router.patch(
  '/manageOrder/:orderId/status',
  authController.restrictTo('admin'),
  adminController.updateOrderStatus
);
router.delete(
  '/manageOrder/:orderId',
  authController.restrictTo('admin'),
  adminController.deleteOrder
);

router.get(
  '/manageReviews',
  authController.restrictTo('admin'),
  adminController.getAdminReviews
);
router.patch(
  '/manageReviews/:reviewId/status',
  authController.restrictTo('admin'),
  adminController.updateReviewStatus
);
router.delete(
  '/manageReviews/:reviewId',
  authController.restrictTo('admin'),
  adminController.deleteReview
);

router.get(
  '/manageBillings',
  authController.restrictTo('admin'),
  adminController.getAdminBillings
);
router.post(
  '/manageBillings/:orderId/refund',
  authController.restrictTo('admin'),
  adminController.refundOrder
);

router.get(
  '/manageUsers',
  authController.restrictTo('admin'),
  adminController.getAdminUsers
);
router.patch(
  '/manageUsers/:userId',
  authController.restrictTo('admin'),
  adminController.updateUser
);
router.delete(
  '/manageUsers/:userId',
  authController.restrictTo('admin'),
  adminController.deleteUser
);

module.exports = router;

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

router.post(
  '/orders/create',
  authController.protect,
  paymentController.createOrder
);
router.post(
  '/orders/verify',
  authController.protect,
  paymentController.verifyPayment
);
router.get('/orders', authController.protect, paymentController.getUserOrders);
router.get(
  '/billing',
  authController.protect,
  paymentController.getBillingHistory
);

module.exports = router;

const express = require('express');
const productController = require('../controllers/productController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

// Create a new route
const router = express.Router();

// POST /tour/234fad4/reviews
// GET /tour/234fad4/reviews
router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(productController.getAllProduct)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    productController.createProduct
  );

router
  .route('/:id')
  .get(productController.getProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    productController.updateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productController.deleteProduct
  );

router.route('/:id/reviews').post(productController.createProductReview);

module.exports = router;

const Review = require('../models/reviewModel');
const Product = require('../models/productModel');
const factory = require('./handlerFactory');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

exports.setProductUserIds = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;
  next();
};

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);

exports.createReview = catchAsync(async (req, res, next) => {
  const { review, rating, product } = req.body;

  // Validate product exists
  const productExists = await Product.findById(product);
  if (!productExists) {
    console.error('Invalid product ID:', product);
    return res.redirect(
      `/review/new?error=${encodeURIComponent('Invalid product selected')}`
    );
  }

  // Check for existing review
  const existingReview = await Review.findOne({
    product,
    user: req.user.id,
  });
  if (existingReview) {
    console.error('Duplicate review attempt:', {
      productId: product,
      userId: req.user.id,
    });
    return res.redirect(
      `/review/new?error=${encodeURIComponent('You have already reviewed this product')}`
    );
  }

  const reviewData = {
    review,
    rating,
    product,
    user: req.user.id,
  };

  try {
    const newReview = await Review.create(reviewData);
    console.log('Review created:', {
      reviewId: newReview._id,
      productId: product,
    });
    res.redirect('/reviews');
  } catch (err) {
    console.error('Review creation error:', err);
    return res.redirect(`/review/new?error=${encodeURIComponent(err.message)}`);
  }
});

exports.updateReview = catchAsync(async (req, res, next) => {
  const { review, rating } = req.body;

  const updatedReview = await Review.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { review, rating },
    { new: true, runValidators: true }
  );

  if (!updatedReview) {
    console.error('Review not found or not authorized:', {
      reviewId: req.params.id,
      userId: req.user.id,
    });
    return next(new AppError('Review not found or not authorized', 404));
  }

  console.log('Review updated:', { reviewId: updatedReview._id });
  res.redirect('/reviews');
});
exports.deleteReview = factory.deleteOne(Review);

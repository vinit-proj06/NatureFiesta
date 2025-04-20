const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must have a name'],
      unique: true,
      trim: true,
    },
    slug: String,
    category: {
      type: String,
      enum: [
        'Fertilizers',
        'Seeds',
        'flowers pot',
        'Plants',
        'accessories',
        'tools',
      ],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only points to current doc on NEW document creation
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below the regular price',
      },
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      // required: [true, 'A product must have a cover image'],
    },
    images: [String],
    createAt: {
      type: Date,
      default: Date.now(),
      Select: false,
    },
    quantity: {
      type: Number,
      default: 0,
    },
    // createdAt: { type: Date, default: Date.now }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
productSchema.index({ price: 1 });
productSchema.index({ slug: 1 });

// Virtual populate
productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id',
});

// DOCUMENT MIDDLEWARE: runs before .save() and .create()
productSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// QUERY MIDDLEWARE
// productSchema.pre(/^find/, function (next) {
//   this.find({ quantity: { $gt: 0 } });
//   next();
// });

// AGGREGATION MIDDLEWARE
productSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { quantity: { $gt: 0 } } });
  next();
});

productSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'reviews',
    select: '-__v -product',
  });
  next();
});

module.exports = mongoose.model('Product', productSchema);

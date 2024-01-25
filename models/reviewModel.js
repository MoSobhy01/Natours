const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'A tour must have a user'],
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'A review must have a tour'],
    },
    review: {
      type: String,
      required: [true, 'You must provide a review'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      message: 'Rating must be between 1 and 5 Inclusive',
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'user',
    select: 'name photo',
  });
  next();
});

reviewSchema.statics.calcAvgRating = async function (tourId) {
  const stat = await this.aggregate([
    {
      $match: { tour: tourId },
    },
    {
      $group: {
        _id: '$tour',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  await Tour.findByIdAndUpdate(tourId, {
    ratingsQuantity: stat[0] ? stat[0].nRatings : 0,
    ratingsAverage: stat[0] ? stat[0].avgRating : 4.5,
  });
};

reviewSchema.post('save', function () {
  this.constructor.calcAvgRating(this.tour);
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.review = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  if (this.review)
    await this.review.constructor.calcAvgRating(this.review.tour);
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

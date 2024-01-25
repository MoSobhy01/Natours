const Review = require('../models/reviewModel');
// const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllReviews = factory.getAll(Review);
exports.getReview = factory.getOne(Review);
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user._id;
  if (!req.body.tour) req.body.tour = req.params.tourId;
  next();
};
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOneIfOwner(Review, 'user');
exports.deleteReview = factory.deleteOneIfOwner(Review, 'user');

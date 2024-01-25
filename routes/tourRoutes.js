const express = require('express');
const tourController = require('../controllers/tourController');
const authController = require('../controllers/authController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

router.use('/:tourId/reviews', reviewRouter);

router.route('/getStats').get(tourController.getTourStats);
router
  .route('/getPlan/:year')
  .get(
    authController.protect,
    authController.restrict('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan,
  );

router
  .route('/get-5-top-tours')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router
  .route('/tours-within/:radius/center/:latlng/unit/:unit')
  .get(tourController.getToursWithinRadius);

router
  .route('/tours-distance/:latlng/unit/:unit')
  .get(tourController.getToursDistances);

router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.createTour,
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.uploadImages,
    tourController.resizeImages,
    tourController.updateTour,
  )
  .delete(
    authController.protect,
    authController.restrict('admin', 'lead-guide'),
    tourController.deleteTour,
  );

module.exports = router;

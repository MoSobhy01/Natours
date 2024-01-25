const express = require('express');
const viewsController = require('../controllers/viewsController');
const authController = require('../controllers/authController');

const router = express.Router();

router.get('/me', authController.protect, viewsController.getUserAccountPage);

router.use(authController.isLoggedIn);

router.get('/', viewsController.getOverview);
router.get('/tours/:slug', viewsController.getTour);
router.get('/login', viewsController.getLogin);

module.exports = router;

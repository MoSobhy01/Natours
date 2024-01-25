const mongoose = require('mongoose');
const { RateLimiterMongo } = require('rate-limiter-flexible');

const limitConsecutiveFailedAttempts = new RateLimiterMongo({
  storeClient: mongoose.connection,
  keyPrefix: 'limiterConsecutiveFailsByIP',
  points: 4,
  duration: 5 * 60,
  blockDuration: 60 * 15,
});

module.exports = limitConsecutiveFailedAttempts;

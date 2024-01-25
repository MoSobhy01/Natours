const AppError = require('../utils/appError');

const handleCastErrDB = (err) => {
  const message = `Invalid ${err.path}= ${err.value}`;
  return new AppError(message, 400);
};

const handleJWTExpiredErr = () =>
  new AppError('Your token has expired. Please Log in again', 401);

const handleJWTTokenErr = () =>
  new AppError('Invalid Token. Please Log in again', 401);

const handleDupErrDB = (err) => {
  const field = `${Object.keys(err.keyValue)[0]}`;
  const message = `Duplicate ${field}: ${
    err.keyValue.name
  }, Please choose UNIQUE ${Object.keys(err.keyValue)[0]} `;
  return new AppError(message, 400);
};

const handleValdErrDB = (err) => {
  const fields = Object.keys(err.errors);
  let messages = fields.map((key) => err.errors[key].properties.message);
  messages = `Invalid Inputs: ${messages.join('. ')}`;
  return new AppError(messages, 400);
};

const handleTooManyLoginErr = (err) => {
  const retryIN = err.msBeforeNext / 1000 || 1;
  return new AppError(
    `Too many login attempts, please try again in ${retryIN} secs`,
    429,
  );
};

const devError = (err, req, res) => {
  //API data
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      stack: err.stack,
      error: err,
    });
  }
  console.log('Error💥💥: ', err);
  //Rendered Page
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    message: err.message,
  });
};
const prodError = (err, req, res) => {
  //API data
  const message = err.isOperational ? err.message : 'Something went wrong!';
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      message,
    });
  }
  //Rendered Page
  res.status(err.statusCode).render('error', {
    title: 'Something went wrong! Please try again later',
    message,
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'production') {
    let error = Object.assign(err);
    if (err.name === 'CastError') error = handleCastErrDB(error);
    if (err.name === 'ValidationError') error = handleValdErrDB(error);
    if (err.code === 11000) error = handleDupErrDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTTokenErr(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredErr(error);
    if (err.consumedPoints) error = handleTooManyLoginErr(error);
    prodError(error, req, res);
  } else if (process.env.NODE_ENV === 'development') devError(err, req, res);
  next();
};

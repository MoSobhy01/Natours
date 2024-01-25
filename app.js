const express = require('express');
const path = require('path');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitizer = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const app = express();

const errMiddleware = require('./controllers/errController');
const AppError = require('./utils/appError');
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const viewsRouter = require('./routes/viewsRouter');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

//set security headers
app.use(helmet());

//request Rate Limit
app.use(
  '/api',
  rateLimit({
    max: 100,
    windowMs: 20 * 60 * 1000,
    message: 'Too many Request! Please try again later',
  }),
);

//body Parser with limiting payload
app.use(
  express.json({
    limit: '100kb',
  }),
);

app.use(cookieParser());

//data sanitization ag. NoSQL query injection
app.use(mongoSanitizer());

//data sanitization ag. xss scripting
app.use(xss());

//request Logger
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//serve static files
app.use(express.static(`${__dirname}/public`));

//Mount Routes
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/', viewsRouter);

//unhandled routes(other routes)
app.all('*', (req, res, next) => {
  next(new AppError(`This route (${req.originalUrl}) is not found!!`, 404));
});

//global error middleware
app.use(errMiddleware);

module.exports = app;

const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const crypto = require('crypto');

const loginLimit = require('../models/limiterModel');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/userModel');

//----------------------------------------------------------------
//------------------private utils---------------------------
//return a new token
const signToken = (id) =>
  jwt.sign({ id, iat: Date.now() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

//checks the token send is valid
const verifyToken = async (token) =>
  await promisify(jwt.verify)(token, process.env.JWT_SECRET);

//sends a response with a new token
const sendNewToken = (res, id, statusCode, data) => {
  const newToken = signToken(id);
  //set token in cookie
  res.cookie('jwt', newToken, {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN_d * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  });

  data.status = 'success';
  res.status(statusCode).json(data);
};

//get the token from cookies string
const getToken = (req) => {
  const token = req.cookies.jwt;
  //if there is no token
  if (!token)
    throw new AppError(
      'You do not have permission. Log in to have access!',
      401,
    );
  return token;
};
//----------------------------------------------------------------
exports.logout = catchAsync(async (req, res) => {
  res.cookie('jwt', '', {
    expires: new Date(Date.now() + 3000),
    httpOnly: true,
  });
  res.status(200).json({
    status: 'success',
  });
});
exports.signup = catchAsync(async (req, res) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    lastPasswordChange: req.body.lastPasswordChange,
    role: req.body.role,
  });

  const url = `${req.protocol}://${req.get('host')}/me`;
  await new Email(user, url).sendWelcome();

  sendNewToken(res, user._id, 201, { data: { user } });
});

exports.login = catchAsync(async (req, res) => {
  //too many login attempts
  const IPlRes = await loginLimit.get(req.ip);
  if (IPlRes && IPlRes.consumedPoints >= 4) {
    const retryIN = Math.round(IPlRes.msBeforeNext / 1000) || 1;
    throw new AppError(
      `Too many login attempts, please try again in ${retryIN} Secs`,
      429,
    );
  }

  const { email, password } = req.body;
  if (!email || !password) {
    await loginLimit.consume(req.ip);
    throw new AppError('Please enter email and password', 400);
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.verifyPassword(password, user.password))) {
    await loginLimit.consume(req.ip);
    throw new AppError('Incorrect email or password', 401);
  }
  await loginLimit.delete(req.ip);
  sendNewToken(res, user._id, 200, {});
});

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  //check if there is a token in request
  const token = req.cookies.jwt;
  if (!token) return next();
  //checks if this token is clean
  const payload = await verifyToken(token);
  //check if the user with "id" still exists
  const freshUser = await User.findById(payload.id).select('+password');
  if (!freshUser) return next();
  // check if the user have not changed his password after issuing the token
  if (freshUser.changedPassAfter(payload.iat)) return next();

  res.locals.user = freshUser;
  next();
});

exports.protect = catchAsync(async (req, res, next) => {
  //check if there is a token in request
  const token = getToken(req);
  //checks if this token is clean
  const payload = await verifyToken(token);
  //check if the user with "id" still exists
  const freshUser = await User.findById(payload.id).select('+password');
  if (!freshUser) throw new AppError('This user does not exist!', 401);
  // check if the user have not changed his password after issuing the token
  if (freshUser.changedPassAfter(payload.iat))
    throw new AppError(
      'This token is no longer valid! Please Log in again.',
      401,
    );

  req.user = freshUser;
  res.locals.user = freshUser;
  next();
});

exports.restrict = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(new AppError('You are not authorized!', 403));

    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res) => {
  //1) get user by email
  const user = await User.findOne({
    email: req.body.email,
  });
  if (!user)
    return res.status(200).json({
      status: 'success',
      message: 'If your email is correct, Please check your email.',
    });

  //2) generate random token & save encrypted version
  const token = user.generateResetToken();
  await user.save({ validateModifiedOnly: true });

  //3) send it via email
  try {
    const resetURL = `${req.protocol}://${req.get(
      'host',
    )}/api/v1/resetPassword/${token}`;

    await new Email(user, resetURL).sendResetPassword();

    res.status(200).json({
      status: 'success',
      message: 'If your email is correct, Please check your email.',
    });
  } catch (err) {
    user.resetToken = undefined;
    user.resetExpire = undefined;
    await user.save({ validateModifiedOnly: true });
    throw new AppError('Something went wrong,Please try again later!', 500);
  }
});
exports.resetPassword = catchAsync(async (req, res) => {
  const token = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetToken: token,
    resetExpire: { $gt: Date.now() },
  });

  if (!user) throw new AppError('This Token is not valid', 400);

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetToken = undefined;
  user.resetExpire = undefined;

  await user.save({ validateModifiedOnly: true });

  sendNewToken(res, user._id, 200, {
    message: 'Your password has been reset successfully',
  });
});

exports.updatePassword = catchAsync(async (req, res) => {
  const { user } = req;

  if (!(await user.verifyPassword(req.body.currentPassword, user.password)))
    throw new AppError('The current password is incorrect', 401);

  user.password = req.body.newPassword;
  user.passwordConfirm = req.body.newPasswordConfirm;

  await user.save({ validateModifiedOnly: true });

  sendNewToken(res, user._id, 200, {
    message: 'Your Password has been updated successfully',
  });
});

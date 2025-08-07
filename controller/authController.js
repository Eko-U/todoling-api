const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { promisify } = require('util');

const crypto = require('crypto');

const User = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

function signJWT(id) {
  const token = jwt.sign({ id }, process.env.JWT_PRIVATE_KEY, {
    expiresIn: '10d',
  });

  return token;
}

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create(req.body);

  const token = signJWT(user._id);

  res.status(200).json({
    status: 'success',
    user,
    token,
  });
});

exports.login = catchAsync(async (req, res, next) => {
  let { email, password } = req.body;

  if (!email || !password)
    return next(new AppError('You must provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');

  if (!user)
    return next(new AppError(`No user found with this email: ${email}`));

  const isCorrect = await bcrypt.compare(password, user.password);

  if (!isCorrect) return next(new AppError('Incorrect password.', 401));

  const token = signJWT(user._id);

  const cookiesOptions = {
    expires: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: true,
    sameSite: 'None',
  };

  res.cookie('JWT_TOKEN', token, cookiesOptions);

  res.status(200).json({
    status: 'success',
    token,
    user,
  });
});

exports.logout = async (req, res, next) => {
  const cookiesOptions = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };

  res.cookie('JWT_TOKEN', '', cookiesOptions);

  res.status(200).json({
    status: 'success',
    message: 'logout successfully',
  });
};

exports.protect = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT_TOKEN) {
    token = req.cookies.JWT_TOKEN;
  }

  if (!token)
    return next(new AppError('You are not logged in. Please login again', 400));

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_PRIVATE_KEY,
  );

  const user = await User.findOne({ _id: decoded.id });

  if (!user) return next(new AppError('No user found. Please try again'));

  const passwordChange = await user.changedPassword(decoded.iat);

  if (passwordChange)
    return next(new AppError('Token Expired. Please login again', 401));

  req.user = user;

  next();
});

exports.forgotPassword = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  try {
    if (!user) return next(new AppError('No user found for this email', 404));

    const resetToken = crypto.randomBytes(32).toString('hex');

    user.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: 'success',
      resetToken,
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(new AppError('Erroring sending the token'));
  }
};

exports.resetPassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const hashToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({ passwordResetToken: hashToken });

  if (!user)
    return next(new AppError('Token expired. Please get another token', 400));

  if (user && Date.now() < user.passwordResetExpires) {
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    await user.save();
  }

  // const token = signJWT(user._id);

  res.status(200).json({
    status: 'success',
    user,
    // token,
  });
};

exports.updatePassword = async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!user)
    return next(
      new AppError(
        'User not found. Please try login to update password or reset password',
        404,
      ),
    );

  const isCorrect = await bcrypt.compare(
    req.body.password || req.body.passwordConfirm,
    user.password,
  );

  if (isCorrect)
    return next(
      new AppError(
        'You cannot use your previous password. Try another password',
        403,
      ),
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: 'success',
    message: 'password succesfully updated',
    user,
  });
};

exports.isLoggedIn = catchAsync(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.JWT_TOKEN) {
    token = req.cookies.JWT_TOKEN;
  }

  if (!token) return next();

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_PRIVATE_KEY,
  );

  const user = await User.findOne({ _id: decoded.id });

  if (!user) return next();

  const passwordChange = await user.changedPassword(decoded.iat);

  if (passwordChange) return next();

  res.status(200).json({
    status: 'success',
    user,
  });
});

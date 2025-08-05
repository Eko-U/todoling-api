const multer = require('multer');
const User = require('../model/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/img/avatars');
  },

  filename: function (req, file, cb) {
    const uniqueName = Math.random() + '-' + Date.now();
    const ext = file.mimetype.split('/')[1];
    cb(null, file.fieldname + '-' + uniqueName + `.${ext}`);
  },
});

const upload = multer({ storage: storage });

exports.getUser = catchAsync(async (req, res, next) => {
  const id = req.user._id;
  const user = await User.findById(id);

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

exports.uploadPhoto = (req, res, next) => {
  upload.single('avatar')(req, res, function (err) {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  const userByID = await User.findById(req.user._id);
  if (!userByID) return next(new AppError('User does not exits', 404));

  let obj = {};
  const updateFields = ['name', 'email', 'photo'];

  Object.keys(req.body).map((el) => {
    if (updateFields.includes(el)) obj[el] = req.body[el];
  });

  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError('Please you cannot update your password here. Thanks'),
    );

  if (req.file) obj.avatar = req.file.filename;

  const user = await User.findByIdAndUpdate(userByID._id, obj, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user },
  });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {
    active: false,
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    length: users.length,
    status: 'success',
    data: {
      data: users,
    },
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);

  res.status(202).json({
    status: 'success',
    message: 'User successfully deleted...',
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);

  res.status(202).json({
    status: 'success',
    message: 'User successfully deleted...',
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);

  res.status(202).json({
    status: 'success',
    message: 'User successfully deleted...',
  });
});

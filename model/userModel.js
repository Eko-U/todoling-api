const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide your full name'],
    trim: true,
  },

  avatar: {
    type: String,
    default: '',
  },

  email: {
    type: String,
    required: [true, 'Please provide a email'],
    unique: true,
    lowercase: true,
  },

  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [8, 'password must be equal to 8 letters or more or characters'],
    maxLength: [
      15,
      'password must be less than or  equal to 15 letters or characters',
    ],

    select: false,
  },

  passwordConfirm: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return this.password === v;
      },

      message: 'PasswordConfirm is not thesame with Password',
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  changedPasswordAt: {
    type: Date,
  },

  passwordResetToken: String,
  passwordResetExpires: Date,

  active: {
    type: Boolean,
    default: true,
  },

  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre('save', async function (next) {
  // it return next() if password modified turns false cuz of the negataion
  // or true if the document is new
  if (!this.isModified('password') || this.isNew) return next();

  this.changedPasswordAt = Date.now() - 1000;

  next();
});

userSchema.methods.changedPassword = function (JWTtimeStamp) {
  if (this.changedPasswordAt) {
    const changeTime = parseInt(this.changedPasswordAt.getTime() / 1000, 10);
    return changeTime > JWTtimeStamp;
  }

  return false;
};

const User = mongoose.model('User', userSchema);
module.exports = User;

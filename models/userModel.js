const mongoose = require('mongoose');
const validator = require('validator');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'A User must have a name!'],
    trim: true,
    minLength: 8,
    maxLength: 50,
  },
  email: {
    type: String,
    required: [true, 'A User must have an email!'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: {
      validator: (em) => validator.isEmail(em),
      message: 'Please enter a valid email address',
    },
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'lead-guide', 'guide'],
    default: 'user',
  },
  photo: {
    type: String,
    trim: true,
    default: 'default.jpg',
  },
  password: {
    type: String,
    required: [true, 'A User must have a password!'],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password!'],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Passwords should be matched!',
    },
  },
  lastPasswordChange: { type: Date, default: Date.now() },
  resetToken: String,
  resetExpire: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.methods.verifyPassword = async function (candidatePass, userPass) {
  return await bcrypt.compare(candidatePass, userPass);
};

userSchema.methods.changedPassAfter = function (tokenStamp) {
  const passStamp = this.lastPasswordChange.getTime();
  return passStamp > tokenStamp;
};

userSchema.pre(/^find/, function (next) {
  this.find({ active: true });
  next();
});
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.lastPasswordChange = Date.now() - 500;
  next();
});

userSchema.methods.generateResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetToken = hashedToken;
  this.resetExpire = Date.now() + 1e4 * 60;

  return token;
};

const User = mongoose.model('User', userSchema);

module.exports = User;

/**
 * backend/models/User.js
 * User schema with bcrypt hashing, account-lockout state, and indexes.
 *
 * Security note: Passwords are never stored in plaintext; the pre-save hook
 * hashes with bcrypt (12 rounds). Lockout fields throttle brute-force attempts.
 *
 * Env variables:
 *   BCRYPT_SALT_ROUNDS - optional, default 12 (minimum enforced at 12)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const SALT_ROUNDS = Math.max(12, parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 12);

// Brute-force policy: lock the account after N failed attempts for a cool-down.
const MAX_LOGIN_ATTEMPTS = 10;
const LOCK_TIME_MS = 2 * 60 * 60 * 1000; // 2 hours

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
      index: true, // fast lookups on the primary login field
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false, // never return the hash by default
    },
    role: {
      type: String,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    // --- Account lockout state ---
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Number, select: false },
    // --- Refresh-token rotation ---
    // Store only a hash of the current refresh token so a DB leak can't reuse it.
    refreshTokenHash: { type: String, select: false },
    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Compound / performance indexes on sensitive lookup fields.
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ _id: 1, role: 1 });

// Virtual: is the account currently locked?
userSchema.virtual('isLocked').get(function () {
  return Boolean(this.lockUntil && this.lockUntil > Date.now());
});

/**
 * Pre-save hook: hash the password whenever it is set or changed.
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * Constant-time password comparison.
 */
userSchema.methods.comparePassword = async function (candidate) {
  // `this.password` requires an explicit `.select('+password')` on the query.
  return bcrypt.compare(candidate, this.password);
};

/**
 * Register a failed login. Increments the counter and locks after the cap.
 * Uses atomic $inc/$set to avoid race conditions under concurrent attempts.
 */
userSchema.methods.registerFailedLogin = async function () {
  // If a prior lock has expired, reset the counter first.
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({ $set: { loginAttempts: 1 }, $unset: { lockUntil: 1 } });
  }
  const update = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= MAX_LOGIN_ATTEMPTS && !this.isLocked) {
    update.$set = { lockUntil: Date.now() + LOCK_TIME_MS };
  }
  return this.updateOne(update);
};

/**
 * Clear lockout state after a successful login.
 */
userSchema.methods.resetLoginAttempts = async function () {
  return this.updateOne({
    $set: { loginAttempts: 0, lastLoginAt: new Date() },
    $unset: { lockUntil: 1 },
  });
};

// Keep hashes and lock internals out of any accidental JSON serialization.
userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    delete ret.refreshTokenHash;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    delete ret.__v;
    return ret;
  },
});

userSchema.statics.MAX_LOGIN_ATTEMPTS = MAX_LOGIN_ATTEMPTS;
userSchema.statics.LOCK_TIME_MS = LOCK_TIME_MS;

module.exports = mongoose.model('User', userSchema);

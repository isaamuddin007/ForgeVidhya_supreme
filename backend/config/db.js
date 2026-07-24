/**
 * backend/config/db.js
 * MongoDB connection with pooling, timeouts, and least-privilege credentials.
 *
 * Security note: Keeps the connection string out of source (env only) and caps
 * pool/socket timeouts so a stalled or hostile DB can't exhaust the event loop.
 *
 * Env variables:
 *   MONGO_URI  - full connection string, incl. an app user with readWrite ONLY
 *                (never a root/admin/dbOwner user). Example:
 *                mongodb+srv://forgevidhya_app:<pwd>@cluster/forgevidhya?retryWrites=true&w=majority
 */

const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    logger.error('MONGO_URI is not set. Refusing to start.');
    process.exit(1);
  }

  // Fail fast if someone wired an obviously over-privileged / local-root URI.
  if (/:\/\/root:|:\/\/admin:/i.test(uri)) {
    logger.error('MONGO_URI appears to use an admin/root account. Use a least-privilege app user.');
    process.exit(1);
  }

  try {
    // Strict query filtering prevents unknown operators from silently passing.
    mongoose.set('strictQuery', true);
    // Reject undefined/unindexed fields sneaking into queries via casting bugs.
    mongoose.set('sanitizeFilter', true);

    const conn = await mongoose.connect(uri, {
      // --- Connection pooling & timeouts ---
      maxPoolSize: 10,               // cap concurrent sockets
      minPoolSize: 2,
      serverSelectionTimeoutMS: 5000, // fail fast if cluster unreachable
      socketTimeoutMS: 45000,         // drop dead sockets
      connectTimeoutMS: 10000,
      family: 4,                      // prefer IPv4 to avoid slow DNS fallbacks
      autoIndex: process.env.NODE_ENV !== 'production', // build indexes in dev only
    });

    logger.info(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { message: err.message });
    });
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    // Graceful shutdown: close the pool cleanly on process termination.
    const gracefulExit = async (signal) => {
      logger.info(`Received ${signal}, closing MongoDB connection.`);
      await mongoose.connection.close();
      process.exit(0);
    };
    process.on('SIGINT', () => gracefulExit('SIGINT'));
    process.on('SIGTERM', () => gracefulExit('SIGTERM'));

    return conn;
  } catch (err) {
    logger.error('Failed to connect to MongoDB', { message: err.message });
    process.exit(1);
  }
};

module.exports = connectDB;

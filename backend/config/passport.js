/**
 * backend/config/passport.js
 * Passport.js configuration — Google OAuth 2.0 strategy.
 *
 * Verify callback: look the user up by Google id; if absent, fall back to email
 * (so an already-registered address links rather than collides on the unique
 * constraint); otherwise create a new user. Returns the user to Passport.
 *
 * Env variables:
 *   GOOGLE_CLIENT_ID     - OAuth client id from Google Cloud Console
 *   GOOGLE_CLIENT_SECRET - OAuth client secret
 *   GOOGLE_CALLBACK_URL  - e.g. http://localhost:5000/auth/google/callback
 */

const passport = require('passport');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const User = require('../models/User');
const logger = require('../utils/logger');

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_CALLBACK_URL) {
  // Warn (don't crash) so the rest of the API can still boot without OAuth env
  // during local setup. The /auth/google route will error clearly if hit.
  logger.warn(
    'Google OAuth env not fully set (GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_CALLBACK_URL). /auth/google will not work until these are provided.'
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID || 'missing',
      clientSecret: GOOGLE_CLIENT_SECRET || 'missing',
      callbackURL: GOOGLE_CALLBACK_URL || '/auth/google/callback',
      scope: ['profile', 'email'],
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;
        const name = profile.displayName;
        const avatar = profile.photos?.[0]?.value;

        if (!email) {
          return done(new Error('Google account did not return an email'));
        }

        // 1) already linked to this Google id?
        let user = await User.findByGoogleId(googleId);
        if (user) return done(null, user);

        // 2) email already registered (link instead of colliding)?
        user = await User.findByEmail(email);
        if (user) return done(null, user);

        // 3) brand-new user
        user = await User.create({ googleId, email, name, avatar });
        logger.info('New user via Google OAuth', { userId: user.id });
        return done(null, user);
      } catch (err) {
        logger.error('Google verify callback failed', { message: err.message });
        return done(err);
      }
    }
  )
);

// Sessions are enabled in server.js (per spec). We keep them minimal: store only
// the user id, and rehydrate from the DB on each request that uses a session.
// (The API itself authenticates via JWT, so this is just to satisfy Passport.)
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user || false);
  } catch (err) {
    done(err);
  }
});

module.exports = passport;

/**
 * AuthService — PostgreSQL edition.
 * Same interface as the Mongo version. Differences:
 *  - Passwords hashed explicitly with bcryptjs (no Mongoose pre-save hook)
 *  - Plain-object users from Drizzle repos (no comparePassword/toJSON/save)
 *  - resetPassword uses repo filters with $gt on resetPasswordExpire
 */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const UserRepository = require('../../repositories/pg/UserRepository');
const TokenService = require('./TokenService');
const ApiError = require('../../utils/ApiError');

const hashPassword = (plain) => bcrypt.hash(plain, 10);
const stripPassword = (user) => {
  if (!user) return user;
  const { password, ...rest } = user;
  return rest;
};

class AuthService {
  /** Register a new user */
  async register(userBody) {
    if (await UserRepository.emailExists(userBody.email)) {
      throw ApiError.conflict('Email already taken');
    }

    const { sponsorId, ...rest } = userBody;

    const newUserPayload = { ...rest };

    // Contract preservation: Mongo-era clients send profile fields top-level
    // (firstName/lastName/phone/avatar/country). The PG schema stores them under
    // the `profile` jsonb column — map them over when not already nested.
    if (!newUserPayload.profile) {
      const PROFILE_FIELDS = ['firstName', 'lastName', 'phone', 'avatar', 'country'];
      const hasTopLevel = PROFILE_FIELDS.some((k) => newUserPayload[k] !== undefined);
      if (hasTopLevel) {
        newUserPayload.profile = {};
        for (const k of PROFILE_FIELDS) {
          if (newUserPayload[k] !== undefined) {
            newUserPayload.profile[k] = newUserPayload[k];
            delete newUserPayload[k];
          }
        }
      }
    }

    if (userBody.tierId) {
      newUserPayload.preferences = newUserPayload.preferences || {};
      newUserPayload.preferences.tier = userBody.tierId;
    }
    // Explicit hashing — no Mongoose pre-save hook in the pg path
    newUserPayload.password = await hashPassword(newUserPayload.password);

    const user = await UserRepository.create(newUserPayload);

    // Genealogy placement (MLM — Phase 4 wires this to ltree; failures are non-fatal)
    if (sponsorId) {
      try {
        const GenealogyService = require('../mlm/GenealogyService');
        await GenealogyService.placeUser(user.id, sponsorId, 'auto');
      } catch (error) {
        console.error('[pg auth] Failed to place user in genealogy tree:', error.message);
      }
    }

    const tokens = await TokenService.generateAuthTokens(user);

    const EmailService = require('../emailService');
    try {
      await EmailService.sendWelcomeEmail(user);
    } catch (error) {
      console.error('[pg auth] Failed to send welcome email:', error.message);
    }

    return { user: stripPassword(user), tokens };
  }

  /** Login with email and password */
  async login(email, password) {
    const user = await UserRepository.findByEmailWithPassword(email);
    if (!user) {
      throw ApiError.unauthorized('Incorrect email or password');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw ApiError.unauthorized('Incorrect email or password');
    }

    const tokens = await TokenService.generateAuthTokens(user);
    return { user: stripPassword(user), tokens };
  }

  /** Refresh auth tokens */
  async refreshAuth(refreshToken) {
    try {
      const payload = await TokenService.verifyToken(refreshToken, 'refresh');
      const user = await UserRepository.findById(payload.sub);
      if (!user) {
        throw new Error();
      }
      return TokenService.generateAuthTokens(user);
    } catch (error) {
      throw ApiError.unauthorized('Please authenticate');
    }
  }

  /** Logout (stateless JWT — no server-side blacklist yet) */
  async logout(refreshToken) {
    return true;
  }

  /** Forgot password — issue reset token */
  async forgotPassword(email) {
    const user = await UserRepository.findByEmail(email);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    await UserRepository.update(user.id, {
      resetPasswordToken: hashedToken,
      resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    });

    const EmailService = require('../emailService');
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.mmitps.com';
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    try {
      await EmailService.sendPasswordReset(user, resetUrl);
    } catch (err) {
      await UserRepository.update(user.id, {
        resetPasswordToken: null,
        resetPasswordExpire: null,
      });
      throw new ApiError(500, 'Email could not be sent');
    }
  }

  /** Reset password with token */
  async resetPassword(token, newPassword) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError(400, 'Token is invalid or has expired');
    }

    await UserRepository.update(user.id, {
      password: await hashPassword(newPassword),
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });

    return UserRepository.findById(user.id);
  }

  /** Send magic link */
  async sendMagicLink(email) {
    const token = TokenService.generateMagicLinkToken(email);
    const frontendUrl = process.env.FRONTEND_URL || 'https://app.mmitps.com';
    const magicLink = `${frontendUrl}/login/verify?token=${token}`;

    const EmailService = require('../emailService');
    await EmailService.sendEmail(
      email,
      'Your MMITPS Magic Link',
      `<h3>Login to MMITPS</h3>
       <p>Click the link below to sign in instantly:</p>
       <a href="${magicLink}">${magicLink}</a>
       <p>This link expires in 15 minutes.</p>`
    );
  }

  /** Verify magic link and return user + tokens */
  async verifyMagicLink(token) {
    const email = TokenService.verifyMagicLinkToken(token);
    let user = await UserRepository.findByEmail(email);

    if (!user) {
      user = await UserRepository.create({
        email,
        username: email.split('@')[0],
        password: await hashPassword(crypto.randomBytes(16).toString('hex')),
        role: 'user',
        isActive: true,
      });
    }

    const tokens = await TokenService.generateAuthTokens(user);
    return { user: stripPassword(user), tokens };
  }

  /** Sync user from social provider */
  async syncSocialUser(profile) {
    const { email, firstName, lastName, provider } = profile;
    let user = await UserRepository.findByEmail(email);

    if (!user) {
      user = await UserRepository.create({
        email,
        username: email.split('@')[0],
        profile: { firstName, lastName },
        password: await hashPassword(crypto.randomBytes(16).toString('hex')),
        role: 'user',
        isActive: true,
      });
    }

    const tokens = await TokenService.generateAuthTokens(user);
    return { user: stripPassword(user), tokens };
  }
}

module.exports = new AuthService();
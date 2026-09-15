/**
 * UserService — PostgreSQL edition.
 * Same interface as the Mongo version. JSONB nested updates use read-merge-write
 * (Mongo's user.set('profile.x', v) has no Drizzle equivalent).
 */
const bcrypt = require('bcryptjs');
const UserRepository = require('../../repositories/pg/UserRepository');
const ApiError = require('../../utils/ApiError');

class UserService {
  async findById(userId) {
    return UserRepository.findById(userId);
  }

  async update(userId, data) {
    return UserRepository.update(userId, data);
  }

  /**
   * Update user profile (whitelisted fields only).
   * Accepts both { profile: {...} } and flat { firstName, lastName, phone }.
   */
  async updateProfile(userId, data) {
    const allowedUpdates = ['profile', 'preferences'];
    const updates = {};

    Object.keys(data).forEach((key) => {
      if (allowedUpdates.includes(key) || key === 'username' || key === 'sessionDuration') {
        updates[key] = data[key];
      }
    });

    // Handle nested profile updates — merge into existing JSONB profile
    if (data.firstName || data.lastName || data.phone) {
      const current = await UserRepository.findById(userId);
      if (!current) throw ApiError.notFound('User not found');
      updates.profile = {
        ...(current.profile || {}),
        ...(data.firstName ? { firstName: data.firstName } : {}),
        ...(data.lastName ? { lastName: data.lastName } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      };
    }

    return this.update(userId, updates);
  }

  /** Update user profile picture (avatar URL). */
  async updateProfilePicture(userId, avatarUrl) {
    const current = await UserRepository.findById(userId);
    if (!current) throw ApiError.notFound('User not found');
    return UserRepository.update(userId, {
      profile: { ...(current.profile || {}), avatar: avatarUrl },
    });
  }

  /** Check if email is taken (excluding current user). */
  async isEmailTaken(email, excludeUserId = null) {
    const user = await UserRepository.findByEmail(email);
    if (!user) return false;
    if (excludeUserId && user.id === excludeUserId) return false;
    return true;
  }

  /** Change user password (verify current, hash new). */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await UserRepository.findByIdWithPassword(userId);
    if (!user) {
      throw ApiError.notFound('User not found');
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw ApiError.unauthorized('Incorrect current password');
    }

    return UserRepository.update(userId, { password: await bcrypt.hash(newPassword, 10) });
  }

  /** Merge preferences into the JSONB preferences object. */
  async updatePreferences(userId, preferences) {
    const current = await UserRepository.findById(userId);
    if (!current) {
      throw ApiError.notFound('User not found');
    }

    const merged = {
      ...(current.preferences || {}),
      ...(preferences && typeof preferences === 'object' ? preferences : {}),
    };

    return UserRepository.update(userId, { preferences: merged });
  }
}

module.exports = new UserService();
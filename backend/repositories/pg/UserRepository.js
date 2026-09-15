const BaseRepository = require('./BaseRepository');
const { users } = require('../../../db/schema/core');

class UserRepository extends BaseRepository {
  constructor() {
    super(users, { defaultExclude: ['password'] });
  }

  /** Find user by email (password excluded). */
  async findByEmail(email, options = {}) {
    return this.findOne({ email }, options);
  }

  /** Find user by email including password (for auth). */
  async findByEmailWithPassword(email) {
    return this.findOne({ email }, { select: '+password' });
  }

  /** Find user by ID including password (for auth). */
  async findByIdWithPassword(id) {
    return this.findById(id, { select: '+password' });
  }

  /** Check if email exists. */
  async emailExists(email) {
    return this.exists({ email });
  }

  /** Find users by role. */
  async findByRole(role, options = {}) {
    return this.paginate({ role }, options);
  }
}

module.exports = new UserRepository();
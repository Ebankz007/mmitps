const BaseRepository = require('./BaseRepository');
const User = require('../models/User');

class UserRepository extends BaseRepository {
    constructor() {
        super(User);
    }

    /**
     * Find user by email
     * @param {String} email
     * @param {Object} options - Query options
     * @returns {Promise<Document>}
     */
    async findByEmail(email, options = {}) {
        return this.findOne({ email }, options);
    }

    /**
     * Find user by email including password
     * @param {String} email
     * @returns {Promise<Document>}
     */
    async findByEmailWithPassword(email) {
        return this.model.findOne({ email }).select('+password');
    }

    /**
     * Find user by ID including password
     * @param {String} id
     * @returns {Promise<Document>}
     */
    async findByIdWithPassword(id) {
        return this.model.findById(id).select('+password');
    }

    /**
     * Check if email exists
     * @param {String} email
     * @returns {Promise<Boolean>}
     */
    async emailExists(email) {
        const count = await this.model.countDocuments({ email });
        return count > 0;
    }

    /**
     * Find users by role
     * @param {String} role
     * @param {Object} options
     * @returns {Promise<Object>} Paginated results
     */
    async findByRole(role, options = {}) {
        return this.paginate({ role }, options);
    }
}

module.exports = new UserRepository();

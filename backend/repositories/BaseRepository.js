/**
 * Base Repository Class
 * Provides common CRUD operations for all repositories
 * Follows Repository Pattern for data access abstraction
 */

class BaseRepository {
    constructor(model) {
        if (!model) {
            throw new Error('Model is required for BaseRepository');
        }
        this.model = model;
    }

    /**
     * Find all documents with optional filters and pagination
     * @param {Object} filters - MongoDB query filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Array>} Array of documents
     */
    async findAll(filters = {}, options = {}) {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            select = '',
            populate = ''
        } = options;

        const skip = (page - 1) * limit;

        let query = this.model.find(filters);

        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);

        const results = await query
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        return results;
    }

    /**
     * Find a single document by ID
     * @param {String} id - Document ID
     * @param {Object} options - Query options (select, populate)
     * @returns {Promise<Object|null>} Document or null
     */
    async findById(id, options = {}) {
        const { select = '', populate = '', lean = true } = options;

        let query = this.model.findById(id);

        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);

        if (lean) {
            return query.lean();
        }

        return query;
    }

    /**
     * Find one document by filters
     * @param {Object} filters - MongoDB query filters
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Document or null
     */
    async findOne(filters, options = {}) {
        const { select = '', populate = '' } = options;

        let query = this.model.findOne(filters);

        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);

        return query.lean();
    }

    /**
     * Create a new document
     * @param {Object} data - Document data
     * @returns {Promise<Object>} Created document
     */
    async create(data) {
        const document = await this.model.create(data);
        return document.toObject();
    }

    /**
     * Create multiple documents
     * @param {Array} dataArray - Array of document data
     * @returns {Promise<Array>} Created documents
     */
    async createMany(dataArray) {
        const documents = await this.model.insertMany(dataArray);
        return documents.map(doc => doc.toObject());
    }

    /**
     * Update a document by ID
     * @param {String} id - Document ID
     * @param {Object} data - Update data
     * @param {Object} options - Update options
     * @returns {Promise<Object|null>} Updated document or null
     */
    async update(id, data, options = {}) {
        const { runValidators = true } = options;

        const document = await this.model.findByIdAndUpdate(
            id,
            data,
            {
                new: true,
                runValidators,
                ...options
            }
        ).lean();

        return document;
    }

    /**
     * Update one document by filters
     * @param {Object} filters - MongoDB query filters
     * @param {Object} data - Update data
     * @param {Object} options - Update options
     * @returns {Promise<Object|null>} Updated document or null
     */
    async updateOne(filters, data, options = {}) {
        const { runValidators = true } = options;

        const document = await this.model.findOneAndUpdate(
            filters,
            data,
            {
                new: true,
                runValidators,
                ...options
            }
        ).lean();

        return document;
    }

    /**
     * Update multiple documents
     * @param {Object} filters - MongoDB query filters
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Update result
     */
    async updateMany(filters, data) {
        return this.model.updateMany(filters, data);
    }

    /**
     * Delete a document by ID
     * @param {String} id - Document ID
     * @returns {Promise<Object|null>} Deleted document or null
     */
    async delete(id) {
        return this.model.findByIdAndDelete(id).lean();
    }

    /**
     * Delete one document by filters
     * @param {Object} filters - MongoDB query filters
     * @returns {Promise<Object|null>} Deleted document or null
     */
    async deleteOne(filters) {
        return this.model.findOneAndDelete(filters).lean();
    }

    /**
     * Delete multiple documents
     * @param {Object} filters - MongoDB query filters
     * @returns {Promise<Object>} Delete result
     */
    async deleteMany(filters) {
        return this.model.deleteMany(filters);
    }

    /**
     * Count documents matching filters
     * @param {Object} filters - MongoDB query filters
     * @returns {Promise<Number>} Document count
     */
    async count(filters = {}) {
        return this.model.countDocuments(filters);
    }

    /**
     * Check if document exists
     * @param {Object} filters - MongoDB query filters
     * @returns {Promise<Boolean>} True if exists
     */
    async exists(filters) {
        const count = await this.model.countDocuments(filters).limit(1);
        return count > 0;
    }

    /**
     * Paginate results with metadata
     * @param {Object} filters - MongoDB query filters
     * @param {Object} options - Pagination options
     * @returns {Promise<Object>} Paginated results with metadata
     */
    async paginate(filters = {}, options = {}) {
        const {
            page = 1,
            limit = 10,
            sort = '-createdAt',
            select = '',
            populate = ''
        } = options;

        const skip = (page - 1) * limit;

        // Get total count
        const total = await this.count(filters);

        // Get paginated results
        let query = this.model.find(filters);

        if (select) query = query.select(select);
        if (populate) query = query.populate(populate);

        const results = await query
            .sort(sort)
            .skip(skip)
            .limit(limit)
            .lean();

        return {
            results,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        };
    }

    /**
     * Execute aggregation pipeline
     * @param {Array} pipeline - Aggregation pipeline
     * @returns {Promise<Array>} Aggregation results
     */
    async aggregate(pipeline) {
        return this.model.aggregate(pipeline);
    }
}

module.exports = BaseRepository;

/**
 * Base Service Class
 * Provides common business logic operations for all services
 * Follows Service Layer Pattern for business logic abstraction
 */

const ApiError = require('../utils/ApiError');

class BaseService {
    constructor(repository) {
        if (!repository) {
            throw new Error('Repository is required for BaseService');
        }
        this.repository = repository;
    }

    /**
     * Get all entities with optional filters and pagination
     * @param {Object} filters - Query filters
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Array>} Array of entities
     */
    async findAll(filters = {}, options = {}) {
        return this.repository.findAll(filters, options);
    }

    /**
     * Get entity by ID
     * @param {String} id - Entity ID
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Entity
     * @throws {ApiError} If entity not found
     */
    async findById(id, options = {}) {
        const entity = await this.repository.findById(id, options);

        if (!entity) {
            throw new ApiError(404, `${this.getEntityName()} not found`);
        }

        return entity;
    }

    /**
     * Get one entity by filters
     * @param {Object} filters - Query filters
     * @param {Object} options - Query options
     * @returns {Promise<Object|null>} Entity or null
     */
    async findOne(filters, options = {}) {
        return this.repository.findOne(filters, options);
    }

    /**
     * Create a new entity
     * @param {Object} data - Entity data
     * @returns {Promise<Object>} Created entity
     */
    async create(data) {
        // Override this method in child classes for custom validation
        return this.repository.create(data);
    }

    /**
     * Update entity by ID
     * @param {String} id - Entity ID
     * @param {Object} data - Update data
     * @param {Object} options - Update options
     * @returns {Promise<Object>} Updated entity
     * @throws {ApiError} If entity not found
     */
    async update(id, data, options = {}) {
        const entity = await this.repository.update(id, data, options);

        if (!entity) {
            throw new ApiError(404, `${this.getEntityName()} not found`);
        }

        return entity;
    }

    /**
     * Delete entity by ID
     * @param {String} id - Entity ID
     * @returns {Promise<Object>} Deleted entity
     * @throws {ApiError} If entity not found
     */
    async delete(id) {
        const entity = await this.repository.delete(id);

        if (!entity) {
            throw new ApiError(404, `${this.getEntityName()} not found`);
        }

        return entity;
    }

    /**
     * Count entities matching filters
     * @param {Object} filters - Query filters
     * @returns {Promise<Number>} Entity count
     */
    async count(filters = {}) {
        return this.repository.count(filters);
    }

    /**
     * Check if entity exists
     * @param {Object} filters - Query filters
     * @returns {Promise<Boolean>} True if exists
     */
    async exists(filters) {
        return this.repository.exists(filters);
    }

    /**
     * Get paginated results with metadata
     * @param {Object} filters - Query filters
     * @param {Object} options - Pagination options
     * @returns {Promise<Object>} Paginated results
     */
    async paginate(filters = {}, options = {}) {
        return this.repository.paginate(filters, options);
    }

    /**
     * Validate entity data (override in child classes)
     * @param {Object} data - Entity data to validate
     * @throws {ApiError} If validation fails
     */
    async validate(data) {
        // Override this method in child classes
        return true;
    }

    /**
     * Get entity name for error messages (override in child classes)
     * @returns {String} Entity name
     */
    getEntityName() {
        return 'Entity';
    }

    /**
     * Transform entity data before returning (override in child classes)
     * @param {Object} entity - Entity to transform
     * @returns {Object} Transformed entity
     */
    transform(entity) {
        // Override this method in child classes
        return entity;
    }

    /**
     * Bulk create entities
     * @param {Array} dataArray - Array of entity data
     * @returns {Promise<Array>} Created entities
     */
    async createMany(dataArray) {
        return this.repository.createMany(dataArray);
    }

    /**
     * Bulk update entities
     * @param {Object} filters - Query filters
     * @param {Object} data - Update data
     * @returns {Promise<Object>} Update result
     */
    async updateMany(filters, data) {
        return this.repository.updateMany(filters, data);
    }

    /**
     * Bulk delete entities
     * @param {Object} filters - Query filters
     * @returns {Promise<Object>} Delete result
     */
    async deleteMany(filters) {
        return this.repository.deleteMany(filters);
    }
}

module.exports = BaseService;

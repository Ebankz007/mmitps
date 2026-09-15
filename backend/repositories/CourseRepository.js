const BaseRepository = require('./BaseRepository');
const Course = require('../models/Education/Course');

class CourseRepository extends BaseRepository {
    constructor() {
        super(Course);
    }

    async findBySlug(slug) {
        return this.model.findOne({ slug, isPublished: true }).lean();
    }

    async findPublished(filters = {}, options = {}) {
        return this.findAll({ ...filters, isPublished: true }, options);
    }
}

module.exports = new CourseRepository();

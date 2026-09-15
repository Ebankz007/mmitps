/**
 * CourseModuleRepository — PostgreSQL edition (course_modules).
 */
const BaseRepository = require('./BaseRepository');
const { courseModules } = require('../../../db/schema/education');

class CourseModuleRepository extends BaseRepository {
  constructor() {
    super(courseModules);
  }

  async findByCourse(courseId, options = {}) {
    return this.findAll({ courseId }, { sort: 'order', direction: 'asc', ...options });
  }
}

module.exports = new CourseModuleRepository();
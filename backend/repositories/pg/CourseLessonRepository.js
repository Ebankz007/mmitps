/**
 * CourseLessonRepository — PostgreSQL edition (course_lessons).
 */
const BaseRepository = require('./BaseRepository');
const { courseLessons } = require('../../../db/schema/education');

class CourseLessonRepository extends BaseRepository {
  constructor() {
    super(courseLessons);
  }

  async findByModule(moduleId, options = {}) {
    return this.findAll({ moduleId }, { sort: 'order', direction: 'asc', ...options });
  }
}

module.exports = new CourseLessonRepository();
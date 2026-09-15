// backend/repositories/pg/CourseProgressRepository.js — course_progresses (Education)
const BaseRepository = require('./BaseRepository');
const { courseProgresses } = require('../../../db/schema/education');
const { courses } = require('../../../db/schema/education');
const { eq } = require('drizzle-orm');

class CourseProgressRepository extends BaseRepository {
  constructor() {
    super(courseProgresses, {
      relations: {
        course: { table: courses, on: eq(courseProgresses.courseId, courses.id) },
      },
    });
  }

  async findByUserAndCourse(userId, courseId) {
    return this.findOne({ userId, courseId });
  }

  async findByUser(userId) {
    return this.findAll({ userId }, { populate: 'course', sort: '-lastAccessedAt' });
  }
}

module.exports = new CourseProgressRepository();
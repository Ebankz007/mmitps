// backend/services/pg/CourseService.js — courses on the PG stack
const CourseRepository = require('../../repositories/pg/CourseRepository');
const ProgressRepository = require('../../repositories/pg/CourseProgressRepository');
const ApiError = require('../../utils/ApiError');

class CourseService {
  _slugify(title) {
    return String(title).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }

  async createCourse(data, instructorId) {
    const slug = this._slugify(data.title);
    const existing = await CourseRepository.findOne({ slug });
    return CourseRepository.create({
      ...data,
      slug: existing ? `${slug}-${Date.now()}` : slug,
      instructorId,
      isPublished: false,
    });
  }

  async publishCourse(id) {
    const course = await CourseRepository.update(id, { isPublished: true });
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  async getCourse(slug) {
    const course = await CourseRepository.getPublishedWithContent(slug);
    if (!course) throw new ApiError(404, 'Course not found');
    return course;
  }

  async getAllCourses(filters = {}) {
    const list = await CourseRepository.findPublished(filters, { sort: '-createdAt' });
    const out = [];
    for (const c of list) {
      out.push(await CourseRepository.getWithContent(c.id));
    }
    return out;
  }

  async enrollUser(courseId, userId) {
    const existing = await ProgressRepository.findByUserAndCourse(userId, courseId);
    if (existing) throw new ApiError(400, 'Already enrolled');
    const course = await CourseRepository.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');
    return ProgressRepository.create({
      userId,
      courseId,
      enrolledAt: new Date(),
      progressPercent: 0,
    });
  }
}

module.exports = new CourseService();
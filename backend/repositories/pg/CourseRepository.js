// backend/repositories/pg/CourseRepository.js — courses + course_modules + course_lessons
// Mongo embedded modules/lessons → child tables. getWithContent() reassembles
// the Mongo shape: course.modules[].lessons[].
const BaseRepository = require('./BaseRepository');
const { db, pool } = require('../../../db');
const { eq, asc } = require('drizzle-orm');
const { courses } = require('../../../db/schema/education');
const { courseModules } = require('../../../db/schema/education');
const { courseLessons } = require('../../../db/schema/education');
const { users } = require('../../../db/schema/core');

class CourseRepository extends BaseRepository {
  constructor() {
    super(courses, {
      relations: {
        instructor: { table: users, on: eq(courses.instructorId, users.id) },
      },
    });
  }

  async findBySlug(slug) {
    return this.findOne({ slug }, { populate: 'instructor' });
  }

  async findPublished(filters = {}, options = {}) {
    return this.findAll({ ...filters, isPublished: true }, options);
  }

  /** Course + modules + lessons (full content tree) by id. */
  async getWithContent(courseId) {
    const course = await this.findById(courseId, { populate: 'instructor' });
    if (!course) return null;
    const modules = await db
      .select()
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId))
      .orderBy(asc(courseModules.order));
    const res = await pool.query(
      `SELECT cl.*, cm.id AS module_id
       FROM course_lessons cl
       JOIN course_modules cm ON cm.id = cl.module_id
       WHERE cm.course_id = $1
       ORDER BY cm."order", cl."order"`,
      [courseId]
    );
    const lessons = res.rows.map((r) => {
      const { module_id, ...lesson } = r;
      return { ...lesson, moduleId: module_id };
    });
    return this._assemble(course, modules, lessons);
  }

  /** Course + modules + lessons by slug (published only). */
  async getPublishedWithContent(slug) {
    const course = await this.findOne({ slug, isPublished: true }, { populate: 'instructor' });
    if (!course) return null;
    return this.getWithContent(course.id);
  }

  /** Full content tree for every course (admin list view). */
  async getAllWithContent(filters = {}, options = {}) {
    const list = await this.findAll(filters, options);
    const out = [];
    for (const c of list) {
      out.push(await this.getWithContent(c.id));
    }
    return out;
  }

  /** Total lesson count for a course (for progress %). */
  async countLessons(courseId) {
    const res = await pool.query(
      `SELECT count(*)::int AS n
       FROM course_lessons cl JOIN course_modules cm ON cm.id = cl.module_id
       WHERE cm.course_id = $1`,
      [courseId]
    );
    return res.rows[0].n;
  }

  /** Reassemble Mongo-shaped course object from child-table rows. */
  _assemble(course, modules, lessons) {
    const byModule = {};
    for (const l of lessons) {
      (byModule[l.moduleId] = byModule[l.moduleId] || []).push(l);
    }
    return {
      ...course,
      modules: modules.map((m) => ({ ...m, lessons: byModule[m.id] || [] })),
    };
  }
}

module.exports = new CourseRepository();
// db/schema/education.js — Education domain tables
// Migrated from: backend/models/Education/*.js
// Course modules/lessons were embedded subdocuments in MongoDB — now child tables.
const { pgTable, pgEnum, uuid, text, timestamp, boolean, numeric, integer, jsonb, index, uniqueIndex } = require('drizzle-orm/pg-core');
const { users } = require('./core');
const { plans } = require('./core');

// ─── Enums ────────────────────────────────────────────────────────────
const courseLevel = pgEnum('course_level', ['beginner', 'intermediate', 'advanced']);
const courseCategory = pgEnum('course_category', ['trading', 'crypto', 'finance', 'mindset', 'security']);

// ─── Courses ──────────────────────────────────────────────────────────
const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  slug: text('slug').unique(),
  description: text('description').notNull(),
  thumbnail: text('thumbnail'),
  instructorId: uuid('instructor_id').references(() => users.id),
  level: courseLevel('level').default('beginner'),
  category: courseCategory('category').default('trading'),
  price: numeric('price', { precision: 10, scale: 2, mode: 'number' }).default(0),
  currency: text('currency').default('USD'),
  isPublished: boolean('is_published').default(false),
  allowedPlans: uuid('allowed_plans').array().default([]), // refs → plans
  tags: text('tags').array().default([]),
  totalDuration: integer('total_duration').default(0), // minutes
  enrolledCount: integer('enrolled_count').default(0),
  rating: numeric('rating', { precision: 3, scale: 2, mode: 'number' }).default(0),
  ratingCount: integer('rating_count').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_courses_category').on(t.category),
  index('idx_courses_published').on(t.isPublished),
]);

// ─── Course Modules ───────────────────────────────────────────────────
const courseModules = pgTable('course_modules', {
  id: uuid('id').primaryKey().defaultRandom(),
  courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_course_modules_course').on(t.courseId),
]);

// ─── Course Lessons ───────────────────────────────────────────────────
const courseLessons = pgTable('course_lessons', {
  id: uuid('id').primaryKey().defaultRandom(),
  moduleId: uuid('module_id').notNull().references(() => courseModules.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: text('content'),
  videoUrl: text('video_url'),
  pdfUrl: text('pdf_url'),
  duration: integer('duration'), // minutes
  isFree: boolean('is_free').default(false),
  order: integer('order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  index('idx_course_lessons_module').on(t.moduleId),
]);

// ─── Course Progress ──────────────────────────────────────────────────
const courseProgresses = pgTable('course_progresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  courseId: uuid('course_id').notNull().references(() => courses.id),
  enrolledAt: timestamp('enrolled_at', { withTimezone: true }).defaultNow(),
  completedLessons: uuid('completed_lessons').array().default([]),
  completedModules: uuid('completed_modules').array().default([]),
  progressPercent: integer('progress_percent').default(0),
  isCompleted: boolean('is_completed').default(false),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  certificateUrl: text('certificate_url'),
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (t) => [
  uniqueIndex('idx_course_progress_unique').on(t.userId, t.courseId),
]);

module.exports = {
  courseLevel, courseCategory,
  courses, courseModules, courseLessons, courseProgresses,
};
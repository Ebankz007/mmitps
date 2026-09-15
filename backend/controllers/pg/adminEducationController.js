/**
 * AdminEducationController — PostgreSQL edition.
 * Admin course/module/lesson CRUD (mirrors Mongo adminEducationController).
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const CourseRepository = require('../../repositories/pg/CourseRepository');
const CourseModuleRepository = require('../../repositories/pg/CourseModuleRepository');
const CourseLessonRepository = require('../../repositories/pg/CourseLessonRepository');
const CourseProgressRepository = require('../../repositories/pg/CourseProgressRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

// Multer Upload Config
const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'education');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = `edu_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
    cb(null, name);
  },
});

const fileFilter = (req, file, cb) => {
  // Validate BOTH the mimetype and the real extension — the mimetype alone is
  // client-supplied and spoofable, and /uploads is served statically.
  const allowedMime = ['video/mp4', 'video/webm', 'video/ogg', 'application/pdf'];
  const allowedExt = ['.mp4', '.webm', '.ogg', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedMime.includes(file.mimetype) && allowedExt.includes(ext)) cb(null, true);
  else cb(new ApiError(400, 'Only video (mp4/webm/ogg) and PDF files are allowed'));
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

/** GET /admin/education/courses */
exports.getAllCourses = catchAsync(async (req, res) => {
  const { category, level, published, search } = req.query;

  const filters = {};
  if (category) filters.category = category;
  if (level) filters.level = level;
  if (published !== undefined) filters.isPublished = published === 'true';
  if (search) filters.title = { $regex: search };

  const courses = await CourseRepository.getAllWithContent(filters, { sort: 'createdAt', direction: 'desc' });

  // Enrich with enrollment + completion counts
  const enriched = await Promise.all(courses.map(async (course) => {
    const enrolledCount = await CourseProgressRepository.count({ courseId: course.id });
    const completedCount = await CourseProgressRepository.count({ courseId: course.id, isCompleted: true });
    const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
    return { ...course, enrolledCount, completedCount, totalLessons };
  }));

  res.status(200).json(new ApiResponse(true, enriched, 'Courses retrieved'));
});

/** GET /admin/education/courses/:id */
exports.getCourseById = catchAsync(async (req, res) => {
  const course = await CourseRepository.getWithContent(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }
  res.status(200).json(new ApiResponse(true, course, 'Course retrieved'));
});

/** POST /admin/education/courses */
exports.createCourse = catchAsync(async (req, res) => {
  const { title, description, level, category, price, thumbnail, tags } = req.body;

  if (!title || !description) {
    throw ApiError.badRequest('Title and description are required');
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);

  const course = await CourseRepository.create({
    title,
    slug,
    description,
    level: level || 'beginner',
    category: category || 'trading',
    price: price || 0,
    thumbnail,
    tags: tags || [],
    instructorId: req.user.id,
    isPublished: false,
  });

  res.status(201).json(new ApiResponse(true, course, 'Course created'));
});

/** PUT /admin/education/courses/:id */
exports.updateCourse = catchAsync(async (req, res) => {
  const course = await CourseRepository.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const updated = await CourseRepository.update(course.id, req.body);
  res.status(200).json(new ApiResponse(true, updated, 'Course updated'));
});

/** DELETE /admin/education/courses/:id */
exports.deleteCourse = catchAsync(async (req, res) => {
  const course = await CourseRepository.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  await CourseRepository.delete(course.id);
  res.status(200).json(new ApiResponse(true, null, 'Course deleted'));
});

/** PATCH /admin/education/courses/:id/toggle */
exports.togglePublish = catchAsync(async (req, res) => {
  const course = await CourseRepository.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const updated = await CourseRepository.update(course.id, { isPublished: !course.isPublished });
  res.status(200).json(new ApiResponse(true, updated, `Course ${updated.isPublished ? 'published' : 'unpublished'}`));
});

/** GET /admin/education/courses/:id/stats */
exports.getCourseStats = catchAsync(async (req, res) => {
  const course = await CourseRepository.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const enrolledCount = await CourseProgressRepository.count({ courseId: course.id });
  const completedCount = await CourseProgressRepository.count({ courseId: course.id, isCompleted: true });
  const totalLessons = await CourseRepository.countLessons(course.id);

  res.status(200).json(new ApiResponse(true, {
    enrolledCount,
    completedCount,
    completionRate: enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0,
    totalLessons,
    totalModules: (await CourseModuleRepository.findByCourse(course.id)).length,
  }, 'Course stats retrieved'));
});

// ── Modules ────────────────────────────────────────────────────────────────

/** POST /admin/education/courses/:id/modules */
exports.addModule = catchAsync(async (req, res) => {
  const course = await CourseRepository.findById(req.params.id);
  if (!course) {
    throw ApiError.notFound('Course not found');
  }

  const { title, description } = req.body;
  if (!title) {
    throw ApiError.badRequest('Module title is required');
  }

  const modules = await CourseModuleRepository.findByCourse(course.id);
  const module = await CourseModuleRepository.create({
    courseId: course.id,
    title,
    description,
    order: modules.length,
  });

  res.status(201).json(new ApiResponse(true, module, 'Module added'));
});

/** PUT /admin/education/courses/:id/modules/:moduleId */
exports.updateModule = catchAsync(async (req, res) => {
  const module = await CourseModuleRepository.findById(req.params.moduleId);
  if (!module) {
    throw ApiError.notFound('Module not found');
  }

  const updated = await CourseModuleRepository.update(module.id, req.body);
  res.status(200).json(new ApiResponse(true, updated, 'Module updated'));
});

/** DELETE /admin/education/courses/:id/modules/:moduleId */
exports.deleteModule = catchAsync(async (req, res) => {
  const module = await CourseModuleRepository.findById(req.params.moduleId);
  if (!module) {
    throw ApiError.notFound('Module not found');
  }

  await CourseModuleRepository.delete(module.id);
  res.status(200).json(new ApiResponse(true, null, 'Module deleted'));
});

// ── Lessons ────────────────────────────────────────────────────────────────

/** POST /admin/education/courses/:id/modules/:moduleId/lessons */
exports.addLesson = catchAsync(async (req, res) => {
  const module = await CourseModuleRepository.findById(req.params.moduleId);
  if (!module) {
    throw ApiError.notFound('Module not found');
  }

  const { title, content, videoUrl, pdfUrl, duration, isFree } = req.body;
  if (!title) {
    throw ApiError.badRequest('Lesson title is required');
  }

  const lessons = await CourseLessonRepository.findByModule(module.id);
  const lesson = await CourseLessonRepository.create({
    moduleId: module.id,
    title,
    content,
    videoUrl,
    pdfUrl,
    duration: duration || 0,
    isFree: isFree || false,
    order: lessons.length,
  });

  res.status(201).json(new ApiResponse(true, lesson, 'Lesson added'));
});

/** PUT /admin/education/courses/:id/modules/:moduleId/lessons/:lessonId */
exports.updateLesson = catchAsync(async (req, res) => {
  const lesson = await CourseLessonRepository.findById(req.params.lessonId);
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }

  const updated = await CourseLessonRepository.update(lesson.id, req.body);
  res.status(200).json(new ApiResponse(true, updated, 'Lesson updated'));
});

/** DELETE /admin/education/courses/:id/modules/:moduleId/lessons/:lessonId */
exports.deleteLesson = catchAsync(async (req, res) => {
  const lesson = await CourseLessonRepository.findById(req.params.lessonId);
  if (!lesson) {
    throw ApiError.notFound('Lesson not found');
  }

  await CourseLessonRepository.delete(lesson.id);
  res.status(200).json(new ApiResponse(true, null, 'Lesson deleted'));
});

/** POST /admin/education/upload */
exports.uploadLessonFile = catchAsync(async (req, res) => {
  if (!req.file) {
    throw ApiError.badRequest('No file uploaded');
  }

  const fileUrl = `/uploads/education/${req.file.filename}`;
  res.status(201).json(new ApiResponse(true, { url: fileUrl, filename: req.file.filename }, 'File uploaded'));
});
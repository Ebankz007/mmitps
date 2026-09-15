/**
 * educationController — PostgreSQL edition.
 * Mirrors the Mongo controllers/educationController.
 */
const CourseService = require('../../services/pg/CourseService');
const ProgressService = require('../../services/pg/ProgressService');
const CourseRepository = require('../../repositories/pg/CourseRepository');
const ProgressRepository = require('../../repositories/pg/CourseProgressRepository');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');

exports.listCourses = catchAsync(async (req, res) => {
  const courses = await CourseService.getAllCourses();
  res.status(200).json(new ApiResponse(true, courses, 'Courses retrieved'));
});

exports.createCourse = catchAsync(async (req, res) => {
  const course = await CourseService.createCourse(req.body, req.user.id);
  res.status(201).json(new ApiResponse(true, course, 'Course created'));
});

exports.publishCourse = catchAsync(async (req, res) => {
  const course = await CourseService.publishCourse(req.params.id);
  res.status(200).json(new ApiResponse(true, course, 'Course published'));
});

exports.getCourse = catchAsync(async (req, res) => {
  const course = await CourseService.getCourse(req.params.slug);
  res.status(200).json(new ApiResponse(true, course, 'Course retrieved'));
});

exports.enroll = catchAsync(async (req, res) => {
  const progress = await CourseService.enrollUser(req.params.id, req.user.id);
  res.status(201).json(new ApiResponse(true, progress, 'Enrolled successfully'));
});

exports.getMyProgress = catchAsync(async (req, res) => {
  const learning = await ProgressService.getMyLearning(req.user.id);
  res.status(200).json(new ApiResponse(true, learning, 'Learning progress retrieved'));
});

exports.getStats = catchAsync(async (req, res) => {
  const progress = await ProgressRepository.findByUser(req.user.id);
  const stats = {
    enrolledCourses: progress.length,
    completedCourses: progress.filter((p) => p.progressPercent === 100).length,
    averageProgress: progress.length
      ? Math.round(progress.reduce((s, p) => s + (p.progressPercent || 0), 0) / progress.length)
      : 0,
  };
  res.status(200).json(new ApiResponse(true, stats, 'Stats retrieved'));
});

exports.completeLesson = catchAsync(async (req, res) => {
  const { courseId, lessonId } = req.params;
  const progress = await ProgressService.completeLesson(req.user.id, courseId, lessonId);
  res.status(200).json(new ApiResponse(true, progress, 'Lesson completed'));
});
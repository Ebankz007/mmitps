const CourseService = require('../services/education/CourseService');
const ProgressService = require('../services/education/ProgressService');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');

// Course Management
exports.createCourse = catchAsync(async (req, res) => {
    const course = await CourseService.createCourse(req.body, req.user._id);
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

exports.listCourses = catchAsync(async (req, res) => {
    const courses = await CourseService.getAllCourses(req.query);
    res.status(200).json(new ApiResponse(true, courses, 'Courses retrieved'));
});

// Enrollment & Progress
exports.enroll = catchAsync(async (req, res) => {
    const progress = await CourseService.enrollUser(req.params.id, req.user._id);
    res.status(200).json(new ApiResponse(true, progress, 'Enrolled successfully'));
});

exports.completeLesson = catchAsync(async (req, res) => {
    const { courseId, lessonId } = req.params;
    const progress = await ProgressService.completeLesson(req.user._id, courseId, lessonId);

    // MLM Trigger: If course just completed (and we assume it wasn't before)
    // ProgressService sets isCompleted=true when it reaches 100%
    if (progress.isCompleted) {
        try {
            // Award completion bonus to sponsor? Or user?
            // "Education-MLM link" usually means volume or bonus.
            // Let's award a small bonus to the SPONSOR for driving education.

            const GenealogyRepository = require('../repositories/GenealogyRepository');
            const CommissionService = require('../services/mlm/CommissionService');

            const genealogyNode = await GenealogyRepository.findByUserId(req.user._id);
            if (genealogyNode && genealogyNode.sponsor) {
                // Award $10 bonus to sponsor for downline completing a course
                await CommissionService.calculateDirectReferral(genealogyNode.sponsor, 100, 'course_completion');
                // Assuming 100 is "value" of course, 10% is $10 comm.
            }
        } catch (error) {
            console.error('Failed to process MLM trigger for course completion:', error);
            // Don't fail the response, just log it.
        }
    }

    res.status(200).json(new ApiResponse(true, progress, 'Lesson completed'));
});

exports.getMyProgress = catchAsync(async (req, res) => {
    const progress = await ProgressService.getUserProgress(req.user._id);
    res.status(200).json(new ApiResponse(true, progress, 'User progress retrieved'));
});

exports.getStats = catchAsync(async (req, res) => {
    const stats = await ProgressService.getLearningStats(req.user._id);
    res.status(200).json(new ApiResponse(true, stats, 'Learning stats retrieved'));
});

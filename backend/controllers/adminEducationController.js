const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const Course = require('../models/Education/Course');
const CourseProgress = require('../models/Education/CourseProgress');

// ─── Multer Upload Config ──────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'uploads', 'education');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const name = `edu_${Date.now()}_${Math.round(Math.random() * 1e6)}${ext}`;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    const allowed = ['video/mp4', 'video/webm', 'video/ogg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new ApiError(400, 'Only video (mp4/webm/ogg) and PDF files are allowed'));
};

exports.upload = multer({ storage, fileFilter, limits: { fileSize: 500 * 1024 * 1024 } }); // 500MB

// ─── Course CRUD ──────────────────────────────────────────────────────────
exports.getAllCourses = catchAsync(async (req, res) => {
    const { category, level, published, search } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (published !== undefined) filter.isPublished = published === 'true';
    if (search) filter.title = { $regex: search, $options: 'i' };

    const courses = await Course.find(filter)
        .populate('instructor', 'firstName lastName email')
        .populate('allowedPlans', 'name type')
        .sort({ createdAt: -1 })
        .lean();

    // Enrich with enrollment count
    const enriched = await Promise.all(courses.map(async (course) => {
        const enrolledCount = await CourseProgress.countDocuments({ course: course._id });
        const completedCount = await CourseProgress.countDocuments({ course: course._id, isCompleted: true });
        const totalLessons = course.modules?.reduce((sum, m) => sum + (m.lessons?.length || 0), 0) || 0;
        return { ...course, enrolledCount, completedCount, totalLessons };
    }));

    res.status(200).json(new ApiResponse(true, enriched, 'Courses retrieved'));
});

exports.getCourseById = catchAsync(async (req, res) => {
    const course = await Course.findById(req.params.id)
        .populate('instructor', 'firstName lastName email')
        .populate('allowedPlans', 'name type price');
    if (!course) throw new ApiError(404, 'Course not found');
    res.status(200).json(new ApiResponse(true, course, 'Course retrieved'));
});

exports.createCourse = catchAsync(async (req, res) => {
    const { title, description, thumbnail, category, level, tags, allowedPlans, price, currency } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const existing = await Course.findOne({ slug });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const course = await Course.create({
        title, description, thumbnail, category, level, tags, allowedPlans, price, currency,
        slug: finalSlug,
        instructor: req.user._id,
        isPublished: false,
        modules: []
    });

    res.status(201).json(new ApiResponse(true, course, 'Course created'));
});

exports.updateCourse = catchAsync(async (req, res) => {
    const { title, description, thumbnail, category, level, tags, allowedPlans, price, currency } = req.body;
    const update = { title, description, thumbnail, category, level, tags, allowedPlans, price, currency };

    // Auto-regenerate slug if title changes
    if (title) {
        update.slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const course = await Course.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true })
        .populate('allowedPlans', 'name type');
    if (!course) throw new ApiError(404, 'Course not found');
    res.status(200).json(new ApiResponse(true, course, 'Course updated'));
});

exports.deleteCourse = catchAsync(async (req, res) => {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');
    await CourseProgress.deleteMany({ course: req.params.id });
    res.status(200).json(new ApiResponse(true, null, 'Course and all student progress deleted'));
});

exports.togglePublish = catchAsync(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');
    course.isPublished = !course.isPublished;
    await course.save();
    res.status(200).json(new ApiResponse(true, { isPublished: course.isPublished }, `Course ${course.isPublished ? 'published' : 'unpublished'}`));
});

exports.getCourseStats = catchAsync(async (req, res) => {
    const { id } = req.params;
    const course = await Course.findById(id).lean();
    if (!course) throw new ApiError(404, 'Course not found');

    const totalEnrolled = await CourseProgress.countDocuments({ course: id });
    const totalCompleted = await CourseProgress.countDocuments({ course: id, isCompleted: true });
    const avgProgress = await CourseProgress.aggregate([
        { $match: { course: new mongoose.Types.ObjectId(id) } },
        { $group: { _id: null, avg: { $avg: '$progressPercent' } } }
    ]);

    res.status(200).json(new ApiResponse(true, {
        totalEnrolled,
        totalCompleted,
        completionRate: totalEnrolled > 0 ? Math.round((totalCompleted / totalEnrolled) * 100) : 0,
        avgProgress: avgProgress[0]?.avg?.toFixed(1) || 0,
        totalModules: course.modules?.length || 0,
        totalLessons: course.modules?.reduce((s, m) => s + (m.lessons?.length || 0), 0) || 0
    }, 'Course stats retrieved'));
});

// ─── Module CRUD ──────────────────────────────────────────────────────────
exports.addModule = catchAsync(async (req, res) => {
    const { title, description, order } = req.body;
    const course = await Course.findById(req.params.id);
    if (!course) throw new ApiError(404, 'Course not found');

    course.modules.push({ title, description, order: order ?? course.modules.length, lessons: [] });
    await course.save();
    res.status(201).json(new ApiResponse(true, course, 'Module added'));
});

exports.updateModule = catchAsync(async (req, res) => {
    const { id, moduleId } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, 'Course not found');

    const mod = course.modules.id(moduleId);
    if (!mod) throw new ApiError(404, 'Module not found');

    const { title, description, order } = req.body;
    if (title !== undefined) mod.title = title;
    if (description !== undefined) mod.description = description;
    if (order !== undefined) mod.order = order;

    await course.save();
    res.status(200).json(new ApiResponse(true, course, 'Module updated'));
});

exports.deleteModule = catchAsync(async (req, res) => {
    const { id, moduleId } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, 'Course not found');

    course.modules = course.modules.filter(m => m._id.toString() !== moduleId);
    await course.save();
    res.status(200).json(new ApiResponse(true, course, 'Module deleted'));
});

// ─── Lesson CRUD ──────────────────────────────────────────────────────────
exports.addLesson = catchAsync(async (req, res) => {
    const { id, moduleId } = req.params;
    const { title, content, videoUrl, pdfUrl, duration, isFree, order } = req.body;

    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, 'Course not found');

    const mod = course.modules.id(moduleId);
    if (!mod) throw new ApiError(404, 'Module not found');

    mod.lessons.push({
        title, content, videoUrl, pdfUrl, duration,
        isFree: isFree ?? false,
        order: order ?? mod.lessons.length
    });

    // Recalculate total duration
    course.totalDuration = course.modules.reduce((sum, m) =>
        sum + m.lessons.reduce((ls, l) => ls + (l.duration || 0), 0), 0);

    await course.save();
    res.status(201).json(new ApiResponse(true, course, 'Lesson added'));
});

exports.updateLesson = catchAsync(async (req, res) => {
    const { id, moduleId, lessonId } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, 'Course not found');

    const mod = course.modules.id(moduleId);
    if (!mod) throw new ApiError(404, 'Module not found');

    const lesson = mod.lessons.id(lessonId);
    if (!lesson) throw new ApiError(404, 'Lesson not found');

    const fields = ['title', 'content', 'videoUrl', 'pdfUrl', 'duration', 'isFree', 'order'];
    fields.forEach(f => { if (req.body[f] !== undefined) lesson[f] = req.body[f]; });

    course.totalDuration = course.modules.reduce((sum, m) =>
        sum + m.lessons.reduce((ls, l) => ls + (l.duration || 0), 0), 0);

    await course.save();
    res.status(200).json(new ApiResponse(true, course, 'Lesson updated'));
});

exports.deleteLesson = catchAsync(async (req, res) => {
    const { id, moduleId, lessonId } = req.params;
    const course = await Course.findById(id);
    if (!course) throw new ApiError(404, 'Course not found');

    const mod = course.modules.id(moduleId);
    if (!mod) throw new ApiError(404, 'Module not found');

    mod.lessons = mod.lessons.filter(l => l._id.toString() !== lessonId);
    await course.save();
    res.status(200).json(new ApiResponse(true, course, 'Lesson deleted'));
});

// ─── File Upload ──────────────────────────────────────────────────────────
exports.uploadLessonFile = catchAsync(async (req, res) => {
    if (!req.file) throw new ApiError(400, 'No file uploaded');

    const baseUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5066}`;
    const publicUrl = `${baseUrl}/uploads/education/${req.file.filename}`;

    res.status(200).json(new ApiResponse(true, {
        url: publicUrl,
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size
    }, 'File uploaded successfully'));
});

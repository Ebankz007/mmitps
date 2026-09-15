const express = require('express');
const router = express.Router();
const educationController = require('../controllers/pg/educationController');
const { protect, authorize } = require('../middleware/pg/auth');

// Public routes (for authenticated users)
router.get('/courses', educationController.listCourses);

router.use(protect);

// Courses
router.post('/courses', authorize('admin', 'instructor'), educationController.createCourse);
router.patch('/courses/:id/publish', authorize('admin', 'instructor'), educationController.publishCourse);
router.get('/courses/:slug', educationController.getCourse); // Details

// Enrollment
router.post('/courses/:id/enroll', educationController.enroll);
router.get('/my-learning', educationController.getMyProgress);
router.get('/stats', educationController.getStats);

// Progress
router.post('/courses/:courseId/lessons/:lessonId/complete', educationController.completeLesson);

module.exports = router;

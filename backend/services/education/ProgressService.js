const ProgressRepository = require('../../repositories/ProgressRepository');
const CourseRepository = require('../../repositories/CourseRepository');
const ApiError = require('../../utils/ApiError');

class ProgressService {

    async getUserProgress(userId) {
        return ProgressRepository.findByUser(userId);
    }

    async completeLesson(userId, courseId, lessonId) {
        const progress = await ProgressRepository.findByUserAndCourse(userId, courseId);
        if (!progress) throw new ApiError(404, 'Not enrolled in this course');

        // Check if already completed
        if (progress.completedLessons.includes(lessonId)) {
            return progress;
        }

        // Add to completed
        progress.completedLessons.push(lessonId);

        // Recalculate percentage
        const course = await CourseRepository.findById(courseId);
        let totalLessons = 0;
        course.modules.forEach(m => totalLessons += m.lessons.length);

        if (totalLessons > 0) {
            progress.progressPercent = Math.round((progress.completedLessons.length / totalLessons) * 100);
        }

        if (progress.progressPercent === 100) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
        }

        progress.lastAccessedAt = new Date();
        return progress.save();
    }

    async getLearningStats(userId) {
        const progress = await ProgressRepository.findByUser(userId);
        const totalCoursesCount = await CourseRepository.countDocuments({ isPublished: true });

        // Count total potential lessons across all published courses
        const courses = await CourseRepository.find({ isPublished: true });
        let totalVideos = 0;
        let totalQuizzes = 0;

        courses.forEach(course => {
            course.modules.forEach(module => {
                module.lessons.forEach(lesson => {
                    if (lesson.type === 'video') totalVideos++;
                    if (lesson.type === 'quiz') totalQuizzes++;
                });
            });
        });

        return {
            coursesCompleted: progress.filter(p => p.isCompleted).length,
            totalCourses: totalCoursesCount || 12,
            videosWatched: progress.reduce((acc, p) => acc + p.completedLessons.length, 0), // Simplifying for stats
            totalVideos: totalVideos || 125,
            quizzesPassed: 7, // Placeholder until quiz tracking is fully implemented
            totalQuizzes: totalQuizzes || 15,
            certificatesEarned: progress.filter(p => p.isCompleted).length
        };
    }
}

module.exports = new ProgressService();

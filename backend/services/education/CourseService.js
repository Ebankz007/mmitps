const CourseRepository = require('../../repositories/CourseRepository');
const ProgressRepository = require('../../repositories/ProgressRepository');
const ApiError = require('../../utils/ApiError');

class CourseService {

    async createCourse(data, instructorId) {
        // Generate slug from title
        data.slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        data.instructor = instructorId;
        return CourseRepository.create(data);
    }

    async publishCourse(id) {
        return CourseRepository.update(id, { isPublished: true });
    }

    async getCourse(slug) {
        const course = await CourseRepository.findBySlug(slug);
        if (!course) throw new ApiError(404, 'Course not found');
        return course;
    }

    async getAllCourses(filters = {}) {
        return CourseRepository.findPublished(filters);
    }

    async enrollUser(courseId, userId) {
        // Check if already enrolled
        const existing = await ProgressRepository.findByUserAndCourse(userId, courseId);
        if (existing) throw new ApiError(400, 'Already enrolled');

        // Check if course exists
        const course = await CourseRepository.findById(courseId);
        if (!course) throw new ApiError(404, 'Course not found');

        // Create progress record
        return ProgressRepository.create({
            user: userId,
            course: courseId,
            enrolledAt: new Date(),
            progressPercent: 0
        });
    }
}

module.exports = new CourseService();

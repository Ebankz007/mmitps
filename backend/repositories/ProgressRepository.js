const BaseRepository = require('./BaseRepository');
const CourseProgress = require('../models/Education/CourseProgress');

class ProgressRepository extends BaseRepository {
    constructor() {
        super(CourseProgress);
    }

    async findByUserAndCourse(userId, courseId) {
        return this.model.findOne({ user: userId, course: courseId });
    }

    async findByUser(userId) {
        return this.model.find({ user: userId }).populate('course', 'title slug thumbnail');
    }
}

module.exports = new ProgressRepository();

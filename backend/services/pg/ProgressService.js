// backend/services/pg/ProgressService.js — course progress on the PG stack
const ProgressRepository = require('../../repositories/pg/CourseProgressRepository');
const CourseRepository = require('../../repositories/pg/CourseRepository');
const ApiError = require('../../utils/ApiError');

class ProgressService {
  async getMyLearning(userId) {
    const progresses = await ProgressRepository.findByUser(userId);
    return progresses.filter((p) => p.course); // drop orphaned course refs
  }

  /** Mark a lesson complete → recompute progressPercent from completed/total. */
  async completeLesson(userId, courseId, lessonId) {
    const progress = await ProgressRepository.findByUserAndCourse(userId, courseId);
    if (!progress) throw new ApiError(404, 'Enrollment not found');

    const completed = progress.completedLessons || [];
    if (!completed.includes(lessonId)) {
      completed.push(lessonId);
    }

    const totalLessons = await CourseRepository.countLessons(courseId);
    const percent = totalLessons > 0
      ? Math.round((completed.length / totalLessons) * 100)
      : 0;

    return ProgressRepository.update(progress.id, {
      completedLessons: completed,
      progressPercent: percent,
      lastAccessedAt: new Date(),
      completedAt: percent === 100 ? new Date() : progress.completedAt || null,
    });
  }
}

module.exports = new ProgressService();
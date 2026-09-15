import api from "../api";

export interface Course {
    _id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail: string;
    category: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: string;
    totalLessons: number;
    rating: number;
    reviewCount: number;
    price: number;
    isPublished: boolean;
    instructor: {
        _id: string;
        name: string;
    };
    curriculum: Section[];
}

export interface Section {
    _id: string;
    title: string;
    lessons: Lesson[];
}

export interface Lesson {
    _id: string;
    title: string;
    type: 'video' | 'pdf' | 'quiz';
    duration: string;
    contentUrl?: string;
}

export interface UserProgress {
    courseId: string;
    enrolledAt: string;
    completedLessons: string[];
    isCompleted: boolean;
    percentComplete: number;
    lastLessonId?: string;
}

export interface EducationStats {
    coursesCompleted: number;
    totalCourses: number;
    videosWatched: number;
    totalVideos: number;
    quizzesPassed: number;
    totalQuizzes: number;
    certificatesEarned: number;
}

export const educationService = {
    // Course Catalog
    getCourses: async (params?: Record<string, unknown>) => {
        const res = await api.get("/api/v1/education/courses", { params });
        return res.data;
    },

    getCourseBySlug: async (slug: string) => {
        const res = await api.get(`/api/v1/education/courses/${slug}`);
        return res.data.data as Course;
    },

    // Enrollment & Progress
    enrollInCourse: async (courseId: string) => {
        const res = await api.post(`/api/v1/education/courses/${courseId}/enroll`);
        return res.data;
    },

    getMyProgress: async () => {
        const res = await api.get("/api/v1/education/my-learning");
        return res.data.data as UserProgress[];
    },

    completeLesson: async (courseId: string, lessonId: string) => {
        const res = await api.post(`/api/v1/education/courses/${courseId}/lessons/${lessonId}/complete`);
        return res.data.data as UserProgress;
    },

    // Learning Stats
    getLearningStats: async () => {
        const res = await api.get("/api/v1/education/stats");
        return res.data.data as EducationStats;
    }
};

// ─── Admin Education Service ───────────────────────────────────────────────
export const adminEducationService = {
    // Courses
    getAllCourses: async (params?: Record<string, unknown>) => {
        const res = await api.get("/api/v1/admin/education/courses", { params });
        return res.data.data;
    },
    getCourseById: async (id: string) => {
        const res = await api.get(`/api/v1/admin/education/courses/${id}`);
        return res.data.data;
    },
    createCourse: async (data: Record<string, unknown>) => {
        const res = await api.post("/api/v1/admin/education/courses", data);
        return res.data.data;
    },
    updateCourse: async (id: string, data: Record<string, unknown>) => {
        const res = await api.put(`/api/v1/admin/education/courses/${id}`, data);
        return res.data.data;
    },
    deleteCourse: async (id: string) => {
        const res = await api.delete(`/api/v1/admin/education/courses/${id}`);
        return res.data;
    },
    togglePublish: async (id: string) => {
        const res = await api.patch(`/api/v1/admin/education/courses/${id}/toggle`);
        return res.data.data;
    },
    getCourseStats: async (id: string) => {
        const res = await api.get(`/api/v1/admin/education/courses/${id}/stats`);
        return res.data.data;
    },

    // Modules
    addModule: async (courseId: string, data: Record<string, unknown>) => {
        const res = await api.post(`/api/v1/admin/education/courses/${courseId}/modules`, data);
        return res.data.data;
    },
    updateModule: async (courseId: string, moduleId: string, data: Record<string, unknown>) => {
        const res = await api.put(`/api/v1/admin/education/courses/${courseId}/modules/${moduleId}`, data);
        return res.data.data;
    },
    deleteModule: async (courseId: string, moduleId: string) => {
        const res = await api.delete(`/api/v1/admin/education/courses/${courseId}/modules/${moduleId}`);
        return res.data;
    },

    // Lessons
    addLesson: async (courseId: string, moduleId: string, data: Record<string, unknown>) => {
        const res = await api.post(`/api/v1/admin/education/courses/${courseId}/modules/${moduleId}/lessons`, data);
        return res.data.data;
    },
    updateLesson: async (courseId: string, moduleId: string, lessonId: string, data: Record<string, unknown>) => {
        const res = await api.put(`/api/v1/admin/education/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, data);
        return res.data.data;
    },
    deleteLesson: async (courseId: string, moduleId: string, lessonId: string) => {
        const res = await api.delete(`/api/v1/admin/education/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`);
        return res.data;
    },

    // File Upload
    uploadFile: async (formData: FormData) => {
        const res = await api.post("/api/v1/admin/education/upload", formData, {
            headers: { "Content-Type": "multipart/form-data" }
        });
        return res.data.data as { url: string; filename: string; mimetype: string; size: number };
    }
};

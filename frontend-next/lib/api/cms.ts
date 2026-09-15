import api from "../api";

export interface NewsArticle {
    _id: string;
    title: string;
    slug: string;
    content: string;
    summary: string;
    thumbnail: string;
    category: string;
    author: {
        firstName: string;
        lastName: string;
    };
    publishedAt: string;
    tags: string[];
}

export interface ContentBlock {
    _id: string;
    slug: string;
    type: string;
    title: string;
    content: string;
    data: Record<string, unknown>;
}

export const cmsService = {
    getLatestNews: async (category?: string) => {
        const params = category ? { category } : {};
        const response = await api.get("/api/v1/news", { params });
        return response.data.data;
    },

    getArticle: async (slug: string) => {
        const response = await api.get(`/api/v1/news/${slug}`);
        return response.data.data;
    },

    getEvents: async () => {
        const response = await api.get("/api/v1/cms/events"); // Placeholder based on user request
        return response.data.data;
    },

    getContentBlock: async (slug: string) => {
        const response = await api.get(`/api/v1/cms/${slug}`);
        return response.data.data;
    },

    getBlocks: async (type?: string) => {
        const params = type ? { type } : {};
        const response = await api.get("/api/v1/cms", { params });
        return response.data.data;
    },

    // Mock/Extended helpers for Help Center until dedicated routes are added
    getFaqs: async () => {
        // Fallback to CMS block or news with 'faq' tag
        const response = await api.get("/api/v1/news", { params: { tags: "faq" } });
        return response.data.data;
    }
};

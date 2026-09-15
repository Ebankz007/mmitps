import api from "../api";

export interface SiteSection {
    _id: string;
    slug: string;
    page: string;
    section: string;
    type: string;
    data: Record<string, any>;
    sortOrder: number;
    isActive: boolean;
}

export const siteContentService = {
    getPageContent: async (page: string): Promise<SiteSection[]> => {
        const response = await api.get(`/api/v1/site-content/page/${page}`);
        return response.data.data;
    },

    getSectionBySlug: async (slug: string): Promise<SiteSection> => {
        const response = await api.get(`/api/v1/site-content/slug/${slug}`);
        return response.data.data;
    },

    // Admin methods
    getAllContent: async (page?: string): Promise<SiteSection[]> => {
        const params = page ? { page } : {};
        const response = await api.get("/api/v1/site-content", { params });
        return response.data.data;
    },

    createSection: async (section: Partial<SiteSection>): Promise<SiteSection> => {
        const response = await api.post("/api/v1/site-content", section);
        return response.data.data;
    },

    updateSection: async (id: string, data: Partial<SiteSection>): Promise<SiteSection> => {
        const response = await api.put(`/api/v1/site-content/${id}`, data);
        return response.data.data;
    },

    deleteSection: async (id: string): Promise<void> => {
        await api.delete(`/api/v1/site-content/${id}`);
    },

    upsertBySlug: async (slug: string, data: Partial<SiteSection>): Promise<SiteSection> => {
        const response = await api.put(`/api/v1/site-content/slug/${slug}`, data);
        return response.data.data;
    },

    bulkUpsert: async (page: string, sections: Partial<SiteSection>[]): Promise<SiteSection[]> => {
        const response = await api.post(`/api/v1/site-content/bulk/${page}`, { sections });
        return response.data.data;
    }
};

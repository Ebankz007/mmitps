import api from "../api";

export interface UserProfile {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: string;
    status: string;
    kycStatus: string;
    preferences?: {
        sessionDuration?: number;
        theme?: string;
        language?: string;
    };
    subscription?: {
        plan: string;
        expiresAt: string;
    };
    createdAt: string;
}

export const userService = {
    getProfile: async () => {
        const res = await api.get("/api/v1/users/profile");
        return res.data.data as UserProfile;
    },
    updateProfile: async (data: Partial<UserProfile>) => {
        const res = await api.put("/api/v1/users/profile", data);
        return res.data.data as UserProfile;
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
        const res = await api.patch("/api/v1/users/change-password", {
            currentPassword,
            newPassword
        });
        return res.data;
    },
    uploadAvatar: async (formData: FormData) => {
        const res = await api.post("/api/v1/users/profile/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res.data.data as string; // Returns avatar URL
    },
    updatePreferences: async (preferences: Record<string, unknown>) => {
        const res = await api.patch("/api/v1/users/update-preferences", preferences);
        return res.data.data;
    },
    getEmailPreferences: async () => {
        const res = await api.get("/api/v1/users/email-preferences");
        return res.data.data;
    },
    updateEmailPreferences: async (emailCategories: Record<string, boolean>) => {
        const res = await api.put("/api/v1/users/email-preferences", { emailCategories });
        return res.data.data;
    }
};

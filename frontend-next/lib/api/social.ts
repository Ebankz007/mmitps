import api from '../api';

export interface SocialHandle {
    _id: string;
    platform: string;
    handle: string;
    url: string;
    category: 'Global' | 'Asian' | 'European' | 'Middle East' | 'African';
    icon: string;
    color: string;
    description?: string;
    order: number;
    isActive: boolean;
    connectionStatus?: 'Disconnected' | 'Connected' | 'Error';
    apiCredentials?: {
        webhookUrl?: string;
        channelId?: string;
        botToken?: string;
    };
}

export interface BroadcastGuardPreferences {
    autoPostPTDSignals: boolean;
    autoPostLogicAlerts: boolean;
    milestoneAlerts: boolean;
    enforceForensicMarking: boolean;
}

export interface GlobalBroadcastSettings {
    selectedSignals: string[];
    selectedContent: string[];
    destinations: Array<{
        socialHandleId: string;
        platform: string;
        language: string;
    }>;
}

export const socialService = {
    /**
     * Get all active social handles grouped by category
     */
    getHandles: async (): Promise<Record<string, SocialHandle[]>> => {
        const response = await api.get('/api/v1/social-handles');
        return response.data.data;
    },

    /**
     * Update user preferences (including Broadcast Guard)
     */
    updatePreferences: async (preferences: Partial<BroadcastGuardPreferences>) => {
        const response = await api.patch('/api/v1/users/update-preferences', { broadcastGuard: preferences });
        return response.data.data.broadcastGuard;
    },

    /**
     * Admin: Get Global Broadcast Settings
     */
    getGlobalBroadcastSettings: async (): Promise<GlobalBroadcastSettings> => {
        const response = await api.get('/api/v1/social-handles/broadcast-settings');
        return response.data.data;
    },

    /**
     * Admin: Update Global Broadcast Settings
     */
    updateGlobalBroadcastSettings: async (settings: Partial<GlobalBroadcastSettings>): Promise<GlobalBroadcastSettings> => {
        const response = await api.put('/api/v1/social-handles/broadcast-settings', settings);
        return response.data.data;
    },

    /**
     * Admin: Get all handles
     */
    getAllHandles: async (): Promise<SocialHandle[]> => {
        const response = await api.get('/api/v1/social-handles/admin');
        return response.data.data;
    },

    /**
     * Admin: Create/Update/Delete handles
     */
    createHandle: async (data: Partial<SocialHandle>) => {
        const response = await api.post('/api/v1/social-handles', data);
        return response.data.data;
    },
    updateHandle: async (id: string, data: Partial<SocialHandle>) => {
        const response = await api.patch(`/api/v1/social-handles/${id}`, data);
        return response.data.data;
    },
    deleteHandle: async (id: string) => {
        const response = await api.delete(`/api/v1/social-handles/${id}`);
        return response.data;
    }
};

import api from '@/lib/api';

export interface VolumetricAlert {
    id: number;
    instrument: string;
    metric: 'zScore' | 'volumeROC';
    operator: '>' | '<';
    threshold: number;
    isActive: boolean;
    createdAt: string;
}

export interface AlertHistory {
    id: number;
    instrument: string;
    metric: string;
    value: number;
    threshold: number;
    time: string;
}

export const alertAPI = {
    getAlerts: async (): Promise<{ alerts: VolumetricAlert[] }> => {
        const response = await api.get(`/api/v1/alerts`);
        return response.data.data;
    },

    createAlert: async (data: Partial<VolumetricAlert>): Promise<{ alert: VolumetricAlert }> => {
        const response = await api.post(`/api/v1/alerts`, data);
        return response.data.data;
    },

    toggleAlert: async (id: number): Promise<{ alert: VolumetricAlert }> => {
        const response = await api.patch(`/api/v1/alerts/${id}`);
        return response.data.data;
    },

    deleteAlert: async (id: number): Promise<void> => {
        await api.delete(`/api/v1/alerts/${id}`);
    },

    getHistory: async (): Promise<{ history: AlertHistory[] }> => {
        const response = await api.get(`/api/v1/alerts/history`);
        return response.data.data;
    }
};

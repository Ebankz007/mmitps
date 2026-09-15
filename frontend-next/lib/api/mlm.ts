import api from "../api";

export interface TreeNode {
    _id: string;
    user: {
        _id: string;
        username: string;
        name: string;
        rank: string;
    } | string;
    parent: string | null;
    leftChild: string | null;
    rightChild: string | null;
    position: 'left' | 'right' | 'root';
    depth: number;
    path: string;
    preferredPlacement?: 'left' | 'right';
    leftLegVolume?: number;
    rightLegVolume?: number;
    leftDescendantCount?: number;
    rightDescendantCount?: number;
    rank?: string;
    joinDate?: string;
    sponsor?: string;
}

export interface Rank {
    name: string;
    displayName: string;
    level: number;
    requirements: {
        personalSales?: number;
        teamSales?: number;
        directReferrals?: number;
        activeLegs?: number;
    };
    benefits: {
        commissionPercentage?: number;
        bonusAmount?: number;
    };
}

export interface RankProgress {
    currentRank: string;
    nextRank: string | null;
    percentage: number;
    requirements: {
        label: string;
        current: number;
        required: number;
        status: 'completed' | 'pending';
    }[];
}

export const mlmService = {
    // Genealogy
    getBinaryTree: async () => {
        try {
            const res = await api.get("/api/v1/mlm/binary");
            return res.data?.data ?? []; // This is a flat array of nodes in the downline
        } catch (error: any) {
            if (error.response?.status === 500 || error.response?.status === 404) return [];
            throw error;
        }
    },

    getSponsorTree: async () => {
        try {
            const res = await api.get("/api/v1/mlm/sponsor");
            return res.data?.data ?? [];
        } catch (error: any) {
            if (error.response?.status === 500 || error.response?.status === 404) return [];
            throw error;
        }
    },

    getLegSettings: async () => {
        const defaultLegSettings = {
            preferredPlacement: 'left' as 'left' | 'right',
            stats: { leftLegVolume: 0, rightLegVolume: 0, leftMembers: 0, rightMembers: 0 }
        };
        try {
            const res = await api.get("/api/v1/mlm/leg-settings");
            return (res.data?.data ?? defaultLegSettings) as typeof defaultLegSettings;
        } catch (error: any) {
            if (error.response?.status === 500 || error.response?.status === 404) return defaultLegSettings;
            throw error;
        }
    },

    updateLegSettings: async (preferredPlacement: 'left' | 'right') => {
        try {
            const res = await api.post("/api/v1/mlm/leg-settings", { preferredPlacement });
            return (res.data?.data ?? { preferredPlacement }) as { preferredPlacement: 'left' | 'right' };
        } catch (error: any) {
            if (error.response?.status === 500) return { preferredPlacement };
            throw error;
        }
    },

    // Ranks
    getRanks: async () => {
        try {
            const res = await api.get("/api/v1/mlm/ranks");
            return (res.data?.data ?? []) as Rank[];
        } catch (error: any) {
            if (error.response?.status === 500 || error.response?.status === 404) return [] as Rank[];
            throw error;
        }
    },

    getRankProgress: async () => {
        try {
            const res = await api.get("/api/v1/mlm/ranks/progress");
            const data = res.data.data;
            
            // Map backend's 'progress' object to the array format UI expects
            const reqs: any[] = [];
            let totalPercentage = 0;
            let reqCount = 0;

            if (data.progress) {
                const mapReq = (key: string, label: string) => {
                    const pItem = data.progress[key];
                    if (pItem && pItem.required > 0) {
                        reqs.push({
                            label,
                            current: pItem.current,
                            required: pItem.required,
                            status: pItem.met ? 'completed' : 'pending'
                        });
                        totalPercentage += pItem.percentage;
                        reqCount++;
                    }
                };
                
                mapReq('personalVolume', 'Personal Volume ($)');
                mapReq('groupVolume', 'Group Volume ($)');
                mapReq('leftLegVolume', 'Left Leg Volume ($)');
                mapReq('rightLegVolume', 'Right Leg Volume ($)');
                mapReq('directReferrals', 'Direct Referrals');
                mapReq('activeDirects', 'Active Directs');
            }

            const overallPercentage = reqCount > 0 ? Math.round(totalPercentage / reqCount) : 100;

            return {
                currentRank: data.currentRank,
                nextRank: data.nextRank,
                atMaxRank: data.atMaxRank || false,
                percentage: data.atMaxRank ? 100 : overallPercentage,
                requirements: reqs
            } as RankProgress;

        } catch (error: any) {
            if (error.response?.status === 404) {
                // Return default unranked state instead of throwing 404
                return {
                    currentRank: 'Starter',
                    nextRank: 'Associate',
                    percentage: 0,
                    requirements: [
                        { label: 'Personal Volume ($)', current: 0, required: 100, status: 'pending' },
                        { label: 'Direct Referrals', current: 0, required: 2, status: 'pending' }
                    ]
                } as RankProgress;
            }
            throw error;
        }
    },

    getRankHistory: async () => {
        try {
            const res = await api.get("/api/v1/mlm/rank-history");
            return res.data?.data ?? [];
        } catch (error: any) {
            if (error.response?.status === 500 || error.response?.status === 404) return [];
            throw error;
        }
    }
};

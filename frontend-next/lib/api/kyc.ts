import api from "../api";

export interface KYCDocument {
    _id: string;
    type: string;
    number: string;
    filePath: string;
    status: "pending" | "approved" | "rejected";
    adminComment?: string;
    createdAt: string;
}

export interface KYCStatus {
    status: "none" | "pending" | "approved" | "rejected";
    documents: KYCDocument[];
    lastReviewedAt?: string;
    lastComment?: string;
}

export const kycService = {
    getStatus: async () => {
        const res = await api.get("/api/v1/kyc/status");
        return res.data.data as KYCStatus;
    },
    submitDocument: async (formData: FormData) => {
        const res = await api.post("/api/v1/kyc/documents", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return res.data.data as KYCDocument;
    },
    getMyDocuments: async () => {
        const res = await api.get("/api/v1/kyc/documents");
        return res.data.data as KYCDocument[];
    }
};

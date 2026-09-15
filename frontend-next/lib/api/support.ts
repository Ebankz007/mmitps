import api from "../api";

export interface SupportTicket {
    _id: string;
    subject: string;
    description: string;
    category: "technical" | "billing" | "account" | "mlm" | "other" | "general" | "deposit" | "withdrawal" | "trading" | "kyc";
    priority: "low" | "medium" | "high" | "urgent" | "normal";
    status: "open" | "in_progress" | "resolved" | "closed" | "waiting_customer" | "waiting_internal" | "liquidated";
    user: {
        _id: string;
        username?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
    };
    ticketNumber?: string;
    replies: TicketReply[];
    createdAt: string;
    updatedAt: string;
}

export interface TicketReply {
    _id: string;
    user: {
        _id: string;
        firstName: string;
        lastName: string;
        role: string;
    };
    message: string;
    isAdmin: boolean;
    createdAt: string;
}

export const supportService = {
    // Helper to transform backend Ticket format to frontend expected format
    _transformTicket: (rawTicket: any): SupportTicket => {
        if (!rawTicket) return rawTicket;
        
        // The backend uses a "messages" array where the first item is the initial description
        const messages = rawTicket.messages || [];
        const initialMessage = messages.length > 0 ? messages[0].message : "";
        const repliesData = messages.length > 1 ? messages.slice(1) : [];

        const replies: TicketReply[] = repliesData.map((rep: any) => ({
            _id: rep._id,
            user: rep.sender ? {
                _id: rep.sender._id || rep.sender,
                firstName: rep.sender.firstName || 'Support',
                lastName: rep.sender.lastName || 'Agent',
                role: rep.senderType === 'agent' ? 'admin' : 'user'
            } : { _id: 'unknown', firstName: 'Unknown', lastName: '', role: 'user' },
            message: rep.message,
            isAdmin: rep.senderType === 'agent' || rep.senderType === 'system',
            createdAt: rep.createdAt
        }));

        return {
            ...rawTicket,
            description: initialMessage,
            replies,
        } as SupportTicket;
    },

    createTicket: async (data: { subject: string; description: string; category: string; priority: string }) => {
        // Backend expects 'message', but frontend form holds 'description'
        const payload = {
            subject: data.subject,
            category: data.category,
            priority: data.priority,
            message: data.description
        };
        const response = await api.post("/api/v1/support", payload);
        return supportService._transformTicket(response.data.data);
    },

    getMyTickets: async () => {
        const response = await api.get("/api/v1/support");
        const tickets = response.data.data || [];
        return tickets.map((t: any) => supportService._transformTicket(t));
    },

    getTicket: async (id: string) => {
        const response = await api.get(`/api/v1/support/${id}`);
        return supportService._transformTicket(response.data.data);
    },

    replyToTicket: async (id: string, message: string) => {
        const response = await api.post(`/api/v1/support/${id}/reply`, { message });
        return supportService._transformTicket(response.data.data);
    },

    closeTicket: async (id: string) => {
        const response = await api.put(`/api/v1/support/${id}/close`);
        return supportService._transformTicket(response.data.data);
    },

    // --- Admin Endpoints ---
    getAdminTickets: async () => {
        const response = await api.get("/api/v1/support/admin/all");
        const tickets = response.data.data || [];
        return tickets.map((t: any) => supportService._transformTicket(t));
    },

    adminReplyToTicket: async (id: string, message: string, isInternal: boolean = false) => {
        const response = await api.post(`/api/v1/support/admin/${id}/reply`, { message, isInternal });
        return supportService._transformTicket(response.data.data);
    },

    adminUpdateTicketStatus: async (id: string, status: string) => {
        const response = await api.put(`/api/v1/support/admin/${id}/status`, { status });
        return supportService._transformTicket(response.data.data);
    },

    adminAddInternalNote: async (id: string, note: string) => {
        const response = await api.post(`/api/v1/support/admin/${id}/note`, { note });
        return supportService._transformTicket(response.data.data);
    }
};

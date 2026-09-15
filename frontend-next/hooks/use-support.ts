"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supportService, SupportTicket } from "@/lib/api/support";

export const useSupport = () => {
    const queryClient = useQueryClient();

    const useTickets = () => {
        return useQuery({
            queryKey: ["tickets"],
            queryFn: () => supportService.getMyTickets(),
        });
    };

    const useTicketDetails = (id: string) => {
        return useQuery({
            queryKey: ["tickets", id],
            queryFn: () => supportService.getTicket(id),
            enabled: !!id,
        });
    };

    const createTicketMutation = useMutation({
        mutationFn: (data: { subject: string; description: string; category: string; priority: string }) =>
            supportService.createTicket(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
        },
    });

    const replyMutation = useMutation({
        mutationFn: ({ id, message }: { id: string; message: string }) =>
            supportService.replyToTicket(id, message),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ["tickets", variables.id] });
        },
    });

    const closeMutation = useMutation({
        mutationFn: (id: string) => supportService.closeTicket(id),
        onSuccess: (_, id) => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["tickets", id] });
        },
    });

    return {
        useTickets,
        useTicketDetails,
        createTicket: createTicketMutation,
        reply: replyMutation,
        close: closeMutation,
    };
};

"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "@/lib/api/user";
import { kycService } from "@/lib/api/kyc";

export const useUser = () => {
    const queryClient = useQueryClient();

    const useProfile = () => {
        return useQuery({
            queryKey: ["user", "profile"],
            queryFn: () => userService.getProfile(),
        });
    };

    const updateProfileMutation = useMutation({
        mutationFn: (data: any) => userService.updateProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        },
    });

    const updatePreferencesMutation = useMutation({
        mutationFn: (preferences: any) => userService.updatePreferences(preferences),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
        },
    });

    const changePasswordMutation = useMutation({
        mutationFn: (data: { currentPassword: string; newPassword: string }) =>
            userService.changePassword(data.currentPassword, data.newPassword),
    });

    return {
        useProfile,
        updateProfile: updateProfileMutation,
        updatePreferences: updatePreferencesMutation,
        changePassword: changePasswordMutation,
    };
};

export const useKYC = () => {
    const queryClient = useQueryClient();

    const useStatus = () => {
        return useQuery({
            queryKey: ["user", "kyc-status"],
            queryFn: () => kycService.getStatus(),
        });
    };

    const submitDocumentMutation = useMutation({
        mutationFn: (formData: FormData) => kycService.submitDocument(formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["user", "kyc-status"] });
        },
    });

    return {
        useStatus,
        submitDocument: submitDocumentMutation,
    };
};

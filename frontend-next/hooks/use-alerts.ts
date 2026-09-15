import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alertAPI, VolumetricAlert } from "@/lib/api/alerts";
import { toast } from "sonner";

export const useVolumetricAlerts = () => {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: ["vmid-alerts"],
        queryFn: () => alertAPI.getAlerts()
    });

    const createMutation = useMutation({
        mutationFn: (data: Partial<VolumetricAlert>) => alertAPI.createAlert(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vmid-alerts"] });
            toast.success("Volumetric alert created successfully!");
        },
        onError: () => toast.error("Failed to create alert.")
    });

    const toggleMutation = useMutation({
        mutationFn: (id: number) => alertAPI.toggleAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vmid-alerts"] });
            toast.success("Alert status updated.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => alertAPI.deleteAlert(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vmid-alerts"] });
            toast.success("Alert deleted.");
        }
    });

    return {
        ...query,
        createAlert: createMutation.mutate,
        toggleAlert: toggleMutation.mutate,
        deleteAlert: deleteMutation.mutate,
        isCreating: createMutation.isPending
    };
};

export const useAlertHistory = () => {
    return useQuery({
        queryKey: ["alert-history"],
        queryFn: () => alertAPI.getHistory()
    });
};

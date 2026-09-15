import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { educationService } from "@/lib/api/education";

export function useCourses() {
    return useQuery({
        queryKey: ["courses"],
        queryFn: () => educationService.getCourses(),
    });
}

export function useCourse(slug: string) {
    return useQuery({
        queryKey: ["course", slug],
        queryFn: () => educationService.getCourseBySlug(slug),
        enabled: !!slug,
    });
}

export function useUserProgress() {
    return useQuery({
        queryKey: ["education-progress"],
        queryFn: () => educationService.getMyProgress(),
    });
}

export function useEnrollCourse() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (courseId: string) => educationService.enrollInCourse(courseId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["education-progress"] });
            queryClient.invalidateQueries({ queryKey: ["courses"] });
        },
    });
}

export function useEducationStats() {
    return useQuery({
        queryKey: ["education-stats"],
        queryFn: () => educationService.getLearningStats(),
    });
}

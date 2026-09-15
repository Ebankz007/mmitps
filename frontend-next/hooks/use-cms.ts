import { useQuery } from "@tanstack/react-query";
import { cmsService } from "@/lib/api/cms";

export function useLatestNews(category?: string) {
    return useQuery({
        queryKey: ["news", category],
        queryFn: () => cmsService.getLatestNews(category),
    });
}

export function useArticle(slug: string) {
    return useQuery({
        queryKey: ["article", slug],
        queryFn: () => cmsService.getArticle(slug),
        enabled: !!slug,
    });
}

export function useContentBlock(slug: string) {
    return useQuery({
        queryKey: ["content-block", slug],
        queryFn: () => cmsService.getContentBlock(slug),
        enabled: !!slug,
    });
}

export function useFaqs() {
    return useQuery({
        queryKey: ["faqs"],
        queryFn: () => cmsService.getFaqs(),
    });
}

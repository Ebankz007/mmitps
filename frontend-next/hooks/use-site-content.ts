import { useQuery } from "@tanstack/react-query";
import { siteContentService, SiteSection } from "@/lib/api/site-content";

/**
 * Fetch all active content sections for a page.
 * Returns an empty array if the page has no content yet (fallback to hardcoded).
 */
export function usePageContent(page: string) {
    return useQuery({
        queryKey: ["site-content", page],
        queryFn: () => siteContentService.getPageContent(page),
        staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        placeholderData: (prev) => prev, // Keep previous data during refetch
    });
}

/**
 * Helper to get a section's data by slug from a page's content array.
 */
export function getSectionData(sections: SiteSection[] | undefined, slug: string): Record<string, any> | null {
    if (!sections) return null;
    const section = sections.find(s => s.slug === slug);
    return section?.data ?? null;
}

/**
 * Fetch a single section by slug.
 */
export function useSiteSection(slug: string) {
    return useQuery({
        queryKey: ["site-section", slug],
        queryFn: () => siteContentService.getSectionBySlug(slug),
        enabled: !!slug,
        staleTime: 5 * 60 * 1000,
    });
}

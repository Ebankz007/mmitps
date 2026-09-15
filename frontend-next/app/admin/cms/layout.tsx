"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FileText, Menu, Image, Activity } from "lucide-react";

const CMS_NAV = [
    { label: "Overview", href: "/admin/cms", icon: LayoutDashboard },
    { label: "Pages", href: "/admin/cms/pages", icon: FileText },
    { label: "Menus", href: "/admin/cms/menus", icon: Menu },
    { label: "Media Gallery", href: "/admin/cms/media", icon: Image },
    { label: "Site Health", href: "/admin/cms/health", icon: Activity },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="space-y-6">
            <div className="flex border-b border-[var(--color-border)] gap-8">
                {CMS_NAV.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-2 px-1 py-4 text-xs font-bold uppercase tracking-widest transition-all border-b-2 ${isActive
                                    ? "text-[#10b981] border-[#10b981]"
                                    : "text-[var(--color-text-secondary)] border-transparent hover:text-[var(--color-text-secondary)]"
                                }`}
                        >
                            <Icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </div>
            <div>{children}</div>
        </div>
    );
}

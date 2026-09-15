"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useLanguage } from "@/lib/language-context";
import { useState, useEffect } from "react";
import { useUser } from "@/hooks/use-user";
import { Logo } from "@/components/layout/Logo";
import {
    GripVertical,
    LayoutDashboard,
    Users,
    CreditCard,
    ClipboardList,
    Building2,
    Search,
    Wallet,
    Wrench,
    Radio,
    Rocket,
    RefreshCw,
    Waves,
    Landmark,
    Newspaper,
    Activity,
    Headphones,
    Mail,
    Gift,
    Settings,
    Globe,
    HelpCircle,
} from "lucide-react";

// DND Kit Imports
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { restrictToVerticalAxis, restrictToWindowEdges } from '@dnd-kit/modifiers';

// ─── Nav Item Types ───────────────────────────────────────────────────────────
interface NavItem {
    label: string;
    href: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
}

const INITIAL_NAV_ITEMS: NavItem[] = [
    { label: "Return to Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "overview", href: "/admin", icon: Activity },
    { label: "usermanagement", href: "/admin/users", icon: Users },
    { label: "subscriptions", href: "/admin/subscriptions", icon: CreditCard },
    { label: "systemplans", href: "/admin/plans", icon: ClipboardList },
    { label: "menumanagement", href: "/admin/menu-management", icon: Building2 },
    { label: "kycqueue", href: "/admin/kyc", icon: Search },
    { label: "payments", href: "/admin/payments", icon: Wallet },
    { label: "services", href: "/admin/services", icon: Wrench },
    { label: "broadcastrouting", href: "/admin/broadcast-guard", icon: Radio },
    { label: "apisconfiguration", href: "/admin/api-config", icon: Rocket },
    { label: "copytrading", href: "/admin/copy-trading", icon: RefreshCw },
    { label: "poolmanagement", href: "/admin/pools", icon: Waves },
    { label: "financialconfig", href: "/admin/settings/financial", icon: Landmark },
    { label: "contentmanagement", href: "/admin/cms", icon: Newspaper },
    { label: "systemhealth", href: "/admin/cms/health", icon: Activity },
    { label: "supportdesk", href: "/admin/support", icon: Headphones },
    { label: "emailmanagement", href: "/admin/email", icon: Mail },
    { label: "bonusmanagement", href: "/admin/bonuses", icon: Gift },
    { label: "settings", href: "/admin/settings", icon: Settings },
    { label: "georestrictions", href: "/admin/settings/geo", icon: Globe },
    { label: "faqmanager", href: "/admin/cms/help-center", icon: HelpCircle },
];


function SortableAdminNavItem({ item, isActive, t }: { item: NavItem, isActive: boolean, t: (s: string) => string }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: item.label });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "9px 1.5rem",
        fontSize: "13px",
        fontWeight: isActive ? 600 : 400,
        color: isActive
            ? "var(--color-brand)"
            : "var(--color-text-secondary)",
        background: isActive
            ? "var(--color-brand-dim, rgba(16, 185, 129,0.1))"
            : "transparent",
        borderLeft: isActive
            ? "2px solid var(--color-brand)"
            : "2px solid transparent",
        textDecoration: "none",
        opacity: isDragging ? 0.5 : 1,
        position: 'relative' as const,
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div ref={setNodeRef} style={style} className="group">
            <div 
                {...attributes} 
                {...listeners}
                style={{
                    position: 'absolute',
                    left: '4px',
                    opacity: 0,
                    cursor: 'grab',
                    padding: '4px'
                }}
                className="group-hover:opacity-40 hover:!opacity-100 transition-opacity"
            >
                <GripVertical size={12} />
            </div>
            <Link
                href={item.href}
                style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    width: "100%",
                    color: "inherit",
                    textDecoration: "none"
                }}
            >
                <item.icon size={14} className="opacity-90" />
                {t(item.label)}
            </Link>
        </div>
    );
}

export default function AdminSidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const { useProfile, updatePreferences } = useUser();
    const { data: profile } = useProfile();
    
    const [navItems, setNavItems] = useState<NavItem[]>(INITIAL_NAV_ITEMS);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        const savedOrder = (profile?.preferences as any)?.adminNavigationOrder as string[];
        if (savedOrder && Array.isArray(savedOrder)) {
            const reorderedNav = [...INITIAL_NAV_ITEMS].sort((a, b) => {
                const indexA = savedOrder.indexOf(a.label);
                const indexB = savedOrder.indexOf(b.label);
                return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
            });
            setNavItems(reorderedNav);
        }
    }, [profile]);

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = navItems.findIndex(i => i.label === active.id);
            const newIndex = navItems.findIndex(i => i.label === over.id);
            const newItems = arrayMove(navItems, oldIndex, newIndex);
            
            // 1. Update local state immediately for UI responsiveness
            setNavItems(newItems);
            
            // 2. Persist to backend outside the state updater
            updatePreferences.mutate({ 
                adminNavigationOrder: newItems.map(i => i.label) 
            });
        }
    };

    return (
        <aside
            style={{
                width: "var(--sidebar-width, 240px)",
                minHeight: "100vh",
                background: "var(--color-surface)",
                borderRight: "1px solid var(--color-border)",
                display: "flex",
                flexDirection: "column",
                position: "fixed",
                top: 0,
                left: 0,
                zIndex: 50,
            }}
        >
            {/* ── Brand ── */}
            <Link
                href="/"
                style={{
                    padding: "1.25rem 1.5rem",
                    borderBottom: "1px solid var(--color-border)",
                    textDecoration: "none",
                    display: "block"
                }}
            >
                <Logo size="sm" hideSubtext />
            </Link>

            {/* ── Navigation ── */}
            <nav style={{ flex: 1, padding: "1rem 0", overflowY: "auto" }}>
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                    modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                >
                    <SortableContext
                        items={navItems.map(i => i.label)}
                        strategy={verticalListSortingStrategy}
                    >
                        {navItems.map((item) => {
                            const isActive =
                                item.href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname.startsWith(item.href);

                            return (
                                <SortableAdminNavItem 
                                    key={item.label} 
                                    item={item} 
                                    isActive={isActive} 
                                    t={t} 
                                />
                            );
                        })}
                    </SortableContext>
                </DndContext>
            </nav>

            {/* ── User Info + Logout ── */}
            <div
                style={{
                    padding: "1rem 1.5rem",
                    borderTop: "1px solid var(--color-border)",
                }}
            >
                {user && (
                    <p
                        style={{
                            fontSize: "11px",
                            color: "var(--color-text-muted)",
                            marginBottom: "8px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {user.email}
                    </p>
                )}
                <button
                    onClick={() => logout()}
                    style={{
                        width: "100%",
                        padding: "8px 12px",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "var(--color-text-secondary)",
                        background: "transparent",
                        border: "1px solid var(--color-border)",
                        borderRadius: "2px",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                    }}
                    onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444";
                        (e.currentTarget as HTMLButtonElement).style.color = "#ef4444";
                    }}
                    onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--color-border)";
                        (e.currentTarget as HTMLButtonElement).style.color = "var(--color-text-secondary)";
                    }}
                >
                    ← Sign Out
                </button>
            </div>
        </aside>
    );
}

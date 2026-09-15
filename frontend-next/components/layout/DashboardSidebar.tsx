"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, useCallback } from "react";
import {
    Home,
    Share2,
    Wallet,
    Users,
    TrendingUp,
    Newspaper,
    GraduationCap,
    BookOpen,
    PenTool,
    Calendar,
    HelpCircle,
    Briefcase,
    User,
    ShieldCheck,
    Lock,
    ChevronDown,
    ChevronRight,
    Circle,
    Brain,
    LineChart,
    BarChart3,
    Book,
    Gamepad2,
    Tv,
    Coins,
    Server,
    Eye,
    Target,
    Activity,
    FileSearch,
    Compass,
    Clock,
    Copy,
    GripVertical
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Logo as BrandLogo } from "./Logo";
import { useLanguage } from "@/lib/language-context";
import { useUser } from "@/hooks/use-user";

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

interface NavItem {
    label: string;
    icon?: React.ElementType;
    href?: string;
    submenu?: NavItem[];
    role?: string[];
    serviceKey?: string;
}

const INITIAL_NAV: NavItem[] = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Social Handles", icon: Share2, href: "/dashboard/social" },
    {
        label: "Financial",
        icon: Wallet,
        href: "/dashboard/financial",
        submenu: [
            { label: "My Wallet", href: "/dashboard/financial/wallet" },
            { label: "Deposit Wallet", href: "/dashboard/financial/deposit" },
            { label: "Fund Transfer", href: "/dashboard/financial/transfer" },
            { label: "Request Payout", href: "/dashboard/financial/payout" },
            { label: "Purchase", href: "/dashboard/financial/purchase" },
            { label: "My Coupons", href: "/dashboard/financial/coupons" },
            { label: "Bonuses & Rewards", href: "/dashboard/bonuses" },
        ]
    },
    {
        label: "Genealogy",
        icon: Users,
        href: "/dashboard/genealogy/binary",
        submenu: [
            { label: "Binary", href: "/dashboard/genealogy/binary" },
            { label: "Sponsor", href: "/dashboard/genealogy/sponsor" },
            { label: "Tree", href: "/dashboard/genealogy/tree" },
            { label: "List", href: "/dashboard/genealogy/list" },
            { label: "Rank Dashboard", href: "/dashboard/genealogy/rank" },
            { label: "Leg Settings", href: "/dashboard/genealogy/settings" },
        ]
    },
    {
        label: "Markets",
        icon: TrendingUp,
        submenu: [
            { label: "Forex", href: "/dashboard/markets/forex" },
            { label: "Commodities", href: "/dashboard/markets/commodities" },
            { label: "Indices", href: "/dashboard/markets/indices" },
            { label: "Crypto", href: "/dashboard/markets/crypto" },
            { label: "Stocks", href: "/dashboard/markets/stocks" },
            { label: "Bonds", href: "/dashboard/markets/bonds" },
            { label: "Synthetics", href: "/dashboard/markets/synthetics" },
            { label: "Real Estate", href: "/dashboard/markets/real-estate" },
        ]
    },
    {
        label: "News Calendar",
        icon: Newspaper,
        submenu: [
            { label: "Forex Calendar", href: "/dashboard/news/forex" },
            { label: "Metals Calendar", href: "/dashboard/news/metals" },
            { label: "Energy Calendar", href: "/dashboard/news/energy" },
            { label: "Crypto Calendar", href: "/dashboard/news/crypto" },
            { label: "Coin Market Caps", href: "/dashboard/news/market-caps" },
        ]
    },
    {
        label: "Education",
        icon: GraduationCap,
        href: "/dashboard/education",
        submenu: [
            { label: "Education Hub", href: "/dashboard/education" },
            { label: "Courses", href: "/dashboard/education/courses" },
            { label: "Learning Tracks", href: "/dashboard/education/tracks" },
            { label: "Speed Run", href: "/dashboard/education/speed-run" },
            { label: "Video Library", href: "/dashboard/education/videos" },
            { label: "PDF Library", href: "/dashboard/education/pdf" },
        ]
    },
    {
        label: "Resources",
        icon: BookOpen,
        href: "/dashboard/resources",
        submenu: [
            {
                label: "Global Macro",
                icon: Compass,
                href: "/dashboard/resources/macro",
                serviceKey: "macro",
                submenu: [
                    { label: "Fundamental Strength", href: "/dashboard/resources/macro/strength" },
                    { label: "News Trading", href: "/dashboard/resources/macro/news" },
                    { label: "Currency Outlook", href: "/dashboard/resources/macro/outlook" },
                    { label: "Trigger Sheet", href: "/dashboard/resources/macro/trigger" },
                ]
            },
            {
                label: "COT Data",
                icon: LineChart,
                href: "/dashboard/resources/cot",
                serviceKey: "cot",
                submenu: [
                    { label: "EDUCATIONAL GUIDE", href: "/dashboard/resources/cot" },
                    { label: "COT Intelligence Pro Max", href: "/dashboard/resources/cot/pro-max" },
                    { label: "COT Global Data", href: "/dashboard/resources/cot/global" },
                    { label: "COT Simplified", href: "/dashboard/resources/cot/simplified" },
                ]
            },
            {
                label: "Seasonality",
                icon: Calendar,
                serviceKey: "seasonality",
                submenu: [
                    { label: "Seasonal Heat Map", href: "/dashboard/resources/seasonality/heatmap" },
                    { label: "ProView Seasonality", href: "/dashboard/resources/seasonality/proview" },
                    { label: "Seasonal Planner", href: "/dashboard/resources/seasonality/planner" },
                    { label: "Seasonality Pro Max", href: "/dashboard/resources/seasonality/pro-max" },
                ]
            },
            {
                label: "Contract Specs",
                icon: FileSearch,
                serviceKey: "contracts",
                submenu: [
                    { label: "Contract Specs EduHub", href: "/dashboard/resources/contracts/eduhub" },
                    { label: "Contract Calendar", href: "/dashboard/resources/contracts/calendar" },
                    { label: "Contract Heat Map", href: "/dashboard/resources/contracts/heatmap" },
                    { label: "Contract Planner", href: "/dashboard/resources/contracts/planner" },
                ]
            },
            {
                label: "Quantitative Methodology",
                icon: Target,
                serviceKey: "quant",
                submenu: [
                    { label: "Quant eduguide", href: "/dashboard/resources/quant/eduguide" },
                    { label: "Calculators", href: "/dashboard/resources/quant/calculators" },
                    { label: "Tools", href: "/dashboard/resources/quant/tools" },
                    { label: "Strategies", href: "/dashboard/resources/quant/strategies" },
                ]
            },
            {
                label: "Geometry Intelligence",
                icon: Activity,
                serviceKey: "geometry",
                submenu: [
                    { label: "GeoEdu guide", href: "/dashboard/resources/geometry" },
                    { label: "Geometry Pro Max", href: "/dashboard/resources/geometry/pro-max" },
                    { label: "Chart & Candle Patterns", href: "/dashboard/resources/geometry/patterns" },
                ]
            },
            {
                label: "MMITPS-VMID PRO",
                icon: BarChart3,
                href: "/dashboard/resources/vmid",
                serviceKey: "vmid",
                submenu: [
                    { label: "EDUCATIONAL GUIDE", href: "/dashboard/resources/vmid" },
                    { label: "VOLUMETRIC DASHBOARD", href: "/dashboard/resources/vmid/pro" },
                    { label: "CORRELATION MATRIX", href: "/dashboard/resources/vmid/correlation" },
                ]
            },
            {
                label: "MMITPS-PTD PRO",
                icon: Clock,
                href: "/dashboard/resources/ptd",
                serviceKey: "ptd",
                submenu: [
                    { label: "EDUCATIONAL GUIDE", href: "/dashboard/resources/ptd" },
                    { label: "PREDICTIVE DASHBOARD", href: "/dashboard/resources/ptd/pro" },
                ]
            },
            {
                label: "Sentimental Methodology",
                icon: Eye,
                serviceKey: "sentiment",
                submenu: [
                    { label: "Retail Sentiment", href: "/dashboard/resources/sentiment/retail" },
                    { label: "Institutions Sentiment", href: "/dashboard/resources/sentiment/institutional" },
                ]
            },
            { label: "AI Agent Analyst", icon: Brain, href: "/dashboard/resources/ai-analyst", serviceKey: "ai-analyst" },
            { label: "Trade Journal", icon: Book, href: "/dashboard/resources/journal", serviceKey: "journal" },
            {
                label: "TradeControl Panel",
                icon: Gamepad2,
                serviceKey: "tcp",
                submenu: [
                    { label: "Active Positions", href: "/dashboard/resources/tcp/positions" },
                    { label: "Order Control", href: "/dashboard/resources/tcp/orders" },
                    { label: "Algo & Scanner", href: "/dashboard/resources/tcp/algo" },
                    { label: "Emergency Controls", href: "/dashboard/resources/tcp/emergency" },
                    { label: "Analytics & AI", href: "/dashboard/resources/tcp/analytics" },
                ]
            },
            {
                label: "Copy Trading",
                icon: Copy,
                href: "/dashboard/resources/copy-trading",
            },
            { label: "Live Stream", icon: Tv, href: "/dashboard/resources/livestream", serviceKey: "livestream" },
            {
                label: "Tokenization Pool",
                icon: Coins,
                serviceKey: "token-pool",
                submenu: [
                    { label: "All Pools", href: "/dashboard/resources/token-pool/all" },
                    { label: "My Portfolio", href: "/dashboard/resources/token-pool/portfolio" },
                    { label: "Analytics", href: "/dashboard/resources/token-pool/analytics" },
                    { label: "Insurance", href: "/dashboard/resources/token-pool/insurance" },
                ]
            },
            { label: "VPS Station", icon: Server, href: "/dashboard/resources/vps", serviceKey: "vps" },
        ]
    },
    { label: "Blogs", icon: PenTool, href: "/dashboard/support/blogs" },
    { label: "Events", icon: Calendar, href: "/dashboard/support/events" },
    {
        label: "Help Hub",
        icon: HelpCircle,
        href: "/dashboard/help-center",
        submenu: [
            { label: "Help Center", href: "/dashboard/help-center" },
            { label: "Support Tickets", href: "/dashboard/support/tickets" },
        ]
    },
    { label: "Portfolio", icon: Briefcase, href: "/dashboard/portfolio" },
    { label: "KYC Verification", icon: ShieldCheck, href: "/dashboard/kyc" },
    {
        label: "Profile",
        icon: User,
        href: "/dashboard/profile",
        submenu: [
            { label: "My Profile", href: "/dashboard/profile" },
            { label: "Alert Settings", href: "/dashboard/settings/alerts" },
            { label: "Admin Setting", href: "/admin/settings", role: ["super_admin"] },
        ]
    },
    {
        label: "Administration",
        icon: Lock,
        role: ["admin", "super_admin"],
        submenu: [
            { label: "User Management", href: "/admin/users" },
            { label: "System Plans", href: "/admin/plans" },
            { label: "Subscriptions", href: "/admin/subscriptions" },
            { label: "Social Management", href: "/admin/social-handles" },
            { label: "Broadcast Guard", href: "/admin/broadcast-guard" },
            { label: "APIs Configuration", href: "/admin/api-config" },
            { label: "Settings", href: "/admin/settings" },
        ]
    }
];

interface SortableNavItemProps {
    item: NavItem;
    depth?: number;
    openMenus: Record<string, boolean>;
    toggleMenu: (label: string) => void;
    pathname: string;
    userRole: string;
    activeServices: string[];
    t: (s: string) => string;
    onSubmenuDragEnd: (parentLabel: string, event: DragEndEvent) => void;
    sensors: ReturnType<typeof useSensors>;
}

function SortableNavItem({
    item,
    depth = 0,
    openMenus,
    toggleMenu,
    pathname,
    userRole,
    activeServices,
    t,
    onSubmenuDragEnd,
    sensors
}: SortableNavItemProps) {

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
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 50 : 'auto',
    };

    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isOpen = openMenus[item.label];
    const isActive = item.href ? (item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href)) : false;
    const isAdmin = ["admin", "super_admin"].includes(userRole);

    if (item.role && !item.role.includes(userRole)) return null;
    if (item.serviceKey && !isAdmin && !activeServices?.includes(item.serviceKey)) return null;

    const Icon = item.icon;

    return (
        <div ref={setNodeRef} style={style} className="w-full relative group/item">
            <div
                className={cn(
                    "group flex items-center px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none",
                    isActive ? "text-[var(--color-text-primary)] bg-brand-500 shadow-lg shadow-brand-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[var(--color-surface-2)]",
                    depth > 0 && "pl-12"
                )}
                onClick={() => hasSubmenu && toggleMenu(item.label)}
            >
                {/* Drag Handle */}
                <div 
                    {...attributes} 
                    {...listeners}
                    className="absolute left-1 opacity-0 group-hover/item:opacity-40 hover:!opacity-100 cursor-grab active:cursor-grabbing p-1 -ml-1 transition-opacity"
                >
                    <GripVertical className="h-3 w-3" />
                </div>

                {Icon && <Icon className={cn("mr-3 h-4 w-4", isActive ? "text-[var(--color-text-primary)]" : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300")} />}
                {!Icon && depth > 0 && <Circle className={cn("mr-3 h-1.5 w-1.5", isActive ? "fill-white text-[var(--color-text-primary)]" : "text-gray-300 dark:text-gray-600")} />}

                {item.href ? (
                    <Link href={item.href} className="flex-1">{t(item.label.toLowerCase().replace(/\s+/g, ''))}</Link>
                ) : (
                    <span className="flex-1">{t(item.label.toLowerCase().replace(/\s+/g, ''))}</span>
                )}

                {hasSubmenu && (
                    isOpen ? <ChevronDown className="h-3 w-3 ml-2" /> : <ChevronRight className="h-3 w-3 ml-2" />
                )}
            </div>

            {hasSubmenu && isOpen && (
                <div className="bg-gray-50 dark:bg-black/20">
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) => onSubmenuDragEnd(item.label, event)}
                        modifiers={[restrictToVerticalAxis, restrictToWindowEdges]}
                    >
                        <SortableContext
                            items={item.submenu!.map(s => s.label)}
                            strategy={verticalListSortingStrategy}
                        >
                            {item.submenu!.map(sub => (
                                <SortableNavItem
                                    key={sub.label}
                                    item={sub}
                                    depth={depth + 1}
                                    openMenus={openMenus}
                                    toggleMenu={toggleMenu}
                                    pathname={pathname}
                                    userRole={userRole}
                                    activeServices={activeServices}
                                    t={t}
                                    onSubmenuDragEnd={onSubmenuDragEnd}
                                    sensors={sensors}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

export function DashboardSidebar() {
    const pathname = usePathname();
    const { user } = useAuth();
    const { t } = useLanguage();
    const { useProfile, updatePreferences } = useUser();
    const { data: profile } = useProfile();
    
    const [navItems, setNavItems] = useState<NavItem[]>(INITIAL_NAV);
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    // Apply saved order recursively
    const applyOrderRecursively = useCallback((items: NavItem[], savedOrder: Record<string, unknown> | null): NavItem[] => {
        if (!savedOrder) return items;

        const mainOrder = (savedOrder.main as string[]) || [];
        const subOrders = (savedOrder.submenus as Record<string, string[]>) || {};

        // Sort current level
        const sorted = [...items].sort((a, b) => {
            const indexA = mainOrder.indexOf(a.label);
            const indexB = mainOrder.indexOf(b.label);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });

        // Recurse into submenus
        return sorted.map(item => {
            if (item.submenu) {
                // If this specific item has its own saved submenu order in suborders
                // we treat it similarly to 'main' for its children
                const itemSubOrder = subOrders[item.label] || [];
                const itemSortedSubmenu = [...item.submenu].sort((a, b) => {
                    const indexA = itemSubOrder.indexOf(a.label);
                    const indexB = itemSubOrder.indexOf(b.label);
                    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                });

                return {
                    ...item,
                    submenu: applyOrderRecursively(itemSortedSubmenu, savedOrder)
                };
            }
            return item;
        });
    }, []);

    // Load saved navigation order and apply filtering
    useEffect(() => {
        if (!mounted) return;
        const profileData = profile as unknown as Record<string, Record<string, unknown>>;
        const savedOrder = profileData?.preferences?.navigationOrder as Record<string, unknown> | null;
        const allowedMenus = (profileData?.plan as unknown as Record<string, string[]>)?.allowedMenus || [];
        const isAdmin = ["admin", "super_admin"].includes(user?.role || "");

        // Recursive filtering function
        const filterItems = (items: NavItem[]): NavItem[] => {
            return items
                .filter(item => {
                    // Admins see everything
                    if (isAdmin) return true;
                    
                    // If plan has allowedMenus, check if this item is in it
                    // If allowedMenus is empty/undefined, we might want to show everything by default or nothing
                    // Let's assume if it exists, it's a whitelist.
                    if (allowedMenus.length > 0) {
                        return allowedMenus.includes(item.label);
                    }

                    return true; // Default to showing if no restrictions defined
                })
                .map(item => ({
                    ...item,
                    submenu: item.submenu ? filterItems(item.submenu) : undefined
                }));
        };

        const baseNav = filterItems(INITIAL_NAV);

        if (savedOrder) {
            setNavItems(applyOrderRecursively(baseNav, savedOrder));
        } else {
            setNavItems(baseNav);
        }
    }, [profile, user, applyOrderRecursively]);

    const persistOrder = (newNav: NavItem[]) => {
        const order: Record<string, unknown> = {
            main: newNav.map(n => n.label),
            submenus: {} as Record<string, unknown>
        };

        const collectSubmenus = (items: NavItem[]) => {
            items.forEach(item => {
                if (item.submenu) {
                    (order.submenus as Record<string, string[]>)[item.label] = item.submenu.map(s => s.label);
                    collectSubmenus(item.submenu);
                }
            });
        };

        collectSubmenus(newNav);
        updatePreferences.mutate({ navigationOrder: order });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setNavItems((items) => {
                const oldIndex = items.findIndex(i => i.label === active.id);
                const newIndex = items.findIndex(i => i.label === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                persistOrder(newItems);
                return newItems;
            });
        }
    };

    const handleSubmenuDragEnd = (parentLabel: string, event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setNavItems((items) => {
                // Recursive function to find and update the parent item's submenu
                const updateSubmenuRecursively = (currentItems: NavItem[]): NavItem[] => {
                    return currentItems.map(item => {
                        if (item.label === parentLabel && item.submenu) {
                            const oldIndex = item.submenu.findIndex(i => i.label === active.id);
                            const newIndex = item.submenu.findIndex(i => i.label === over.id);
                            return {
                                ...item,
                                submenu: arrayMove(item.submenu, oldIndex, newIndex)
                            };
                        } else if (item.submenu) {
                            return {
                                ...item,
                                submenu: updateSubmenuRecursively(item.submenu)
                            };
                        }
                        return item;
                    });
                };

                const newItems = updateSubmenuRecursively(items);
                persistOrder(newItems);
                return newItems;
            });
        }
    };

    const toggleMenu = (label: string) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    if (!mounted) return null;

    return (
        <aside className="w-64 flex flex-col h-screen border-r border-gray-100 dark:border-[#1A1A1A] bg-surface dark:bg-surface overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800 transition-colors duration-300">
            <div className="p-6 flex items-center gap-3">
                <Link href="/">
                    <BrandLogo size="sm" hideSubtext />
                </Link>
            </div>

            <nav className="flex-1 space-y-1 pb-4">
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
                        {navItems.map(item => (
                            <SortableNavItem
                                key={item.label}
                                item={item}
                                openMenus={openMenus}
                                toggleMenu={toggleMenu}
                                pathname={pathname}
                                userRole={user?.role || "user"}
                                activeServices={user?.activeServices || []}
                                t={t}
                                onSubmenuDragEnd={handleSubmenuDragEnd}
                                sensors={sensors}
                            />
                        ))}
                    </SortableContext>
                </DndContext>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-[#1A1A1A]">
                <div className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-600 tracking-widest text-center">
                    MMITPS v2.0 © 2026
                </div>
            </div>
        </aside>
    );
}

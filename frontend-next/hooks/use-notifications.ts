"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "@/lib/socket";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export interface AppNotification {
    id: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    type: 'system' | 'trading' | 'security' | 'geometry' | 'vmid' | 'ptd';
    bias?: 'Bullish' | 'Bearish' | 'Neutral';
}

export const useNotifications = () => {
    const { socket, isConnected } = useSocket();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [settings, setSettings] = useState({
        soundEnabled: true,
        pushEnabled: false,
        modules: {
            geometry: true,
            vmid: true,
            ptd: true,
            system: true,
            security: true
        }
    });

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize sound
    useEffect(() => {
        if (typeof window !== "undefined") {
            try {
                audioRef.current = new Audio("/sounds/notification.mp3");
            } catch (e) {
                console.warn("Failed to initialize audio:", e);
            }
        }
    }, []);

    const playSound = useCallback(() => {
        if (typeof window !== "undefined" && settings.soundEnabled && audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(e => console.warn("Audio playback failed:", e));
        }
    }, [settings.soundEnabled]);

    const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'time' | 'unread'>) => {
        const newNotification: AppNotification = {
            ...notification,
            id: Math.random().toString(36).substring(7),
            time: "Just now",
            unread: true
        };

        setNotifications(prev => [newNotification, ...prev].slice(0, 50));
        
        // Visual Toast (Standard visual weight as requested)
        toast(newNotification.title, {
            description: newNotification.message,
            action: {
                label: "View",
                onClick: () => console.log("View notification", newNotification.id)
            }
        });

        playSound();

        // Browser Push logic
        if (settings.pushEnabled && typeof window !== "undefined" && "Notification" in window && window.Notification.permission === "granted") {
            try {
                new window.Notification(newNotification.title, {
                    body: newNotification.message,
                    icon: "/logo.png" // Fallback to logo
                });
            } catch (e) {
                console.warn("Push notification failed:", e);
            }
        }
    }, [playSound, settings.pushEnabled]);

    useEffect(() => {
        if (!socket || !isConnected) return;

        // Listen for global signals
        socket.on("signal:global", (data: any) => {
            const moduleKey = data.module?.toLowerCase() as keyof typeof settings.modules;
            if (moduleKey && !settings.modules[moduleKey]) return;

            addNotification({
                title: data.title || "New Signal Detected",
                message: data.message || `${data.name} identified on ${data.symbol}`,
                type: data.module || 'trading',
                bias: data.bias
            });
        });

        // Listen for personal notifications
        socket.on("notification", (data: any) => {
            addNotification({
                title: data.title,
                message: data.message,
                type: data.type || 'system'
            });
        });

        return () => {
            socket.off("signal:global");
            socket.off("notification");
        };
    }, [socket, isConnected, addNotification, settings.modules]);

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
    };

    const clearAll = () => setNotifications([]);

    return {
        notifications,
        unreadCount: notifications.filter(n => n.unread).length,
        markAsRead,
        clearAll,
        settings,
        setSettings,
        addNotification // Allow manual triggers from local hooks
    };
};

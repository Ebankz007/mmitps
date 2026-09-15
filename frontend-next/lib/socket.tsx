"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useAuth } from "./auth-context";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type SocketInstance = any;

let io: ((url: string, opts?: Record<string, unknown>) => SocketInstance) | undefined;
if (typeof window !== "undefined") {
    // Only load on client
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    io = require("socket.io-client");
}

interface SocketContextType {
    socket: SocketInstance | null;
    isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const [socket, setSocket] = useState<SocketInstance | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, token } = useAuth();

    useEffect(() => {
        if (!user) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setIsConnected(false);
            }
            return;
        }

        if (!io) return;

        const socketInstance = io(process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:5066", {
            withCredentials: true,
            transports: ["websocket"],
            // The backend requires a valid access token in the handshake —
            // identity is derived from the token, never from client payloads.
            auth: { token },
        });

        socketInstance.on("connect", () => {
            setIsConnected(true);
            socketInstance.emit("join", user.id);
        });

        socketInstance.on("disconnect", () => {
            setIsConnected(false);
        });

        // Token rejected/expired — surface it instead of failing silently
        socketInstance.on("connect_error", (err: Error) => {
            console.error("Socket connection error:", err.message);
            setIsConnected(false);
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    );
};

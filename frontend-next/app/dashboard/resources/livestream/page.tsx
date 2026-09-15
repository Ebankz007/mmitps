"use client";

import React, { useState, useEffect } from "react";
import {
    Radio,
    Play,
    Users,
    MessageSquare,
    Zap,
    Globe,
    Activity,
    Maximize2,
    Volume2,
    Settings,
    Monitor,
    Video,
    Pause,
    User,
    ChevronRight,
    RefreshCw
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import api from "@/lib/api";
import MuxPlayer from "@mux/mux-player-react";

interface Stream {
    id: string;
    title: string;
    host: string;
    educator?: string; // Add support for backend's 'educator' vs 'host'
    status: 'live' | 'offline' | 'starting_soon';
    viewers: number;
    desc: string;
    playbackUrl?: string; // Mux playback URL
    playbackId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon?: any;
}

export default function LiveStreamDashboard() {
    const [streams, setStreams] = useState<Stream[]>([]);
    const [filter, setFilter] = useState<'all' | 'live'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

    useEffect(() => {
        const fetchStreams = async () => {
            try {
                const response = await api.get("/api/v1/vmid/streams/active");
                if (response.data?.status === 'success') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const mappedStreams = response.data.data.streams.map((s: any) => ({
                        ...s,
                        host: s.educator || s.host || 'MMITPS Pro',
                        icon: getIconForStream(s.id)
                    }));
                    setStreams(mappedStreams);
                }
            } catch (error) {
                console.error("Stream Fetch Error:", error);
                toast.error("Failed to load streams", { description: "Institutional sync error." });
            } finally {
                setIsLoading(false);
            }
        };

        const getIconForStream = (id: string) => {
            switch (id) {
                case 'stream_1': return Globe;
                case 'stream_2': return Monitor;
                case 'stream_3': return Activity;
                case 'stream_4': return Zap;
                case 'stream_5': return Video;
                case 'stream_6': return Layers;
                default: return Video;
            }
        };

        fetchStreams();
    }, []);

    const filteredStreams = streams.filter(s => filter === 'all' || s.status === 'live');
    const totalViewers = streams.reduce((acc, s) => acc + s.viewers, 0);
    const liveCount = streams.filter(s => s.status === 'live').length;

    const handleWatchStream = (stream: Stream) => {
        if (stream.status === 'offline') {
            toast.error("Stream Offline", { description: "This session has concluded or is not yet active." });
            return;
        }
        setSelectedStream(stream);
        toast.promise(new Promise(r => setTimeout(r, 1500)), {
            loading: "Connecting to secure broadcast...",
            success: "Broadcast Connected",
            error: "Connection Failed"
        });
    };

    return (
        <div className="min-h-screen bg-[#020202] text-[var(--color-text-primary)] p-4 lg:p-8 font-sans pb-32">
            {/* Nav Breadcrumbs */}
            <div className="max-w-[1800px] mx-auto mb-8 flex items-center gap-2 text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">
                <span>Resources</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-brand-500">Live Stream</span>
            </div>

            {/* Header Section */}
            <div className="max-w-[1800px] mx-auto mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
                                <Radio className="w-4 h-4 text-brand-500 animate-pulse" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">
                                Trading Live Stream <span className="text-brand-500">Dashboard</span>
                            </h1>
                        </div>
                        <p className="text-[var(--color-text-secondary)] text-[11px] font-bold uppercase tracking-[0.2em] italic">
                            MMITPS INC • Monitor all trading streams in one place — click any stream to watch in a pop-up player
                        </p>
                    </div>

                    <div className="flex items-center gap-6 pb-2">
                        <div className="flex bg-[var(--color-surface-2)] border border-[var(--color-border)] rounded-full p-1">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-brand-500 text-black shadow-lg shadow-brand-500/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                            >
                                All Streams
                            </button>
                            <button
                                onClick={() => setFilter('live')}
                                className={`px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${filter === 'live' ? 'bg-red-500 text-[var(--color-text-primary)] shadow-lg shadow-red-500/20' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${filter === 'live' ? 'bg-surface animate-pulse' : 'bg-red-500/50'}`} />
                                Live Only
                            </button>
                        </div>

                        <div className="flex items-center gap-8 h-10 px-8 bg-white/[0.02] border border-[var(--color-border)] rounded-lg backdrop-blur-sm">
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-[var(--color-text-muted)] uppercase tracking-widest">Total</span>
                                <span className="text-xs font-black italic text-[var(--color-text-secondary)]">{streams.length}</span>
                            </div>
                            <div className="w-[1px] h-4 bg-[var(--color-surface-2)]" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-red-500/40 uppercase tracking-widest">Live</span>
                                <span className="text-xs font-black italic text-red-500">{liveCount}</span>
                            </div>
                            <div className="w-[1px] h-4 bg-[var(--color-surface-2)]" />
                            <div className="flex flex-col items-center">
                                <span className="text-[8px] font-black text-brand-500/40 uppercase tracking-widest">Viewers</span>
                                <span className="text-xs font-black italic text-brand-500">{totalViewers.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stream Grid */}
            <div className="max-w-[1800px] mx-auto min-h-[600px]">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                        <RefreshCw className="w-10 h-10 text-brand-500 animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--color-text-muted)]">Syncing Broadcast Matrix...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredStreams.map((stream) => (
                            <motion.div
                                key={stream.id}
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`group flex flex-col bg-[#050505] border border-[var(--color-border)] rounded-lg overflow-hidden transition-all duration-500 hover:border-brand-500/20 hover:shadow-2xl hover:shadow-brand-500/5 ${stream.status === 'offline' ? 'opacity-60' : ''}`}
                            >
                                {/* Thumbnail / Player Preview Area */}
                                <div className="relative aspect-video bg-[#0A0A0A] overflow-hidden">
                                    {/* Background patterns */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16, 185, 129,0.05),transparent_70%)]" />
                                    <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />

                                    {/* Play Overlay */}
                                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
                                        <button
                                            onClick={() => handleWatchStream(stream)}
                                            className="w-16 h-16 rounded-full bg-brand-500/10 border border-brand-500/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-brand-500 group-hover:border-transparent transition-all duration-500 shadow-2xl"
                                        >
                                            {stream.status === 'live' ? (
                                                <Play className="w-6 h-6 text-brand-500 group-hover:text-black fill-current translate-x-0.5 transition-colors" />
                                            ) : (
                                                <Radio className="w-6 h-6 text-[var(--color-text-muted)]" />
                                            )}
                                        </button>
                                        <span className="mt-4 text-[9px] font-black uppercase tracking-[0.3em] text-[var(--color-text-muted)] group-hover:text-[var(--color-text-primary)] transition-colors">
                                            {stream.status === 'live' ? "Click to Watch Live" : "Stream Offline"}
                                        </span>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="absolute top-6 left-6 z-20">
                                        {stream.status === 'live' ? (
                                            <div className="px-3 py-1.5 bg-red-600 rounded-full flex items-center gap-2 shadow-lg backdrop-blur-md">
                                                <div className="w-1.5 h-1.5 rounded-full bg-surface animate-pulse" />
                                                <span className="text-[8px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">LIVE</span>
                                            </div>
                                        ) : (
                                            <div className="px-3 py-1.5 bg-[var(--color-surface-3)] rounded-full border border-[var(--color-border)] uppercase text-[8px] font-black text-[var(--color-text-secondary)] tracking-widest backdrop-blur-md">
                                                OFFLINE
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Area */}
                                <div className="p-8 space-y-6">
                                    <div className="flex items-center justify-between text-[9px] font-black uppercase tracking-widest">
                                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                            <User className="w-3 h-3 text-brand-500" />
                                            <span>{stream.host}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-[var(--color-text-secondary)]">
                                            <Users className="w-3 h-3 text-brand-500" />
                                            <span>{stream.viewers.toLocaleString()} Viewers</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-[var(--color-text-primary)] group-hover:text-brand-500 transition-colors leading-tight">
                                            {stream.title}
                                        </h3>
                                        <p className="text-[10px] font-bold text-[var(--color-text-muted)] uppercase leading-relaxed tracking-wide italic">
                                            {stream.desc}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleWatchStream(stream)}
                                        className={`w-full py-4 rounded-lg text-[9px] font-black uppercase tracking-[0.3em] transition-all border ${stream.status === 'live' ? 'bg-brand-500 text-black border-transparent hover:bg-surface shadow-xl shadow-brand-500/5' : 'bg-transparent text-[var(--color-text-muted)] border-[var(--color-border)] cursor-not-allowed'}`}
                                    >
                                        <div className="flex items-center justify-center gap-3">
                                            {stream.status === 'live' ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
                                            {stream.status === 'live' ? "Watch Now" : "Offline"}
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer Branding */}
            <div className="max-w-[1800px] mx-auto mt-40 flex flex-col items-center border-t border-[var(--color-border)] pt-20">
                <div className="text-[8px] font-black text-brand-500 uppercase tracking-[1em] mb-4">MMITPS INC</div>
                <p className="text-[9px] font-bold text-white/10 tracking-[0.5em] uppercase italic">Trading Live Stream Dashboard — Multi-Platform Monitoring</p>
            </div>

            {/* Video Player Modal */}
            <Dialog open={!!selectedStream} onOpenChange={(open) => !open && setSelectedStream(null)}>
                <DialogContent className="max-w-5xl bg-black border border-[var(--color-border)] p-0 rounded-lg overflow-hidden shadow-2xl shadow-brand-500/10">
                    <div className="aspect-video relative bg-[#050505] flex items-center justify-center">
                        {/* Video Player or Mock */}
                        {selectedStream?.playbackUrl ? (
                            <MuxPlayer
                                playbackId={selectedStream.playbackUrl.split('/').pop()?.split('.')[0] || ''}
                                metadata={{
                                    video_id: selectedStream.id,
                                    video_title: selectedStream.title,
                                    viewer_user_id: "mmitps_user",
                                }}
                                streamType="live"
                                autoPlay
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-br from-brand-900/10 to-transparent pointer-events-none" />
                                <div className="flex flex-col items-center gap-6 z-10">
                                    <div className="w-24 h-24 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center animate-pulse">
                                        <Radio className="w-10 h-10 text-brand-500" />
                                    </div>
                                    <div className="flex flex-col items-center text-center">
                                        <span className="text-xl font-black italic uppercase tracking-tighter text-[var(--color-text-primary)]">Connecting Secure Pipeline</span>
                                        <span className="text-[10px] font-black text-brand-500 uppercase tracking-[0.5em] mt-2">Institutional Feed v4.2</span>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Top Overlay */}
                        <div className="absolute top-8 left-8 right-8 flex items-center justify-between z-20">
                            <div className="flex items-center gap-4">
                                <div className="px-4 py-2 bg-red-600 rounded-lg flex items-center gap-3 shadow-2xl">
                                    <div className="w-2 h-2 rounded-full bg-surface animate-pulse" />
                                    <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">LIVE BROADCAST</span>
                                </div>
                                <div className="px-4 py-2 bg-black/60 border border-[var(--color-border)] rounded-lg backdrop-blur-md flex items-center gap-3">
                                    <Users className="w-4 h-4 text-brand-500" />
                                    <span className="text-[10px] font-black text-[var(--color-text-primary)] uppercase tracking-widest">{selectedStream?.viewers.toLocaleString()} Viewing</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="p-3 rounded-lg bg-black/60 border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors">
                                    <Settings className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                </button>
                                <button className="p-3 rounded-lg bg-black/60 border border-[var(--color-border)] hover:bg-[var(--color-surface-3)] transition-colors text-[var(--color-text-secondary)]">
                                    <Maximize2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        {/* Control Bar Overlay */}
                        <div className="absolute bottom-8 left-8 right-8 bg-black/60 backdrop-blur-xl border border-[var(--color-border)] rounded-2.5rem p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 z-20">
                            <div className="flex items-center gap-6">
                                <button className="w-12 h-12 rounded-lg bg-brand-500 text-black flex items-center justify-center">
                                    <Play className="w-5 h-5 fill-current" />
                                </button>
                                <div className="space-y-1">
                                    <h2 className="text-base font-black italic uppercase tracking-tighter line-clamp-1">{selectedStream?.title}</h2>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[9px] font-black text-brand-500 uppercase italic">{selectedStream?.host}</span>
                                        <span className="text-white/10">•</span>
                                        <span className="text-[8px] font-bold text-[var(--color-text-muted)] uppercase tracking-widest">MMITPS PRO STREAM</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-6 px-6 border-l border-[var(--color-border)]">
                                <div className="flex items-center gap-4">
                                    <Volume2 className="w-4 h-4 text-[var(--color-text-secondary)]" />
                                    <div className="w-32 h-1 bg-[var(--color-surface-2)] rounded-full overflow-hidden">
                                        <div className="w-[70%] h-full bg-brand-500" />
                                    </div>
                                </div>
                                <button className="flex items-center gap-3 px-6 py-2.5 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-500 text-[9px] font-black uppercase tracking-widest hover:bg-brand-500 hover:text-black transition-all">
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    Intel Feed
                                </button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Custom scrollbar and animations */}
            <style jsx global>{`
                ::selection {
                    background: rgba(16, 185, 129, 0.3);
                    color: white;
                }
            `}</style>
        </div>
    );
}

// Dummy Layers icon if lucide doesn't have it or as fallback
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Layers(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.1 6.27a2 2 0 0 0 0 3.66l9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09a2 2 0 0 0 0-3.66z" />
            <path d="m2.1 14.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" />
            <path d="m2.1 19.07 9.07 4.09a2 2 0 0 0 1.66 0l9.07-4.09" />
        </svg>
    )
}

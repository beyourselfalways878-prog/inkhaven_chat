"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../../stores/useSessionStore';
import { useToast } from '../../../components/ui/toast';
import { Download, ChevronLeft, MessageSquare, Clock, CloudOff } from 'lucide-react';
import Link from 'next/link';
import DateSeparator from '../../../components/Chat/DateSeparator';

interface Room {
    id: string;
    createdAt: string;
}

interface Message {
    id: string;
    senderId: string;
    content: string;
    messageType: 'text' | 'image' | 'file' | 'audio' | 'glowpad';
    createdAt: string;
}

export default function HistoryPage() {
    const router = useRouter();
    const session = useSessionStore((s) => s.session);
    const toast = useToast();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [loadingRooms, setLoadingRooms] = useState(true);

    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // Pagination State
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observerTarget = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!session.userId) {
            router.push('/onboarding');
            return;
        }

        // Fetch Rooms
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/rooms/user');
                if (res.ok) {
                    const json = await res.json();
                    setRooms(json.data || []);
                }
            } catch (err) {
                console.error('Failed to load rooms', err);
            } finally {
                setLoadingRooms(false);
            }
        };
        fetchRooms();
    }, [session.userId, router]);

    const loadMessages = useCallback(async (roomId: string, pageNum: number, append = false) => {
        if (!hasMore && append) return;
        setLoadingMessages(true);
        try {
            const res = await fetch(`/api/messages?roomId=${roomId}&page=${pageNum}&limit=50`);
            if (res.ok) {
                const json = await res.json();
                const newMsgs = json.data || [];

                // Reverse because we want newest at bottom, but DB might return descending?
                // Actually, let's just use what the DB gives. Assuming DB gives latest first.
                // Wait, standard SQL order by created_at DESC means index 0 is newest.
                // So we append to the TOP of the chat list.
                if (newMsgs.length < 50) {
                    setHasMore(false);
                }

                setMessages(prev => append ? [...prev, ...newMsgs] : newMsgs);
                setPage(pageNum);
            }
        } catch (err) {
            toast.error('Failed to load chat history');
        } finally {
            setLoadingMessages(false);
        }
    }, [hasMore, toast]);

    useEffect(() => {
        if (selectedRoomId) {
            setPage(1);
            setHasMore(true);
            setMessages([]);
            loadMessages(selectedRoomId, 1, false);
        }
    }, [selectedRoomId, loadMessages]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !loadingMessages && selectedRoomId) {
                    loadMessages(selectedRoomId, page + 1, true);
                }
            },
            { threshold: 1.0 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => observer.disconnect();
    }, [hasMore, loadingMessages, selectedRoomId, page, loadMessages]);

    const exportChat = () => {
        if (messages.length === 0) return;

        // Convert to readable text
        let exportText = `InkHaven Chat Export - Room ID: ${selectedRoomId}\n`;
        exportText += `Downloaded on: ${new Date().toLocaleString()}\n`;
        exportText += `==========================================================\n\n`;

        // Messages are likely DESC from backend, so reverse for chronological
        const chronological = [...messages].reverse();

        chronological.forEach(m => {
            const date = new Date(m.createdAt).toLocaleString();
            const sender = m.senderId === session.userId ? "You" : "Stranger";
            const content = m.messageType === 'text' ? m.content : `[${m.messageType.toUpperCase()} MEDIA ATTACHMENT]`;
            exportText += `[${date}] ${sender}: ${content}\n`;
        });

        const blob = new Blob([exportText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inkhaven_export_${selectedRoomId?.substring(0, 8)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Chat exported successfully!');
    };

    if (!session.userId) return null;

    return (
        <div className="container mx-auto px-6 py-10 h-[calc(100vh-80px)]">
            <div className="flex items-center gap-3 mb-6">
                <Link href="/settings" className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition">
                    <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white" />
                </Link>
                <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Saved Chats</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[80%]">
                {/* Sidebar */}
                <div className="card bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-200 dark:border-white/5 font-semibold text-slate-700 dark:text-white/80">
                        Recent Transcripts
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loadingRooms ? (
                            <div className="text-center text-slate-400 dark:text-white/40 text-sm py-10 animate-pulse">Loading...</div>
                        ) : rooms.length === 0 ? (
                            <div className="text-center flex flex-col items-center justify-center h-40 opacity-50">
                                <CloudOff className="w-8 h-8 mb-2" />
                                <span className="text-sm">No saved chats found.</span>
                            </div>
                        ) : (
                            rooms.map(room => (
                                <button
                                    key={room.id}
                                    onClick={() => setSelectedRoomId(room.id)}
                                    className={`w-full text-left p-3 rounded-xl transition ${selectedRoomId === room.id ? 'bg-indigo-500/20 border border-indigo-500/30' : 'hover:bg-slate-50 dark:hover:bg-white/5 border border-transparent'}`}
                                >
                                    <div className="flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-indigo-400" />
                                        <span className="text-sm text-slate-900 dark:text-white font-medium">Stranger</span>
                                    </div>
                                    <div className="text-xs text-slate-400 dark:text-white/40 mt-1 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(room.createdAt).toLocaleDateString()}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* Message View */}
                <div className="md:col-span-2 card bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden flex flex-col">
                    {selectedRoomId ? (
                        <>
                            <div className="p-4 border-b border-slate-200 dark:border-white/5 flex justify-between items-center bg-white dark:bg-slate-900 absolute w-full z-10">
                                <span className="text-slate-700 dark:text-white/80 font-medium text-sm">Room: {selectedRoomId.substring(0, 8)}...</span>
                                <button onClick={exportChat} className="btn-secondary py-1.5 px-3 text-xs flex items-center gap-1.5 hover:bg-indigo-500/20 hover:text-indigo-300">
                                    <Download className="w-3.5 h-3.5" />
                                    Export to TXT
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 flex flex-col-reverse gap-4 pt-16 mt-14 relative">

                                {/* Reversed mapping because we assume DB limit 50 gives newest 50 descending, 
                    and flex-col-reverse makes the first item appear at the bottom! */}
                                {(() => {
                                    const grouped: Array<{ type: 'date' | 'message'; date?: string; message?: Message }> = [];
                                    const reversed = [...messages].reverse(); // oldest first layout

                                    for (let i = 0; i < reversed.length; i++) {
                                        const msg = reversed[i];
                                        const prev = reversed[i - 1];
                                        const msgDay = new Date(msg.createdAt).toDateString();
                                        const prevDay = prev ? new Date(prev.createdAt).toDateString() : null;

                                        if (!prev || msgDay !== prevDay) {
                                            grouped.push({ type: 'date', date: msgDay });
                                        }
                                        grouped.push({ type: 'message', message: msg });
                                    }

                                    // Because the parent is flex-col-reverse, we must reverse the final array so it renders top to bottom visually correctly
                                    return grouped.reverse().map((g, idx) => {
                                        if (g.type === 'date') {
                                            return <DateSeparator key={`d_${idx}`} dateString={g.date!} />;
                                        }
                                        const m = g.message!;
                                        const isMine = m.senderId === session.userId;
                                        return (
                                            <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-[80%] ${isMine ? 'ml-auto' : 'mr-auto'}`}>
                                                <div className={`p-3 rounded-2xl text-sm ${isMine ? 'bg-indigo-600/90 text-white rounded-tr-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-sm border border-slate-200 dark:border-white/5'}`}>
                                                    {m.messageType === 'text' ? m.content : <span className="italic opacity-60 text-xs">Media attachment ({m.messageType})</span>}
                                                </div>
                                                <span className="text-[10px] text-slate-400 dark:text-white/30 mt-1">{new Date(m.createdAt).toLocaleTimeString()}</span>
                                            </div>
                                        )
                                    });
                                })()}

                                {/* Observer Target for Infinite Scroll */}
                                <div ref={observerTarget} className="h-4 w-full flex-shrink-0" />

                                {loadingMessages && <div className="text-center text-xs text-indigo-400 py-2 animate-pulse w-full flex-shrink-0">Loading more...</div>}
                                {!hasMore && messages.length > 0 && <div className="text-center text-xs text-slate-300 dark:text-white/20 py-2 w-full flex-shrink-0">Beginning of history</div>}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 dark:text-white/30">
                            <MessageSquare className="w-12 h-12 mb-3 opacity-20" />
                            <p>Select a chat from the left to view history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

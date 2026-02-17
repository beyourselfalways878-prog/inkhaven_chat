"use client";

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, X, Loader2, MessageSquare } from 'lucide-react';

interface SearchResult {
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    room_id: string;
    sender_id: string;
    created_at: string;
}

interface MessageSearchProps {
    roomId: string;
    onResultClick?: (messageId: string) => void; // eslint-disable-line no-unused-vars
    onClose?: () => void;
}

export default function MessageSearch({ roomId, onResultClick, onClose }: MessageSearchProps) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [searched, setSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const search = useCallback(async (q: string) => {
        if (q.trim().length < 2) {
            setResults([]);
            setTotal(0);
            setSearched(false);
            return;
        }

        setLoading(true);
        setSearched(true);
        try {
            const res = await fetch('/api/messages/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId, query: q.trim(), limit: 20 }),
            });
            const json = await res.json();
            if (json.ok) {
                setResults(json.messages ?? []);
                setTotal(json.total ?? 0);
            }
        } catch {
            // silent fail
        } finally {
            setLoading(false);
        }
    }, [roomId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setQuery(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(val), 400);
    };

    const highlightMatch = (text: string, q: string) => {
        if (!q.trim()) return text;
        const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        const parts = text.split(regex);
        return parts.map((part, i) =>
            regex.test(part) ? (
                <span key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{part}</span>
            ) : (
                <span key={i}>{part}</span>
            )
        );
    };

    const formatTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
            d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute inset-x-0 top-0 z-30 bg-slate-900/95 backdrop-blur-xl border-b border-white/5"
        >
            {/* Search input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <Search size={18} className="text-white/30 shrink-0" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    placeholder="Search messages..."
                    className="flex-1 bg-transparent text-white text-sm outline-none placeholder:text-white/30"
                />
                {loading && <Loader2 size={16} className="text-indigo-400 animate-spin shrink-0" />}
                <button onClick={onClose} className="text-white/30 hover:text-white/60 transition">
                    <X size={18} />
                </button>
            </div>

            {/* Results */}
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
                {searched && !loading && results.length === 0 && (
                    <div className="px-4 py-8 text-center text-white/30 text-sm">
                        No messages found for &ldquo;{query}&rdquo;
                    </div>
                )}

                {results.map((msg) => (
                    <button
                        key={msg.id}
                        onClick={() => onResultClick?.(msg.id)}
                        className="w-full px-4 py-3 text-left hover:bg-white/[0.04] transition border-b border-white/[0.03] last:border-0"
                    >
                        <div className="flex items-start gap-2">
                            <MessageSquare size={14} className="text-white/20 mt-1 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="text-sm text-white/80 line-clamp-2">
                                    {highlightMatch(msg.content, query)}
                                </div>
                                <div className="text-[10px] text-white/30 mt-1">
                                    {formatTime(msg.created_at || msg.createdAt)}
                                </div>
                            </div>
                        </div>
                    </button>
                ))}

                {searched && total > 0 && (
                    <div className="px-4 py-2 text-center text-[10px] text-white/20">
                        {total} result{total !== 1 ? 's' : ''} found
                    </div>
                )}
            </div>
        </motion.div>
    );
}

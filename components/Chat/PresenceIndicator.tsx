"use client";

import { motion, AnimatePresence } from 'framer-motion';

type PresenceIndicatorProps = {
    onlineCount: number;
    partnerStatus?: 'online' | 'away' | 'offline';
    partnerName?: string;
    isConnected: boolean;
};

/**
 * Visual indicator for connection status and partner presence
 */
export default function PresenceIndicator({
    onlineCount,
    partnerStatus,
    partnerName,
    isConnected
}: PresenceIndicatorProps) {
    const statusColors = {
        online: 'bg-emerald-500',
        away: 'bg-amber-500',
        offline: 'bg-slate-400'
    };

    const statusLabels = {
        online: 'Online',
        away: 'Away',
        offline: 'Offline'
    };

    return (
        <div className="flex items-center gap-2">
            {/* Connection status */}
            <AnimatePresence mode="wait">
                {!isConnected ? (
                    <motion.div
                        key="connecting"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30"
                    >
                        <motion.div
                            className="w-2 h-2 rounded-full bg-amber-500"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
                            Connecting...
                        </span>
                    </motion.div>
                ) : (
                    <motion.div
                        key="connected"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                            Connected
                        </span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Partner status (if in 1:1 chat) */}
            {partnerStatus && (
                <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                    <motion.div
                        className={`w-2 h-2 rounded-full ${statusColors[partnerStatus]}`}
                        animate={partnerStatus === 'online' ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {partnerName || 'Partner'} · {statusLabels[partnerStatus]}
                    </span>
                </motion.div>
            )}

            {/* Online count (for group chats or waiting rooms) */}
            {onlineCount > 0 && !partnerStatus && (
                <motion.div
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800"
                >
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                        {onlineCount} {onlineCount === 1 ? 'user' : 'users'} online
                    </span>
                </motion.div>
            )}
        </div>
    );
}

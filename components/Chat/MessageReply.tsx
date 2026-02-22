'use client';

import React from 'react';
import { X, Reply } from 'lucide-react';
import { motion } from 'framer-motion';

// ============================================================================
// Types
// ============================================================================

export interface ReplyMessage {
    id: string;
    content: string;
    senderId: string;
    senderName?: string;
}

// ============================================================================
// Reply Preview (shown above message input)
// ============================================================================

interface MessageReplyPreviewProps {
    replyTo: ReplyMessage;
    onCancel: () => void;
}

export function MessageReplyPreview({ replyTo, onCancel }: MessageReplyPreviewProps) {
    const displayName = replyTo.senderName || replyTo.senderId.slice(0, 8);
    const truncated = replyTo.content.length > 100
        ? replyTo.content.slice(0, 100) + '…'
        : replyTo.content;

    return (
        <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-2 px-4 py-2 border-t border-white/5 bg-white/[0.02]"
        >
            <div className="w-0.5 h-8 rounded-full bg-indigo-500/60 flex-shrink-0" />
            <Reply size={14} className="text-indigo-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="text-[11px] font-medium text-indigo-400">{displayName}</p>
                <p className="text-xs text-white/70 truncate">{truncated}</p>
            </div>
            <button
                onClick={onCancel}
                className="p-1 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}

// ============================================================================
// Reply Inline (shown inside a message bubble)
// ============================================================================

interface MessageReplyInlineProps {
    replyTo: ReplyMessage;
    isMine?: boolean;
}

export function MessageReplyInline({ replyTo, isMine }: MessageReplyInlineProps) {
    const displayName = replyTo.senderName || replyTo.senderId.slice(0, 8);
    const truncated = replyTo.content.length > 80
        ? replyTo.content.slice(0, 80) + '…'
        : replyTo.content;

    return (
        <div
            className={`
        flex items-start gap-2 px-3 py-1.5 rounded-lg mb-1.5 cursor-pointer
        ${isMine
                    ? 'bg-white/10 hover:bg-white/15'
                    : 'bg-white/5 hover:bg-white/10'
                }
        transition-colors
      `}
        >
            <div className={`w-0.5 h-full min-h-[24px] rounded-full flex-shrink-0 ${isMine ? 'bg-white/30' : 'bg-indigo-500/50'}`} />
            <div className="min-w-0">
                <p className={`text-[10px] font-medium ${isMine ? 'text-white/90' : 'text-indigo-400'}`}>
                    {displayName}
                </p>
                <p className={`text-[11px] truncate ${isMine ? 'text-white/80' : 'text-white/70'}`}>{truncated}</p>
            </div>
        </div>
    );
}

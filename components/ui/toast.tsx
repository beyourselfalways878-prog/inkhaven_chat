'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    variant: ToastVariant;
    duration?: number;
}

interface ToastContextType {
    toast: (message: string, variant?: ToastVariant, duration?: number) => void; // eslint-disable-line no-unused-vars
    success: (message: string) => void; // eslint-disable-line no-unused-vars
    error: (message: string) => void; // eslint-disable-line no-unused-vars
    info: (message: string) => void; // eslint-disable-line no-unused-vars
    warning: (message: string) => void; // eslint-disable-line no-unused-vars
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

// ============================================================================
// Icons & Styles
// ============================================================================

const variantConfig: Record<ToastVariant, { icon: React.ReactNode; bg: string; border: string; text: string }> = {
    success: {
        icon: <CheckCircle size={18} />,
        bg: 'bg-emerald-950/90',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
    },
    error: {
        icon: <AlertCircle size={18} />,
        bg: 'bg-red-950/90',
        border: 'border-red-500/30',
        text: 'text-red-400',
    },
    info: {
        icon: <Info size={18} />,
        bg: 'bg-blue-950/90',
        border: 'border-blue-500/30',
        text: 'text-blue-400',
    },
    warning: {
        icon: <AlertTriangle size={18} />,
        bg: 'bg-amber-950/90',
        border: 'border-amber-500/30',
        text: 'text-amber-400',
    },
};

// ============================================================================
// Toast Item
// ============================================================================

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) { // eslint-disable-line no-unused-vars
    const config = variantConfig[toast.variant];

    useEffect(() => {
        const timer = setTimeout(() => onDismiss(toast.id), toast.duration || 4000);
        return () => clearTimeout(timer);
    }, [toast.id, toast.duration, onDismiss]);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl
        ${config.bg} ${config.border} min-w-[300px] max-w-[420px]
      `}
        >
            <span className={config.text}>{config.icon}</span>
            <p className="text-sm text-white/90 flex-1 font-medium">{toast.message}</p>
            <button
                onClick={() => onDismiss(toast.id)}
                className="text-white/40 hover:text-white/80 transition-colors"
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}

// ============================================================================
// Provider
// ============================================================================

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const counterRef = useRef(0);

    const dismiss = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const addToast = useCallback((message: string, variant: ToastVariant = 'info', duration = 4000) => {
        const id = `toast_${++counterRef.current}_${Date.now()}`;
        setToasts((prev) => [...prev.slice(-4), { id, message, variant, duration }]); // max 5
    }, []);

    const ctx: ToastContextType = {
        toast: addToast,
        success: (msg) => addToast(msg, 'success'),
        error: (msg) => addToast(msg, 'error'),
        info: (msg) => addToast(msg, 'info'),
        warning: (msg) => addToast(msg, 'warning'),
    };

    return (
        <ToastContext.Provider value={ctx}>
            {children}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2 items-end">
                <AnimatePresence mode="popLayout">
                    {toasts.map((t) => (
                        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
                    ))}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}

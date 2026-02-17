'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
};

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Escape key
    useEffect(() => {
        if (!open) return;
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    // Focus trap
    useEffect(() => {
        if (!open || !contentRef.current) return;
        const focusable = contentRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length > 0) focusable[0].focus();
    }, [open]);

    // Prevent body scroll
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = ''; };
        }
    }, [open]);

    const handleBackdropClick = useCallback((e: React.MouseEvent) => {
        if (e.target === overlayRef.current) onClose();
    }, [onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    ref={overlayRef}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={handleBackdropClick}
                    className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                >
                    <motion.div
                        ref={contentRef}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 400 }}
                        className={`
              ${sizeMap[size]} w-full rounded-2xl border border-white/10
              bg-slate-900/95 backdrop-blur-xl shadow-2xl
            `}
                        role="dialog"
                        aria-modal="true"
                        aria-label={title}
                    >
                        {title && (
                            <div className="flex items-center justify-between px-6 pt-5 pb-2">
                                <h2 className="text-lg font-semibold text-white">{title}</h2>
                                <button
                                    onClick={onClose}
                                    className="text-white/40 hover:text-white/80 transition-colors p-1 rounded-lg hover:bg-white/5"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        )}
                        <div className="px-6 py-4">{children}</div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

"use client";

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface FileUploadProps {
    onFileSelected: (file: File) => void;
    maxSize?: number;
    acceptedTypes?: string[];
}

export function FileUpload({
    onFileSelected,
    maxSize = 50 * 1024 * 1024,
    acceptedTypes = ['image/*', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
}: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const validateFile = (file: File): string | null => {
        if (file.size > maxSize) {
            return `File size exceeds ${(maxSize / 1024 / 1024).toFixed(0)}MB limit`;
        }

        const fileType = file.type;
        const fileName = file.name;
        const ext = fileName.split('.').pop()?.toLowerCase();

        // Check MIME type or extension
        const isAccepted = acceptedTypes.some((type) => {
            if (type.includes('*')) {
                const [mainType] = type.split('/');
                return fileType.startsWith(mainType);
            }
            return fileType === type;
        });

        if (!isAccepted) {
            return 'File type not supported';
        }

        return null;
    };

    const handleFile = (file: File) => {
        setError(null);
        const validationError = validateFile(file);

        if (validationError) {
            setError(validationError);
            return;
        }

        onFileSelected(file);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.currentTarget.files;
        if (files && files.length > 0) {
            handleFile(files[0]);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <motion.div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                animate={{ backgroundColor: isDragging ? 'rgb(224, 242, 254)' : 'rgb(248, 250, 252)' }}
                className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center cursor-pointer transition"
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleInputChange}
                    className="hidden"
                    accept={acceptedTypes.join(',')}
                />

                <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mx-auto text-slate-400 mb-2"
                >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                </svg>

                <div className="text-sm font-medium text-slate-700">
                    Drop file here or click to upload
                </div>
                <div className="text-xs text-slate-500 mt-1">
                    Max {(maxSize / 1024 / 1024).toFixed(0)}MB
                </div>
            </motion.div>

            {error && (
                <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-700"
                >
                    {error}
                </motion.div>
            )}
        </div>
    );
}

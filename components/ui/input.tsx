'use client';

import React, { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

/**
 * Styled input with label, error state, and icon support.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
    ({ label, error, icon, rightIcon, className = '', ...props }, ref) => {
        return (
            <div className="flex flex-col gap-1.5">
                {label && (
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>
                )}
                <div className="relative">
                    {icon && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={`
              w-full rounded-xl border bg-slate-50 dark:bg-white/5 px-4 py-2.5
              text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50
              ${icon ? 'pl-10' : ''}
              ${rightIcon ? 'pr-10' : ''}
              ${error
                                ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50'
                                : 'border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20'
                            }
              ${className}
            `}
                        {...props}
                    />
                    {rightIcon && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500">
                            {rightIcon}
                        </div>
                    )}
                </div>
                {error && (
                    <p className="text-xs text-red-400 mt-0.5">{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

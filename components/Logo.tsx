import React from 'react';

export const Logo = ({ className = "w-10 h-10", showText = false }: { className?: string; showText?: boolean }) => (
    <div className="flex items-center gap-3">
        <svg
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
        >
            <defs>
                <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="5" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>

            {/* Outer Shell - Stylized Chat Bubble / Shield */}
            <path
                d="M50 5 C 25 5, 5 25, 5 50 C 5 75, 25 95, 50 95 C 65 95, 78 88, 88 78 L 95 85 L 92 72 C 97 65, 100 58, 100 50 C 100 25, 75 5, 50 5 Z"
                fill="url(#logoGradient)"
                fillOpacity="0.1"
                stroke="url(#logoGradient)"
                strokeWidth="2"
            />

            {/* Inner Core - Ink Drop / Flame */}
            <path
                d="M50 20 C 50 20, 20 50, 20 65 C 20 81.5, 33.5 95, 50 95 C 66.5 95, 80 81.5, 80 65 C 80 50, 50 20, 50 20 Z"
                fill="url(#logoGradient)"
                filter="url(#glow)"
            >
                <animate
                    attributeName="d"
                    dur="4s"
                    repeatCount="indefinite"
                    values="
            M50 20 C 50 20, 20 50, 20 65 C 20 81.5, 33.5 95, 50 95 C 66.5 95, 80 81.5, 80 65 C 80 50, 50 20, 50 20 Z;
            M50 15 C 50 15, 22 48, 22 63 C 22 80, 35 93, 50 93 C 65 93, 78 80, 78 63 C 78 48, 50 15, 50 15 Z;
            M50 20 C 50 20, 20 50, 20 65 C 20 81.5, 33.5 95, 50 95 C 66.5 95, 80 81.5, 80 65 C 80 50, 50 20, 50 20 Z
          "
                />
            </path>

            {/* Shine/Reflection */}
            <ellipse cx="65" cy="40" rx="6" ry="12" fill="white" fillOpacity="0.2" transform="rotate(20 65 40)" />
        </svg>

        {showText && (
            <div className="flex flex-col leading-tight">
                <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">InkHaven</span>
                <span className="text-[10px] uppercase tracking-widest text-indigo-600/60 dark:text-indigo-200/60 font-medium">Anonymous Sanctuary</span>
            </div>
        )}
    </div>
);

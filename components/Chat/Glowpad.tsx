'use client';
import { useRef, useState } from 'react';
import { ReactSketchCanvas, ReactSketchCanvasRef } from 'react-sketch-canvas';
import { useToast } from '../ui/toast';
import { Button } from '../ui/button';
import { Eraser, SendHorizontal, X } from 'lucide-react';

interface GlowpadProps {
    // eslint-disable-next-line no-unused-vars
    onSend: (_: string) => void;
    onCancel: () => void;
    color?: string;
}

export default function Glowpad({ onSend, onCancel, color = '#6366f1' }: GlowpadProps) {
    const canvasRef = useRef<ReactSketchCanvasRef>(null);
    const toast = useToast();
    const [isDrawing, setIsDrawing] = useState(false);

    const handleSend = async () => {
        if (!canvasRef.current) return;
        try {
            // Export as a lightweight PNG sequence via Data URI
            const dataUri = await canvasRef.current.exportImage('png');
            onSend(dataUri);
        } catch (err) {
            toast.error('Failed to process glow stroke.');
        }
    };

    const handleClear = () => {
        if (canvasRef.current) {
            canvasRef.current.clearCanvas();
            setIsDrawing(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 p-4 bg-obsidian-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between px-2">
                <div className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400 tracking-widest uppercase">
                    Ephemeral Canvas
                </div>
                <button onClick={onCancel} className="text-white/40 hover:text-white transition-colors">
                    <X size={18} />
                </button>
            </div>

            <div className="relative rounded-xl overflow-hidden border border-white/5 bg-[#0B0E14] shadow-inner" style={{ height: '200px' }}>
                {/* Ambient background grid */}
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '20px 20px' }} />

                <div className="absolute inset-0 z-10" onPointerDown={() => setIsDrawing(true)}>
                    <ReactSketchCanvas
                        ref={canvasRef}
                        strokeWidth={4}
                        strokeColor={color}
                        canvasColor="transparent"
                        style={{ border: 'none' }}
                        withTimestamp={false}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <button
                    onClick={handleClear}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white/50 hover:bg-white/5 hover:text-white transition-colors"
                >
                    <Eraser size={14} /> Clear
                </button>

                <Button
                    onClick={handleSend}
                    disabled={!isDrawing}
                    size="sm"
                    className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-full px-5 flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.4)] disabled:opacity-50 disabled:shadow-none transition-all"
                >
                    Shoot <SendHorizontal size={14} />
                </Button>
            </div>
        </div>
    );
}

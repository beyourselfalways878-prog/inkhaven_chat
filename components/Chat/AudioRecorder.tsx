"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AudioRecorderProps {
    onRecordingComplete: (audioBlob: Blob, duration: number) => void;
    maxDuration?: number;
}

export function AudioRecorder({ onRecordingComplete, maxDuration = 600 }: AudioRecorderProps) {
    const [isRecording, setIsRecording] = useState(false);
    const [duration, setDuration] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const [waveformData, setWaveformData] = useState<number[]>([]);

    const startRecording = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Setup audio context for waveform visualization
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            analyserRef.current = analyser;
            const source = audioContext.createMediaStreamSource(stream);
            source.connect(analyser);

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
                onRecordingComplete(audioBlob, duration);
                setDuration(0);
                setWaveformData([]);
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start timer
            let elapsed = 0;
            timerRef.current = window.setInterval(() => {
                elapsed += 1;
                setDuration(elapsed);

                // Update waveform data
                const dataArray = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(dataArray);
                setWaveformData(Array.from(dataArray).slice(0, 20));

                if (elapsed >= maxDuration) {
                    stopRecording();
                }
            }, 100);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to access microphone');
            setIsRecording(false);
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
            }

            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }

            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        }
    };

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach((track) => track.stop());
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
                {error}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <motion.button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`rounded-full p-3 text-white transition ${isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                    whileTap={{ scale: 0.95 }}
                >
                    {isRecording ? (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="6" width="12" height="12" />
                        </svg>
                    ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <circle cx="12" cy="12" r="8" />
                        </svg>
                    )}
                </motion.button>

                {isRecording && (
                    <div className="flex items-center gap-2 flex-1">
                        <div className="flex gap-1 items-end h-6">
                            {waveformData.map((value, idx) => (
                                <motion.div
                                    key={idx}
                                    className="w-1 bg-indigo-500 rounded-full"
                                    animate={{ height: `${Math.max(4, (value / 255) * 24)}px` }}
                                    transition={{ duration: 0.1 }}
                                />
                            ))}
                        </div>
                        <span className="text-sm font-mono text-slate-600 min-w-12">
                            {formatTime(duration)}
                        </span>
                    </div>
                )}
            </div>

            {isRecording && (
                <div className="text-xs text-slate-500">
                    Recording... (max {formatTime(maxDuration)})
                </div>
            )}
        </div>
    );
}

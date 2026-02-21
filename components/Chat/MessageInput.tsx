/* eslint-disable no-unused-vars */
"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip, PenTool } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { FileUpload } from './FileUpload';
import { EmojiToggle } from './EmojiPicker';
import Glowpad from './Glowpad';
import { MessageReplyPreview, type ReplyMessage } from './MessageReply';
import type { WebRTCMessage } from '../../lib/hooks/useWebRTC';

interface MessageInputProps {
  myId: string;
  replyTo?: ReplyMessage | null;
  onCancelReply?: () => void;
  onIntensityChange?: (__intensity: number) => void;
  onSendMessage: (_content: string, _type?: WebRTCMessage['messageType'], _replyToId?: string, _metadata?: any) => void;
  onTyping: (_isTyping: boolean) => void;
}

export default function MessageInput({ myId, replyTo, onCancelReply, onIntensityChange, onSendMessage, onTyping }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [safetyEnabled, setSafetyEnabled] = useState(true);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [showGlowpad, setShowGlowpad] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const typingTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim()) return;
    setBlockedMessage(null);
    if (safetyEnabled) {
      setChecking(true);
      try {
        const res = await fetch('/api/moderation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'check', text: value.trim() })
        });
        const json = await res.json();
        if (json?.data?.flagged === true) {
          setBlockedMessage('Message blocked by safety filter. Try rephrasing.');
          setChecking(false);
          return;
        }
      } catch {
        // fail open
      } finally {
        setChecking(false);
      }
    }

    onSendMessage(value.trim(), 'text', replyTo?.id);
    setValue('');
    onCancelReply?.();
  };

  const handleAudioRecordingComplete = async (audioBlob: Blob, duration: number) => {
    setShowAudioRecorder(false);
    setUploadProgress(0);
    try {
      const urlRes = await fetch('/api/audio/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, audioDuration: duration, fileMimeType: 'audio/webm' })
      });
      const { uploadUrl, audioUrl } = await urlRes.json();
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/webm' },
        body: audioBlob
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      onSendMessage(audioUrl, 'audio', replyTo?.id);
      onCancelReply?.();
    } catch (err) {
      console.error('Audio upload failed:', err);
      setBlockedMessage('Failed to upload audio. Please try again.');
    }
  };

  const handleFileSelected = async (file: File) => {
    setShowFileUpload(false);
    setUploadProgress(0);
    try {
      const urlRes = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, fileName: file.name, fileSize: file.size, fileMimeType: file.type })
      });
      const { uploadUrl, fileUrl } = await urlRes.json();
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      onSendMessage(fileUrl, 'file', replyTo?.id, { fileName: file.name, fileSize: file.size, fileMimeType: file.type, fileUrl });
      onCancelReply?.();
    } catch (err) {
      console.error('File upload failed:', err);
      setBlockedMessage('Failed to upload file. Please try again.');
    }
  };

  const handleGlowpadSend = (base64Image: string) => {
    setShowGlowpad(false);
    onSendMessage(base64Image, 'glowpad', replyTo?.id);
  };

  const handleEmojiSelect = (emoji: string) => {
    setValue(prev => prev + emoji);
    inputRef.current?.focus();
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('inkhaven:preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.safetyFilter === 'boolean') setSafetyEnabled(parsed.safetyFilter);
      }
    } catch {
      // ignore
    }
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, []);

  // Focus input when replying
  useEffect(() => {
    if (replyTo) inputRef.current?.focus();
  }, [replyTo]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);

    try { onTyping(true); } catch { /* ignore */ }

    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      try { onTyping(false); } catch { /* ignore */ }
    }, 1200);
  };

  // Typing velocity tracker
  const [intensity, setIntensity] = useState(0);
  const keystrokes = useRef<number[]>([]);

  const trackTypingVelocity = () => {
    const now = Date.now();
    keystrokes.current = [...keystrokes.current, now].filter(t => now - t < 2000);
    const cpm = keystrokes.current.length * 30;
    const rawIntensity = Math.min(cpm / 300, 1);

    setIntensity(prev => {
      const target = rawIntensity;
      return target > prev ? target : prev * 0.95;
    });

    if (onIntensityChange) onIntensityChange(intensity);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    trackTypingVelocity();

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
      keystrokes.current = []; // Reset on send
      setIntensity(0);
      if (onIntensityChange) onIntensityChange(0);
    }
  };

  // Decay intensity when idle
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      if (keystrokes.current.length > 0) {
        const valid = keystrokes.current.filter(t => now - t < 2000);
        if (valid.length !== keystrokes.current.length) {
          keystrokes.current = valid;
          const cpm = valid.length * 30;
          const newIntensity = Math.min(cpm / 300, 1);
          setIntensity(newIntensity);
          if (onIntensityChange) onIntensityChange(newIntensity);
        }
      } else if (intensity > 0.01) {
        setIntensity(prev => {
          const next = prev * 0.9;
          if (onIntensityChange) onIntensityChange(next);
          return next;
        });
      }
    }, 100);
    return () => clearInterval(timer);
  }, [intensity, onIntensityChange]);

  const isBusy = checking;

  return (
    <div className="border-t border-white/5 bg-slate-900/80 backdrop-blur-sm">
      <AnimatePresence>
        {replyTo && onCancelReply && (
          <MessageReplyPreview replyTo={replyTo as any} onCancel={onCancelReply} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAudioRecorder && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3"
          >
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <AudioRecorder onRecordingComplete={handleAudioRecordingComplete} />
            </div>
          </motion.div>
        )}
        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3"
          >
            <div className="p-3 bg-white/5 rounded-xl border border-white/5">
              <FileUpload onFileSelected={handleFileSelected} />
            </div>
          </motion.div>
        )}
        {showGlowpad && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pt-3 pb-2"
          >
            <Glowpad
              onSend={handleGlowpadSend}
              onCancel={() => setShowGlowpad(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={onSubmit} className="px-3 py-2">
        <div className="flex items-end gap-1.5">
          <div className="flex items-center gap-0.5 pb-0.5">
            <button
              type="button"
              onClick={() => { setShowGlowpad(!showGlowpad); setShowAudioRecorder(false); setShowFileUpload(false); }}
              className={`p-2 rounded-xl transition-colors ${showGlowpad ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              title="Draw Ephemeral Neon"
            >
              <PenTool size={20} />
            </button>
            <button
              type="button"
              onClick={() => { setShowAudioRecorder(!showAudioRecorder); setShowFileUpload(false); setShowGlowpad(false); }}
              className={`p-2 rounded-xl transition-colors ${showAudioRecorder ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              title="Record audio"
            >
              <Mic size={20} />
            </button>
            <button
              type="button"
              onClick={() => { setShowFileUpload(!showFileUpload); setShowAudioRecorder(false); setShowGlowpad(false); }}
              className={`p-2 rounded-xl transition-colors ${showFileUpload ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              title="Upload file"
            >
              <Paperclip size={20} />
            </button>
            <EmojiToggle onSelect={handleEmojiSelect} />
          </div>

          <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            placeholder={replyTo ? 'Type your reply...' : 'Type a message...'}
          />

          <button
            type="submit"
            disabled={isBusy || !value.trim()}
            className={`
              p-2.5 rounded-xl transition-all
              ${value.trim()
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20'
                : 'bg-white/5 text-white/20 cursor-not-allowed'
              }
            `}
          >
            <Send size={18} className={isBusy ? 'animate-pulse' : ''} />
          </button>
        </div>

        <AnimatePresence>
          {blockedMessage && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-2 text-xs text-amber-400/80 px-1"
            >
              ⚠️ {blockedMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-indigo-500 rounded-full"
              animate={{ width: `${uploadProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </form>
    </div>
  );
}

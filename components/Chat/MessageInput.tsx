"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Paperclip } from 'lucide-react';
import chatClient from '../../lib/chatClient';
import { AudioRecorder } from './AudioRecorder';
import { FileUpload } from './FileUpload';
import { EmojiToggle } from './EmojiPicker';
import { MessageReplyPreview, type ReplyMessage } from './MessageReply';

interface MessageInputProps {
  roomId: string;
  myId: string;
  replyTo?: ReplyMessage | null;
  onCancelReply?: () => void;
  onIntensityChange?: (_intensity: number) => void; // eslint-disable-line no-unused-vars
}

export default function MessageInput({ roomId, myId, replyTo, onCancelReply, onIntensityChange }: MessageInputProps) {
  const [value, setValue] = useState('');
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [safetyEnabled, setSafetyEnabled] = useState(true);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const typingTimer = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: (content: string) => chatClient.sendMessage(roomId, myId, content),
    onMutate: async (content: string) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const tempMsg = {
        id: tempId, roomId, senderId: myId, content,
        createdAt: new Date().toISOString(), status: 'sending', readAt: null,
        replyTo: replyTo || null,
      };

      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      const previous = queryClient.getQueryData<any[]>(['messages', roomId]);
      queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => ([...(old || []), tempMsg]));

      return { previous, tempId };
    },
    onError: (_err, _content, context: any) => {
      if (context?.tempId) {
        queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) =>
          (old || []).map((m: any) => (m.id === context.tempId ? { ...m, status: 'failed' } : m))
        );
      } else if (context?.previous) {
        queryClient.setQueryData(['messages', roomId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      setValue('');
      onCancelReply?.();
    }
  });

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
    mutation.mutate(value.trim());
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
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const tempMsg = {
        id: tempId, roomId, senderId: myId, content: audioUrl, messageType: 'audio',
        createdAt: new Date().toISOString(), status: 'sending', readAt: null
      };
      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => ([...(old || []), tempMsg]));
      await chatClient.sendMessage(roomId, myId, audioUrl, 'audio'); // Pass messageType
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
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
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const tempMsg = {
        id: tempId, roomId, senderId: myId, content: fileUrl, messageType: 'file',
        metadata: { fileName: file.name, fileSize: file.size, fileMimeType: file.type, fileUrl },
        createdAt: new Date().toISOString(), status: 'sending', readAt: null
      };
      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => ([...(old || []), tempMsg]));
      await chatClient.sendMessage(roomId, myId, fileUrl, 'file'); // Pass messageType
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    } catch (err) {
      console.error('File upload failed:', err);
      setBlockedMessage('Failed to upload file. Please try again.');
    }
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
    try { chatClient.sendTyping(roomId, myId); } catch { /* ignore */ }
    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => { }, 1200);
  };

  // Typing velocity tracker
  const [intensity, setIntensity] = useState(0);
  const keystrokes = useRef<number[]>([]);

  // Calculate intensity on every keystroke
  const trackTypingVelocity = () => {
    const now = Date.now();
    // Keep keystrokes from last 2 seconds
    keystrokes.current = [...keystrokes.current, now].filter(t => now - t < 2000);

    // Calculate CPM (Chars Per Minute) roughly
    // 2 seconds window * 30 = 60 seconds
    const cpm = keystrokes.current.length * 30;

    // Normalize: 0 to 300 CPM (approx 60 WPM) -> 0.0 to 1.0
    const rawIntensity = Math.min(cpm / 300, 1);

    // Smooth decay/attack
    setIntensity(prev => {
      const target = rawIntensity;
      // Attack fast, decay slow (handled by parent or CSS, but smoothing here helps)
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
        // Remove old keystrokes
        const valid = keystrokes.current.filter(t => now - t < 2000);
        if (valid.length !== keystrokes.current.length) {
          keystrokes.current = valid;
          // Recalculate
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

  const isBusy = mutation.isPending || checking;

  return (
    <div className="border-t border-white/5 bg-slate-900/80 backdrop-blur-sm">
      {/* Reply preview */}
      <AnimatePresence>
        {replyTo && onCancelReply && (
          <MessageReplyPreview replyTo={replyTo} onCancel={onCancelReply} />
        )}
      </AnimatePresence>

      {/* Audio / File panels */}
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
      </AnimatePresence>

      {/* Main input */}
      <form onSubmit={onSubmit} className="px-3 py-2">
        <div className="flex items-end gap-1.5">
          {/* Left tools */}
          <div className="flex items-center gap-0.5 pb-0.5">
            <button
              type="button"
              onClick={() => { setShowAudioRecorder(!showAudioRecorder); setShowFileUpload(false); }}
              className={`p-2 rounded-xl transition-colors ${showAudioRecorder ? 'bg-red-500/20 text-red-400' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              title="Record audio"
            >
              <Mic size={20} />
            </button>
            <button
              type="button"
              onClick={() => { setShowFileUpload(!showFileUpload); setShowAudioRecorder(false); }}
              className={`p-2 rounded-xl transition-colors ${showFileUpload ? 'bg-indigo-500/20 text-indigo-400' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              title="Upload file"
            >
              <Paperclip size={20} />
            </button>
            <EmojiToggle onSelect={handleEmojiSelect} />
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            value={value}
            onChange={onChange}
            onKeyDown={handleKeyDown}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all"
            placeholder={replyTo ? 'Type your reply...' : 'Type a message...'}
          />

          {/* Send */}
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

        {/* Blocked message */}
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

        {/* Upload progress */}
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

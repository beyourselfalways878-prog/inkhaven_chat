"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import chatClient from '../../lib/chatClient';
import { AudioRecorder } from './AudioRecorder';
import { FileUpload } from './FileUpload';

export default function MessageInput({ roomId, myId }: { roomId: string; myId: string }) {
  const [value, setValue] = useState('');
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [safetyEnabled, setSafetyEnabled] = useState(true);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const queryClient = useQueryClient();
  const typingTimer = useRef<number | null>(null);

  const mutation = useMutation({
    mutationFn: (content: string) => chatClient.sendMessage(roomId, myId, content),
    onMutate: async (content: string) => {
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const tempMsg = { id: tempId, roomId, senderId: myId, content, createdAt: new Date().toISOString(), status: 'sending', readAt: null };

      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      const previous = queryClient.getQueryData<any[]>(['messages', roomId]);
      queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => ([...(old || []), tempMsg]));

      return { previous, tempId };
    },
    onError: (_err, _content, context: any) => {
      if (context?.tempId) {
        queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => (old || []).map((m: any) => (m.id === context.tempId ? { ...m, status: 'failed' } : m)));
      } else if (context?.previous) {
        queryClient.setQueryData(['messages', roomId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
      setValue('');
    }
  });

  const onSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!value.trim()) return;
    setBlockedMessage(null);
    if (safetyEnabled) {
      setChecking(true);
      try {
        const res = await fetch('/api/moderation/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: value.trim() })
        });
        const json = await res.json();
        if (json?.allowed === false) {
          setBlockedMessage('Message blocked by safety filter. Try rephrasing.');
          setChecking(false);
          return;
        }
      } catch (_err) {
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
      // Get upload URL
      const urlRes = await fetch('/api/audio/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, duration })
      });
      const { uploadUrl, audioUrl } = await urlRes.json();

      // Upload to Supabase
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'audio/webm' },
        body: audioBlob
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      // Send message with audio URL
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const tempMsg = {
        id: tempId,
        roomId,
        senderId: myId,
        content: audioUrl,
        messageType: 'audio',
        createdAt: new Date().toISOString(),
        status: 'sending',
        readAt: null
      };

      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      const previous = queryClient.getQueryData<any[]>(['messages', roomId]);
      queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => ([...(old || []), tempMsg]));

      await chatClient.sendMessage(roomId, myId, audioUrl);
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
      // Get upload URL
      const urlRes = await fetch('/api/files/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: myId, fileName: file.name, fileSize: file.size })
      });
      const { uploadUrl, fileUrl } = await urlRes.json();

      // Upload to Supabase
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file
      });

      if (!uploadRes.ok) throw new Error('Upload failed');

      // Send message with file URL
      const tempId = `temp_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`;
      const tempMsg = {
        id: tempId,
        roomId,
        senderId: myId,
        content: fileUrl,
        messageType: 'file',
        metadata: { fileName: file.name, fileSize: file.size, fileType: file.type },
        createdAt: new Date().toISOString(),
        status: 'sending',
        readAt: null
      };

      await queryClient.cancelQueries({ queryKey: ['messages', roomId] });
      const previous = queryClient.getQueryData<any[]>(['messages', roomId]);
      queryClient.setQueryData(['messages', roomId], (old: any[] | undefined) => ([...(old || []), tempMsg]));

      await chatClient.sendMessage(roomId, myId, fileUrl);
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    } catch (err) {
      console.error('File upload failed:', err);
      setBlockedMessage('Failed to upload file. Please try again.');
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('inkhaven:preferences');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.safetyFilter === 'boolean') setSafetyEnabled(parsed.safetyFilter);
      }
    } catch (_err) {
      // ignore
    }
    return () => {
      if (typingTimer.current) window.clearTimeout(typingTimer.current);
    };
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    try {
      chatClient.sendTyping(roomId, myId);
    } catch (err) {
      // ignore
    }

    if (typingTimer.current) window.clearTimeout(typingTimer.current);
    typingTimer.current = window.setTimeout(() => {
      // noop
    }, 1200);
  };

  return (
    <form onSubmit={onSubmit} className="px-4 py-3 border-t bg-slate-50">
      <AnimatePresence>
        {showAudioRecorder && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-3 p-3 bg-white rounded-lg border border-slate-200"
          >
            <AudioRecorder onRecordingComplete={handleAudioRecordingComplete} />
          </motion.div>
        )}

        {showFileUpload && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="mb-3 p-3 bg-white rounded-lg border border-slate-200"
          >
            <FileUpload onFileSelected={handleFileSelected} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 items-end">
        <div className="flex gap-1">
          <motion.button
            type="button"
            onClick={() => {
              setShowAudioRecorder(!showAudioRecorder);
              setShowFileUpload(false);
            }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 transition"
            title="Record audio"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="8" />
            </svg>
          </motion.button>

          <motion.button
            type="button"
            onClick={() => {
              setShowFileUpload(!showFileUpload);
              setShowAudioRecorder(false);
            }}
            whileTap={{ scale: 0.95 }}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-200 transition"
            title="Upload file"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </motion.button>
        </div>

        <input
          value={value}
          onChange={onChange}
          className="flex-1 rounded border border-slate-200 px-4 py-2"
          placeholder="Type a message..."
        />
        <button type="submit" disabled={mutation.isPending || checking} className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 transition">
          {mutation.isPending ? 'Sending...' : checking ? 'Checking...' : 'Send'}
        </button>
      </div>

      {blockedMessage && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-xs text-amber-600"
        >
          {blockedMessage}
        </motion.div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-2 h-1 bg-slate-200 rounded-full overflow-hidden"
        >
          <motion.div
            className="h-full bg-indigo-600"
            animate={{ width: `${uploadProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </motion.div>
      )}
    </form>
  );
}

"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import chatClient from '../chatClient';

export type PresenceUser = {
    userId: string;
    displayName?: string;
    status: 'online' | 'away' | 'offline';
    lastSeen: string;
};

/**
 * Hook for tracking presence of users in a chat room
 * Provides real-time online/offline status updates
 */
export function usePresence(
    roomId: string,
    userId: string,
    displayName: string
) {
    const [presenceState, setPresenceState] = useState<Record<string, PresenceUser[]>>({});
    const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const activityTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Extract online users from presence state
    useEffect(() => {
        const users: PresenceUser[] = [];
        Object.values(presenceState).forEach((presences) => {
            presences.forEach((p) => {
                if (p.userId !== userId && p.status === 'online') {
                    users.push(p);
                }
            });
        });
        setOnlineUsers(users);
    }, [presenceState, userId]);

    // Subscribe to presence
    useEffect(() => {
        if (!roomId || !userId) return;

        const client = chatClient as any;
        if (!client.subscribeToPresence) return;

        const unsub = client.subscribeToPresence(
            roomId,
            userId,
            displayName,
            (state: Record<string, PresenceUser[]>) => {
                setPresenceState(state);
                setIsConnected(true);
            }
        );

        return () => {
            if (unsub) unsub();
        };
    }, [roomId, userId, displayName]);

    // Track user activity and set away status after inactivity
    const markActive = useCallback(() => {
        const client = chatClient as any;
        if (!client.updatePresenceStatus) return;

        // Clear existing timeout
        if (activityTimeoutRef.current) {
            clearTimeout(activityTimeoutRef.current);
        }

        // Update to online
        client.updatePresenceStatus(roomId, userId, 'online');

        // Set away after 2 minutes of inactivity
        activityTimeoutRef.current = setTimeout(() => {
            client.updatePresenceStatus(roomId, userId, 'away');
        }, 2 * 60 * 1000);
    }, [roomId, userId]);

    // Listen for user activity
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];

        events.forEach(event => {
            window.addEventListener(event, markActive, { passive: true });
        });

        // Initial mark as active
        markActive();

        return () => {
            events.forEach(event => {
                window.removeEventListener(event, markActive);
            });
            if (activityTimeoutRef.current) {
                clearTimeout(activityTimeoutRef.current);
            }
        };
    }, [markActive]);

    // Handle page visibility changes
    useEffect(() => {
        if (typeof document === 'undefined') return;

        const handleVisibilityChange = () => {
            const client = chatClient as any;
            if (!client.updatePresenceStatus) return;

            if (document.hidden) {
                client.updatePresenceStatus(roomId, userId, 'away');
            } else {
                client.updatePresenceStatus(roomId, userId, 'online');
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [roomId, userId]);

    return {
        presenceState,
        onlineUsers,
        isConnected,
        markActive
    };
}

export default usePresence;

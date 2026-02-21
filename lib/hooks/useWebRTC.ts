import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface WebRTCMessage {
    id: string;
    senderId: string;
    content: string;
    createdAt: string;
    replyToId?: string;
    messageType: 'text' | 'image' | 'audio' | 'system' | 'file' | 'glowpad';
    metadata?: any;
    reactions?: string[];
    isEdited?: boolean;
}

export type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'failed';

const METERED_USERNAME = process.env.NEXT_PUBLIC_METERED_TURN_USERNAME || "ecbd7a98d14a357e0529d58f";
const METERED_CREDENTIAL = process.env.NEXT_PUBLIC_METERED_TURN_CREDENTIAL || "Dfov44eAgjeSEVr9";

const RTC_CONFIG = {
    iceServers: [
        {
            urls: "stun:stun.relay.metered.ca:80",
        },
        {
            urls: "turn:global.relay.metered.ca:80",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
        {
            urls: "turn:global.relay.metered.ca:80?transport=tcp",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
        {
            urls: "turn:global.relay.metered.ca:443",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
        {
            urls: "turns:global.relay.metered.ca:443?transport=tcp",
            username: METERED_USERNAME,
            credential: METERED_CREDENTIAL,
        },
    ]
};

export function useWebRTC(roomId: string, userId: string) {
    const [messages, setMessages] = useState<WebRTCMessage[]>([]);
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
    const [partnerId, setPartnerId] = useState<string | null>(null);
    const [partnerTyping, setPartnerTyping] = useState(false);

    const pcRef = useRef<RTCPeerConnection | null>(null);
    const channelRef = useRef<RealtimeChannel | null>(null);
    const dataChannelRef = useRef<RTCDataChannel | null>(null);
    const seenOffersRef = useRef<Set<string>>(new Set());
    const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Initialize WebRTC
    useEffect(() => {
        if (!roomId || !userId) return;

        let pc = new RTCPeerConnection(RTC_CONFIG);
        pcRef.current = pc;

        // 1. Setup Supabase Channel for Signaling
        const sigChannel = supabase.channel(`webrtc_${roomId}`, {
            config: { broadcast: { self: false } }
        });
        channelRef.current = sigChannel;

        pc.oniceconnectionstatechange = () => {
            switch (pc.iceConnectionState) {
                case 'connected':
                case 'completed':
                    setConnectionState('connected');
                    break;
                case 'disconnected':
                case 'failed':
                case 'closed':
                    setConnectionState('disconnected');
                    break;
            }
        };

        // 2. Handle incoming Signaling messages via Supabase Broadcast
        sigChannel.on('broadcast', { event: 'signal' }, async ({ payload }) => {
            const { type, senderId, data } = payload;
            if (senderId === userId) return; // ignore self
            setPartnerId(senderId);

            try {
                if (type === 'OFFER') {
                    // To prevent offer collision
                    if (seenOffersRef.current.has(senderId)) return;
                    seenOffersRef.current.add(senderId);

                    await pc.setRemoteDescription(new RTCSessionDescription(data));
                    const answer = await pc.createAnswer();
                    await pc.setLocalDescription(answer);

                    sigChannel.send({
                        type: 'broadcast',
                        event: 'signal',
                        payload: { type: 'ANSWER', senderId: userId, data: pc.localDescription }
                    });
                } else if (type === 'ANSWER') {
                    await pc.setRemoteDescription(new RTCSessionDescription(data));
                } else if (type === 'ICE_CANDIDATE') {
                    await pc.addIceCandidate(new RTCIceCandidate(data));
                }
            } catch (err) {
                console.error('[WebRTC] Signaling error:', err);
            }
        });

        // 3. Send out ICE Candidates as they pop up
        pc.onicecandidate = (event) => {
            if (event.candidate) {
                sigChannel.send({
                    type: 'broadcast',
                    event: 'signal',
                    payload: { type: 'ICE_CANDIDATE', senderId: userId, data: event.candidate }
                });
            }
        };

        // 4. Handle incoming Data Channel (if we are the Answerer)
        pc.ondatachannel = (event) => {
            const receiveChannel = event.channel;
            setupDataChannel(receiveChannel);
        };

        const setupDataChannel = (dc: RTCDataChannel) => {
            dc.onopen = () => {
                setConnectionState('connected');
            };
            dc.onclose = () => {
                setConnectionState('disconnected');
            };
            dc.onmessage = (e) => {
                try {
                    const event = JSON.parse(e.data);

                    if (event.type === 'CHAT') {
                        setMessages(prev => [...prev, event.payload]);
                    }
                    else if (event.type === 'TYPING') {
                        setPartnerTyping(event.payload.isTyping);
                        if (event.payload.isTyping) {
                            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                            typingTimeoutRef.current = setTimeout(() => setPartnerTyping(false), 3000);
                        }
                    }
                    else if (event.type === 'EDIT') {
                        setMessages(prev => prev.map(m => m.id === event.payload.id ? { ...m, content: event.payload.content, isEdited: true } : m));
                    }
                    else if (event.type === 'REACTION') {
                        setMessages(prev => prev.map(m => m.id === event.payload.id ? { ...m, reactions: [...(m.reactions || []), event.payload.reaction] } : m));
                    }
                } catch (err) {
                    console.error('Failed to parse incoming P2P message', err);
                }
            };
            dataChannelRef.current = dc;
        };

        // 5. Connect Channel & Decide who Offers
        sigChannel.subscribe(async (status) => {
            if (status === 'SUBSCRIBED') {
                sigChannel.send({
                    type: 'broadcast',
                    event: 'hello',
                    payload: { senderId: userId }
                });
            }
        });

        // Handle HELLO
        sigChannel.on('broadcast', { event: 'hello' }, async ({ payload }) => {
            const { senderId } = payload;
            if (senderId === userId) return;
            setPartnerId(senderId);

            // Deciding who makes the offer: Lexicographical comparison of IDs
            if (userId > senderId) {
                if (pc.signalingState !== 'stable') return;
                const sendChannel = pc.createDataChannel('chat');
                setupDataChannel(sendChannel);

                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    sigChannel.send({
                        type: 'broadcast',
                        event: 'signal',
                        payload: { type: 'OFFER', senderId: userId, data: pc.localDescription }
                    });
                } catch (e) {
                    console.error('[WebRTC] Error creating offer', e);
                }
            } else {
                // I am smaller. I must ensure the larger peer knows I am here so they can send the offer!
                sigChannel.send({
                    type: 'broadcast',
                    event: 'hello_back',
                    payload: { senderId: userId }
                });
            }
        });

        // Handle HELLO_BACK
        sigChannel.on('broadcast', { event: 'hello_back' }, async ({ payload }) => {
            const { senderId } = payload;
            if (senderId === userId) return;
            setPartnerId(senderId);

            if (userId > senderId) {
                if (pc.signalingState !== 'stable') return;
                const sendChannel = pc.createDataChannel('chat');
                setupDataChannel(sendChannel);

                try {
                    const offer = await pc.createOffer();
                    await pc.setLocalDescription(offer);
                    sigChannel.send({
                        type: 'broadcast',
                        event: 'signal',
                        payload: { type: 'OFFER', senderId: userId, data: pc.localDescription }
                    });
                } catch (e) {
                    console.error('[WebRTC] Error creating offer', e);
                }
            }
        });

        return () => {
            dataChannelRef.current?.close();
            pc.close();
            supabase.removeChannel(sigChannel);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [roomId, userId]);

    // Send Message Over P2P
    const sendMessage = useCallback((content: string, messageType: WebRTCMessage['messageType'] = 'text', replyToId?: string, metadata?: any) => {
        if (!dataChannelRef.current || dataChannelRef.current.readyState !== 'open') {
            return null;
        }

        const newMsg: WebRTCMessage = {
            id: crypto.randomUUID(),
            senderId: userId,
            content,
            createdAt: new Date().toISOString(),
            replyToId,
            messageType,
            metadata
        };

        dataChannelRef.current.send(JSON.stringify({ type: 'CHAT', payload: newMsg }));
        setMessages(prev => [...prev, newMsg]);
        return newMsg;
    }, [userId]);

    // Send Typing Indicator Over P2P
    const sendTyping = useCallback((isTyping: boolean) => {
        if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({ type: 'TYPING', payload: { isTyping } }));
        }
    }, []);

    // Edit Message Over P2P
    const editMessage = useCallback((messageId: string, newContent: string) => {
        if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({ type: 'EDIT', payload: { id: messageId, content: newContent } }));
        }
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, content: newContent, isEdited: true } : m));
    }, []);

    // React to Message Over P2P
    const reactToMessage = useCallback((messageId: string, reaction: string) => {
        if (dataChannelRef.current?.readyState === 'open') {
            dataChannelRef.current.send(JSON.stringify({ type: 'REACTION', payload: { id: messageId, reaction } }));
        }
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, reactions: [...((m as any).reactions || []), reaction] } : m));
    }, []);

    return {
        messages,
        connectionState,
        sendMessage,
        sendTyping,
        editMessage,
        reactToMessage,
        partnerId,
        partnerTyping
    };
}

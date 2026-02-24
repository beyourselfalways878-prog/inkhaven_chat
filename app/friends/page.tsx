"use client";
import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useSessionStore } from '../../stores/useSessionStore';
import { Avatar } from '../../components/ui/avatar';
import { useRouter } from 'next/navigation';
import { Loader2, MessageSquarePlus, UserX } from 'lucide-react';
import { useToast } from '../../components/ui/toast';
import { AuraBlendBackground } from '../../components/InkAura';

interface Friend {
    friendshipId: string;
    partnerId: string;
    displayName: string;
    reputation: number;
    auraSeed: number;
    createdAt: string;
}

export default function FriendsPage() {
    const session = useSessionStore((s) => s.session);
    const router = useRouter();
    const toast = useToast();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Only logged in profiles can have friends
        if (!session.userId || !session.displayName) {
            router.replace('/onboarding');
            return;
        }

        const fetchFriends = async () => {
            try {
                setLoading(true);
                // Fetch all friendships where I am user1 OR user2
                const { data: friendships, error } = await supabase
                    .from('friendships')
                    .select('*')
                    .or(`user1_id.eq.${session.userId},user2_id.eq.${session.userId}`)
                    .eq('status', 'active');

                if (error) throw error;

                // We need to resolve the partner's profile for each friendship
                const enrichedFriends: Friend[] = [];

                for (const f of friendships) {
                    const partnerId = f.user1_id === session.userId ? f.user2_id : f.user1_id;

                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('display_name, reputation, aura_seed')
                        .eq('id', partnerId)
                        .single();

                    if (profile) {
                        enrichedFriends.push({
                            friendshipId: f.id,
                            partnerId,
                            displayName: profile.display_name,
                            reputation: profile.reputation,
                            auraSeed: profile.aura_seed,
                            createdAt: f.created_at,
                        });
                    }
                }

                setFriends(enrichedFriends.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
            } catch (err) {
                console.error("Failed to load friends", err);
                toast.error("Could not load your friends list.");
            } finally {
                setLoading(false);
            }
        };

        fetchFriends();
    }, [session.userId, session.displayName, router, toast]);

    const removeFriend = async (friendshipId: string, name: string) => {
        try {
            // Opting to soft-delete by setting status 'blocked' or fully deleting the row.
            // We will delete the row for simplicity of "Remove Friend".
            const { error } = await supabase.from('friendships').delete().eq('id', friendshipId);
            if (error) throw error;
            setFriends(prev => prev.filter(f => f.friendshipId !== friendshipId));
            toast.success(`Removed ${name} from your friends.`);
        } catch (err) {
            toast.error("Failed to remove friend.");
        }
    };

    const inviteToRoom = (partnerId: string) => {
        // Private rooms can just use a seeded UUID + Timestamp, but we'll use a clean string.
        const privateRoomId = `private-${session.userId!.slice(0, 5)}-${Date.now()}`;

        // We will fire a real-time notification to the partner using Supabase Broadcast 
        // on a general "user_${partnerId}" channel before redirecting.
        const channel = supabase.channel(`user_${partnerId}`);
        channel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
                channel.send({
                    type: 'broadcast',
                    event: 'invite',
                    payload: {
                        roomId: privateRoomId,
                        inviterName: session.displayName,
                    }
                });

                toast.success("Invite sent! Opening room...");
                setTimeout(() => {
                    router.push(`/chat/${privateRoomId}`);
                }, 1000);
            }
        });
    };

    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl min-h-[80vh]">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Your Connections</h1>
                    <p className="text-slate-600 dark:text-white/60 mt-2">People you&apos;ve mutually saved chats with.</p>
                </div>
            </div>

            <div className="hyper-glass p-1">
                <AuraBlendBackground
                    seed1={session.auraSeed || 42}
                    seed2={777}
                    intensity={0.2}
                    className="rounded-3xl min-h-[50vh] p-6 lg:p-10"
                >
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-indigo-400 py-20">
                            <Loader2 className="w-10 h-10 animate-spin mb-4" />
                            <p className="font-mono text-sm tracking-widest">LOADING CONNECTIONS...</p>
                        </div>
                    ) : friends.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-white/40 py-20 text-center">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-6">
                                <UserX className="w-10 h-10 opacity-50" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No friends yet</h3>
                            <p className="max-w-md">When you and your anonymous partner both click &quot;Save&quot;, you&apos;ll see each other here.</p>
                            <button
                                onClick={() => router.push('/quick-match')}
                                className="mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-indigo-500/25"
                            >
                                Find a Match
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {friends.map((friend) => (
                                <div key={friend.friendshipId} className="bg-white/90 dark:bg-obsidian-900/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl p-5 flex items-center justify-between group hover:border-indigo-500/50 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <Avatar
                                            userId={friend.partnerId}
                                            displayName={friend.displayName}
                                            auraSeed={friend.auraSeed}
                                            reputation={friend.reputation}
                                            size="lg"
                                        />
                                        <div>
                                            <h3 className="font-bold text-slate-900 dark:text-white text-lg">{friend.displayName}</h3>
                                            <p className="text-xs text-slate-500 dark:text-white/50 font-mono mt-0.5">Matched: {new Date(friend.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => inviteToRoom(friend.partnerId)}
                                            className="p-2.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-500 hover:text-white rounded-xl transition-colors"
                                            title="Invite to Private Room"
                                        >
                                            <MessageSquarePlus size={20} />
                                        </button>
                                        <button
                                            onClick={() => removeFriend(friend.friendshipId, friend.displayName)}
                                            className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-colors"
                                            title="Remove friend"
                                        >
                                            <UserX size={20} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </AuraBlendBackground>
            </div>
        </div>
    );
}

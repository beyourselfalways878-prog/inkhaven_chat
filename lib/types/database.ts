/**
 * Generated Supabase Database Types
 * Describes all tables, views, and functions in the database
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    ink_id: string
                    display_name: string | null
                    reputation: number
                    interests: string[]
                    comfort_level: string
                    is_ephemeral: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    ink_id: string
                    display_name?: string | null
                    reputation?: number
                    interests?: string[]
                    comfort_level?: string
                    is_ephemeral?: boolean
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    ink_id?: string
                    display_name?: string | null
                    reputation?: number
                    interests?: string[]
                    comfort_level?: string
                    is_ephemeral?: boolean
                    created_at?: string
                    updated_at?: string
                }
            }
            rooms: {
                Row: {
                    id: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    created_at?: string
                }
            }
            messages: {
                Row: {
                    id: number
                    room_id: string
                    sender_id: string
                    content: string
                    message_type: string
                    is_reported: boolean
                    moderation_status: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    room_id: string
                    sender_id: string
                    content: string
                    message_type?: string
                    is_reported?: boolean
                    moderation_status?: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    room_id?: string
                    sender_id?: string
                    content?: string
                    message_type?: string
                    is_reported?: boolean
                    moderation_status?: string
                    created_at?: string
                }
            }
            room_participants: {
                Row: {
                    room_id: string
                    user_id: string
                    joined_at: string
                    last_seen_at: string
                    last_seen_message_id: number | null
                    typing_at: string | null
                }
                Insert: {
                    room_id: string
                    user_id: string
                    joined_at?: string
                    last_seen_at?: string
                    last_seen_message_id?: number | null
                    typing_at?: string | null
                }
                Update: {
                    room_id?: string
                    user_id?: string
                    joined_at?: string
                    last_seen_at?: string
                    last_seen_message_id?: number | null
                    typing_at?: string | null
                }
            }
            message_statuses: {
                Row: {
                    id: number
                    message_id: string
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    message_id: string
                    status: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    message_id?: string
                    status?: string
                    created_at?: string
                }
            }
            user_interests: {
                Row: {
                    user_id: string
                    interest: string
                    weight: number
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    interest: string
                    weight?: number
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    interest?: string
                    weight?: number
                    updated_at?: string
                }
            }
            connection_queue: {
                Row: {
                    user_id: string
                    mode: string
                    waiting_since: string
                    matched_with: string | null
                    current_room_id: string | null
                    interests: string[]
                    comfort_level: string
                    mood: string
                    vibe_score: number
                    skip_count: number
                    last_match_at: string | null
                }
                Insert: {
                    user_id: string
                    mode?: string
                    waiting_since?: string
                    matched_with?: string | null
                    current_room_id?: string | null
                    interests?: string[]
                    comfort_level?: string
                    mood?: string
                    vibe_score?: number
                    skip_count?: number
                    last_match_at?: string | null
                }
                Update: {
                    user_id?: string
                    mode?: string
                    waiting_since?: string
                    matched_with?: string | null
                    current_room_id?: string | null
                    interests?: string[]
                    comfort_level?: string
                    mood?: string
                    vibe_score?: number
                    skip_count?: number
                    last_match_at?: string | null
                }
            }
            user_embeddings: {
                Row: {
                    user_id: string
                    embedding: number[] | null
                    last_chat_embedding: number[] | null
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    embedding?: number[] | null
                    last_chat_embedding?: number[] | null
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    embedding?: number[] | null
                    last_chat_embedding?: number[] | null
                    updated_at?: string
                }
            }
            match_history: {
                Row: {
                    id: string
                    user_id: string
                    partner_id: string
                    room_id: string | null
                    action: 'matched' | 'skipped' | 'liked' | 'reported'
                    conversation_duration: number
                    messages_exchanged: number
                    compatibility_score: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    partner_id: string
                    room_id?: string | null
                    action: 'matched' | 'skipped' | 'liked' | 'reported'
                    conversation_duration?: number
                    messages_exchanged?: number
                    compatibility_score?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    partner_id?: string
                    room_id?: string | null
                    action?: 'matched' | 'skipped' | 'liked' | 'reported'
                    conversation_duration?: number
                    messages_exchanged?: number
                    compatibility_score?: number
                    created_at?: string
                }
            }
            user_preferences: {
                Row: {
                    user_id: string
                    preferred_comfort_levels: string[]
                    preferred_interests: string[]
                    avoid_interests: string[]
                    min_reputation: number
                    conversation_style: 'brief' | 'balanced' | 'deep'
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    preferred_comfort_levels?: string[]
                    preferred_interests?: string[]
                    avoid_interests?: string[]
                    min_reputation?: number
                    conversation_style?: 'brief' | 'balanced' | 'deep'
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    preferred_comfort_levels?: string[]
                    preferred_interests?: string[]
                    avoid_interests?: string[]
                    min_reputation?: number
                    conversation_style?: 'brief' | 'balanced' | 'deep'
                    updated_at?: string
                }
            }
            user_blocks: {
                Row: {
                    id: string
                    blocker_id: string
                    blocked_id: string
                    reason: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    blocker_id: string
                    blocked_id: string
                    reason?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    blocker_id?: string
                    blocked_id?: string
                    reason?: string | null
                    created_at?: string
                }
            }
            banned_users: {
                Row: {
                    user_id: string
                    banned_at: string
                    banned_until: string | null
                    reason: string
                    banned_by: string | null
                    created_at: string
                }
                Insert: {
                    user_id: string
                    banned_at?: string
                    banned_until?: string | null
                    reason: string
                    banned_by?: string | null
                    created_at?: string
                }
                Update: {
                    user_id?: string
                    banned_at?: string
                    banned_until?: string | null
                    reason?: string
                    banned_by?: string | null
                    created_at?: string
                }
            }
            presence_status: {
                Row: {
                    user_id: string
                    status: 'online' | 'away' | 'offline'
                    last_seen_at: string
                    updated_at: string
                }
                Insert: {
                    user_id: string
                    status?: 'online' | 'away' | 'offline'
                    last_seen_at?: string
                    updated_at?: string
                }
                Update: {
                    user_id?: string
                    status?: 'online' | 'away' | 'offline'
                    last_seen_at?: string
                    updated_at?: string
                }
            }
            message_reports: {
                Row: {
                    id: string
                    message_id: number
                    reporter_id: string
                    reason: string
                    description: string | null
                    status: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    message_id: number
                    reporter_id: string
                    reason: string
                    description?: string | null
                    status?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    message_id?: number
                    reporter_id?: string
                    reason?: string
                    description?: string | null
                    status?: string
                    created_at?: string
                }
            }
        }
        Functions: {
            update_presence: {
                Args: { p_user_id: string; p_status: string }
                Returns: void
            }
            get_room_participants_with_presence: {
                Args: { p_room_id: string }
                Returns: {
                    user_id: string
                    display_name: string | null
                    ink_id: string
                    status: string
                    last_seen_at: string
                    joined_at: string
                }[]
            }
            is_user_banned: {
                Args: { p_user_id: string }
                Returns: boolean
            }
            is_user_blocked: {
                Args: { p_user_id: string; p_target_id: string }
                Returns: boolean
            }
            get_user_reputation: {
                Args: { p_user_id: string }
                Returns: number
            }
            mark_messages_read: {
                Args: { p_room_id: string; p_user_id: string; p_message_id: number }
                Returns: void
            }
            set_typing: {
                Args: { p_room_id: string; p_user_id: string; p_is_typing: boolean }
                Returns: void
            }
            get_typing_users: {
                Args: { p_room_id: string }
                Returns: { user_id: string; display_name: string | null }[]
            }
            find_best_vector_match: {
                Args: { p_user_id: string; p_mode: string; p_limit?: number }
                Returns: {
                    user_id: string
                    similarity_score: number
                    interest_overlap: number
                    vibe_score: number
                }[]
            }
            cosine_similarity: {
                Args: { a: number[]; b: number[] }
                Returns: number
            }
        }
    }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

// Common table types
export type Profile = Tables<'profiles'>
export type Room = Tables<'rooms'>
export type Message = Tables<'messages'>
export type RoomParticipant = Tables<'room_participants'>
export type MatchHistory = Tables<'match_history'>
export type UserBlock = Tables<'user_blocks'>
export type PresenceStatus = Tables<'presence_status'>
export type ConnectionQueue = Tables<'connection_queue'>

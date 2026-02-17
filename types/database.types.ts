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
                    comfort_level: 'gentle' | 'balanced' | 'bold'
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
                    comfort_level?: 'gentle' | 'balanced' | 'bold'
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
                    comfort_level?: 'gentle' | 'balanced' | 'bold'
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
            messages: {
                Row: {
                    id: number
                    room_id: string
                    sender_id: string | null
                    content: string
                    message_type: 'text' | 'audio' | 'file' | 'system'
                    file_url: string | null
                    file_name: string | null
                    file_size: number | null
                    audio_duration: number | null
                    is_reported: boolean
                    moderation_status: 'pending' | 'approved' | 'flagged' | 'removed'
                    created_at: string
                }
                Insert: {
                    id?: number
                    room_id: string
                    sender_id?: string | null
                    content: string
                    message_type?: 'text' | 'audio' | 'file' | 'system'
                    file_url?: string | null
                    file_name?: string | null
                    file_size?: number | null
                    audio_duration?: number | null
                    is_reported?: boolean
                    moderation_status?: 'pending' | 'approved' | 'flagged' | 'removed'
                    created_at?: string
                }
                Update: {
                    id?: number
                    room_id?: string
                    sender_id?: string | null
                    content?: string
                    message_type?: 'text' | 'audio' | 'file' | 'system'
                    file_url?: string | null
                    file_name?: string | null
                    file_size?: number | null
                    audio_duration?: number | null
                    is_reported?: boolean
                    moderation_status?: 'pending' | 'approved' | 'flagged' | 'removed'
                    created_at?: string
                }
            }
            connection_queue: {
                Row: {
                    user_id: string
                    mode: 'casual' | 'deep'
                    interests: string[]
                    comfort_level: string | null
                    mood: string | null
                    vibe_score: number | null
                    skip_count: number | null
                    waiting_since: string
                    matched_with: string | null
                    current_room_id: string | null
                    last_match_at: string | null
                }
                Insert: {
                    user_id: string
                    mode?: 'casual' | 'deep'
                    interests?: string[]
                    comfort_level?: string | null
                    mood?: string | null
                    vibe_score?: number | null
                    skip_count?: number | null
                    waiting_since?: string
                    matched_with?: string | null
                    current_room_id?: string | null
                    last_match_at?: string | null
                }
                Update: {
                    user_id?: string
                    mode?: 'casual' | 'deep'
                    interests?: string[]
                    comfort_level?: string | null
                    mood?: string | null
                    vibe_score?: number | null
                    skip_count?: number | null
                    waiting_since?: string
                    matched_with?: string | null
                    current_room_id?: string | null
                    last_match_at?: string | null
                }
            }
            match_history: {
                Row: {
                    id: string
                    user_id: string | null
                    partner_id: string | null
                    room_id: string | null
                    action: 'matched' | 'skipped' | 'liked' | 'reported'
                    conversation_duration: number
                    messages_exchanged: number
                    compatibility_score: number
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    partner_id?: string | null
                    room_id?: string | null
                    action: 'matched' | 'skipped' | 'liked' | 'reported'
                    conversation_duration?: number
                    messages_exchanged?: number
                    compatibility_score?: number
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    partner_id?: string | null
                    room_id?: string | null
                    action?: 'matched' | 'skipped' | 'liked' | 'reported'
                    conversation_duration?: number
                    messages_exchanged?: number
                    compatibility_score?: number
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never // eslint-disable-line no-unused-vars
        }
        Functions: {
            update_presence: {
                Args: {
                    p_user_id: string
                    p_status: string
                }
                Returns: void
            }
            set_typing: {
                Args: {
                    p_room_id: string
                    p_user_id: string
                    p_is_typing: boolean
                }
                Returns: void
            }
        }
        Enums: {
            [_ in never]: never // eslint-disable-line no-unused-vars
        }
    }
}

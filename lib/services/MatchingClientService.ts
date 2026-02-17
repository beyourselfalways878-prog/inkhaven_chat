import { MatchMode } from '../types/domain';
import { Mood } from '../../components/MoodSelector';

export interface MatchResponse {
    ok: boolean;
    data?: {
        matched: boolean;
        partnerId?: string;
        roomId?: string;
        reason?: string;
    };
    error?: string;
    message?: string;
}

export interface EnqueueParams {
    userId: string;
    mode: MatchMode;
    mood?: Mood;
}

export interface FindMatchParams {
    userId: string;
    mode: MatchMode;
}

class MatchingClientService {
    private async request<T>(endpoint: string, body: any): Promise<T> {
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Request failed');
            }

            return data as T;
        } catch (error: any) {
            console.error(`MatchingClientService Error (${endpoint}):`, error);
            throw error;
        }
    }

    /**
     * Enqueue the user for matching
     */
    async enqueue(params: EnqueueParams): Promise<MatchResponse> {
        return this.request<MatchResponse>('/api/matching', {
            action: 'enqueue',
            ...params,
        });
    }

    /**
     * Attempt to find a match for the user
     */
    async findMatch(params: FindMatchParams): Promise<MatchResponse> {
        return this.request<MatchResponse>('/api/matching', {
            action: 'find',
            ...params,
        });
    }

    /**
     * Create a new room (fallback mechanism)
     */
    async createRoom(userId: string, mode: MatchMode): Promise<{ ok: boolean; data?: { id: string } }> {
        return this.request('/api/rooms', {
            action: 'create',
            userId,
            mode
        });
    }
}

export const matchingClient = new MatchingClientService();

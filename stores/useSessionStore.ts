/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Session = {
  userId?: string | null;
  inkId?: string | null;
  displayName?: string | null;
  interests?: string[] | null;
  comfortLevel?: 'gentle' | 'balanced' | 'bold' | null;
  reputation?: number | null;
  auraSeed?: number | null;
  backgroundTheme?: 'aurora' | 'galactic' | 'rain' | 'none';
};

type State = {
  session: Session;
  setSession: (_s: Session) => void;
  clearSession: () => void;
};

/**
 * Session store — persists only non-sensitive user data.
 * Auth tokens are managed by Supabase's own session management (httpOnly cookies).
 * NEVER store tokens in localStorage.
 */
export const useSessionStore = create<State>()(persist((set) => ({
  session: {},
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: {} })
}), {
  name: 'inkhaven:session',
  // Only persist non-sensitive fields
  partialize: (state) => ({
    session: {
      userId: state.session.userId,
      inkId: state.session.inkId,
      displayName: state.session.displayName,
      interests: state.session.interests,
      comfortLevel: state.session.comfortLevel,
      reputation: state.session.reputation,
      auraSeed: state.session.auraSeed,
      backgroundTheme: state.session.backgroundTheme,
    }
  })
}));
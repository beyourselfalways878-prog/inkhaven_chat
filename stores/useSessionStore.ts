/* eslint-disable no-unused-vars */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Session = {
  userId?: string | null;
  inkId?: string | null;
  token?: string | null;
  displayName?: string | null;
  interests?: string[] | null;
  comfortLevel?: 'gentle' | 'balanced' | 'bold' | null;
};

type State = {
  session: Session;
  setSession: (_s: Session) => void;
  clearSession: () => void;
};

export const useSessionStore = create<State>()(persist((set) => ({
  session: {},
  setSession: (session) => set({ session }),
  clearSession: () => set({ session: {} })
}), {
  name: 'inkhaven:session'
}));
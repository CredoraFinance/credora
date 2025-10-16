import { create } from 'zustand';

interface User {
  _id: string;
  id: string;
  email?: string;
  walletAddress?: string;
  role?: 'BORROWER' | 'LENDER';
  displayName?: string;
  creditScore: number;
}

interface AppState {
  user: User | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isLoading: false }),
}));

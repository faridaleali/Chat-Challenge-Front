import { create } from "zustand";

interface AuthState {
  token: string | null;
  setToken: (token: string | null) => void;
  email: string | null;
  setEmail: (email: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  setToken: (token) => set({ token }),
  setEmail: (email) => set({ email }),
  logout: () => set({ token: null, email: null }),
}));

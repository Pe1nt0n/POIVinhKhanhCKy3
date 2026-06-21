import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  adminInfo: any | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false, // In a real app, you might check localStorage or call a /me endpoint on mount
  isLoading: false,
  error: null,
  adminInfo: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      // Note: The C# backend AuthController requires {"Username", "Password"}
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Login failed');
      }

      set({ 
        isAuthenticated: true, 
        isLoading: false, 
        // We could store token here, but the backend uses HttpOnly cookies, 
        // so the browser will automatically attach it to future requests!
      });
      
    } catch (err: any) {
      set({ error: err.message, isLoading: false, isAuthenticated: false });
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/auth/logout`, { method: 'POST' });
    } catch (e) {}
    set({ isAuthenticated: false, adminInfo: null });
  }
}));

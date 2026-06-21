import { create } from 'zustand';

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role_ids: string[];
  permissions: string[];
  is_poi_owner_verified: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  isHydrating: boolean;
  error: string | null;
  adminInfo: AdminUser | null;

  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isLoading: false,
  isHydrating: true, // Start true because we will fetch on mount
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
        error: null
      });

      // After successful login, fetch the user's role info
      useAuthStore.getState().fetchMe();
      
    } catch (err: any) {
      set({ error: err.message, isLoading: false, isAuthenticated: false, adminInfo: null });
    }
  },

  fetchMe: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/v1/admin/auth/me`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Not authenticated');
      }

      const data = await res.json();
      set({ 
        isAuthenticated: true, 
        adminInfo: data.data,
        isHydrating: false
      });
    } catch (err) {
      set({ 
        isAuthenticated: false, 
        adminInfo: null,
        isHydrating: false
      });
    }
  },

  logout: async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/admin/auth/logout`, { method: 'POST' });
    } catch (e) {}
    set({ isAuthenticated: false, adminInfo: null });
  }
}));

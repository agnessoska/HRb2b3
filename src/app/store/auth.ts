import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '@/shared/lib/supabase'
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
  role: 'hr' | 'candidate' | null
  setSession: (session: Session | null) => void
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setRole: (role: 'hr' | 'candidate' | null) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      loading: true,
      role: null,
      setSession: (session) => set({ session }),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      setRole: (role) => set({ role }),
    }),
    {
      name: 'auth-storage',
    }
  )
)

supabase.auth.onAuthStateChange((_event: AuthChangeEvent, session: Session | null) => {
  const state = useAuthStore.getState();
  state.setSession(session);
  state.setUser(session?.user ?? null);
  state.setRole(session?.user?.user_metadata?.role ?? null);
  state.setLoading(false);
})

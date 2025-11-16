import { useAuthStore } from '@/app/store/auth';

export const useAuth = () => {
  const { user, session, loading, role } = useAuthStore(state => ({
    user: state.user,
    session: state.session,
    loading: state.loading,
    role: state.role,
  }));

  return { user, session, loading, role, isAuthenticated: !!user };
};

import { useAuthStore } from '@/app/store/auth';

export const useAuth = () => {
  const user = useAuthStore((state) => state.user);
  const session = useAuthStore((state) => state.session);
  const loading = useAuthStore((state) => state.loading);
  const role = useAuthStore((state) => state.role);

  return { user, session, loading, role, isAuthenticated: !!user };
};

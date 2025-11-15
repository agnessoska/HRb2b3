import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth'

export function ProtectedRoute() {
  const { session, loading } = useAuthStore()

  if (loading) {
    // TODO: Add a proper loader component
    return <div>Loading...</div>
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}

import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth'

export function PublicRoute() {
  const { session, loading } = useAuthStore()

  if (loading) {
    return <div>Loading...</div>
  }

  if (session) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

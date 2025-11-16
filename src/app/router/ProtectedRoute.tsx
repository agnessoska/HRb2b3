import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth'

export function ProtectedRoute() {
  const { session, user, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    // TODO: Add a proper loader component
    return <div>Loading...</div>
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  // Redirect from root path based on user role
  if (location.pathname === '/') {
    const role = user?.user_metadata?.role
    if (role === 'hr') {
      return <Navigate to="/hr/dashboard" replace />
    }
    if (role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />
    }
    // Fallback if role is not defined, though this shouldn't happen
    return <Navigate to="/auth/login" replace />
  }

  return <Outlet />
}

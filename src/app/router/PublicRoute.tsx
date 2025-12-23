import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth'

export function PublicRoute() {
  const { session, loading } = useAuthStore()
  const location = useLocation()

  if (loading) {
    return <div>Loading...</div>
  }

  // Allow access to /public/* pages for everyone (logged in or not)
  if (location.pathname.startsWith('/public/')) {
    return <Outlet />
  }

  // Redirect logged in users from auth pages (login/register) to dashboard
  if (session && location.pathname.startsWith('/auth/')) {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

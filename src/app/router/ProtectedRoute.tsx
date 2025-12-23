import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/app/store/auth'
import { Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout'

export function ProtectedRoute() {
  const session = useAuthStore((state) => state.session)
  const user = useAuthStore((state) => state.user)
  const loading = useAuthStore((state) => state.loading)
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/auth/login" replace />
  }

  // Redirect from dashboard path based on user role
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    const role = user?.user_metadata?.role
    if (role === 'hr') {
      return <Navigate to="/hr/dashboard" replace />
    }
    if (role === 'candidate') {
      return <Navigate to="/candidate/dashboard" replace />
    }
    // Fallback if role is not defined, redirect to onboarding
    return <Navigate to="/auth/onboarding" replace />
  }

  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  )
}

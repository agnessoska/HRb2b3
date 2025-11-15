import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout'
import { DashboardLayout } from '@/shared/ui/layouts/DashboardLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import LoginPage from '@/pages/auth/login'
import HRDashboardPage from '@/pages/hr/dashboard'

export const router = createBrowserRouter([
  {
    element: <PublicRoute />,
    children: [
      {
        path: 'auth',
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          },
        ],
      },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <HRDashboardPage />,
          },
        ],
      },
    ],
  },
])

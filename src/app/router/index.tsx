import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import LoginPage from '@/pages/auth/login'
import HRDashboardPage from '@/pages/hr/dashboard'
import CandidateProfilePage from '@/pages/hr/candidate/profile'
import VacancyProfilePage from '@/pages/hr/vacancy/profile'
import CandidateDashboardPage from '@/pages/candidate/dashboard'
import TestPassingPage from '@/pages/candidate/test'
import TestResultsPage from '@/pages/candidate/test/results'

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
        index: true,
        element: null, // ProtectedRoute will handle the redirect
      },
      {
        path: 'hr/dashboard',
        element: <HRDashboardPage />,
      },
      {
        path: 'hr/vacancy/:id/profile',
        element: <VacancyProfilePage />,
      },
      {
        path: 'hr/candidate/:id',
        element: <CandidateProfilePage />,
      },
      {
        path: 'candidate/dashboard',
        element: <CandidateDashboardPage />,
      },
      {
        path: 'candidate/test/:testId',
        element: <TestPassingPage />,
      },
      {
        path: 'candidate/test/:testId/results',
        element: <TestResultsPage />,
      },
    ],
  },
])

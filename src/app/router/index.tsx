import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import LoginPage from '@/pages/auth/login'
import HRDashboardPage from '@/pages/hr/dashboard'
import CandidateProfilePage from '@/pages/hr/candidate/profile'
import VacancyProfilePage from '@/pages/hr/vacancy/profile'
import VacancyFunnelPage from '@/pages/hr/vacancy/[id]/funnel'
import CandidateDashboardPage from '@/pages/candidate/dashboard'
import TestPassingPage from '@/pages/candidate/test'
import TestResultsPage from '@/pages/candidate/test/results'
import TalentMarketPage from '@/pages/hr/talent-market'
import HRChatPage from '@/pages/hr/chat'
import CandidateChatPage from '@/pages/candidate/chat'
import BuyTokensPage from '@/pages/hr/buy-tokens'
import PaymentSuccessPage from '@/pages/hr/payment/success'
import PaymentCancelPage from '@/pages/hr/payment/cancel'
import BillingPage from '@/pages/hr/billing'
import TeamPage from '@/pages/hr/team'

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
      {
        path: 'payment/success',
        element: <PaymentSuccessPage />,
      },
      {
        path: 'payment/cancel',
        element: <PaymentCancelPage />,
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
        path: 'hr/vacancy/:id/funnel',
        element: <VacancyFunnelPage />,
      },
      {
        path: 'hr/candidate/:id',
        element: <CandidateProfilePage />,
      },
      {
        path: 'hr/talent-market',
        element: <TalentMarketPage />,
      },
      {
        path: 'hr/chat',
        element: <HRChatPage />,
      },
      {
        path: 'hr/buy-tokens',
        element: <BuyTokensPage />,
      },
      {
        path: 'hr/billing',
        element: <BillingPage />,
      },
      {
        path: 'hr/team',
        element: <TeamPage />,
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
      {
        path: 'candidate/chat',
        element: <CandidateChatPage />,
      },
    ],
  },
])

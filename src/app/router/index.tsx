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
import HRProfilePage from '@/pages/hr/profile'
import { PageTransition } from '@/shared/ui/PageTransition'

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
            element: (
              <PageTransition>
                <LoginPage />
              </PageTransition>
            ),
          },
        ],
      },
      {
        path: 'payment/success',
        element: (
          <PageTransition>
            <PaymentSuccessPage />
          </PageTransition>
        ),
      },
      {
        path: 'payment/cancel',
        element: (
          <PageTransition>
            <PaymentCancelPage />
          </PageTransition>
        ),
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
        element: (
          <PageTransition>
            <HRDashboardPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/vacancy/:id/profile',
        element: (
          <PageTransition>
            <VacancyProfilePage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/vacancy/:id/funnel',
        element: (
          <PageTransition>
            <VacancyFunnelPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/candidate/:id',
        element: (
          <PageTransition>
            <CandidateProfilePage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/talent-market',
        element: (
          <PageTransition>
            <TalentMarketPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/chat',
        element: (
          <PageTransition>
            <HRChatPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/buy-tokens',
        element: (
          <PageTransition>
            <BuyTokensPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/billing',
        element: (
          <PageTransition>
            <BillingPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/team',
        element: (
          <PageTransition>
            <TeamPage />
          </PageTransition>
        ),
      },
      {
        path: 'hr/profile',
        element: (
          <PageTransition>
            <HRProfilePage />
          </PageTransition>
        ),
      },
      {
        path: 'candidate/dashboard',
        element: (
          <PageTransition>
            <CandidateDashboardPage />
          </PageTransition>
        ),
      },
      {
        path: 'candidate/test/:testId',
        element: (
          <PageTransition>
            <TestPassingPage />
          </PageTransition>
        ),
      },
      {
        path: 'candidate/test/:testId/results',
        element: (
          <PageTransition>
            <TestResultsPage />
          </PageTransition>
        ),
      },
      {
        path: 'candidate/chat',
        element: (
          <PageTransition>
            <CandidateChatPage />
          </PageTransition>
        ),
      },
    ],
  },
])

import { createBrowserRouter } from 'react-router-dom'
import { AuthLayout } from '@/shared/ui/layouts/AuthLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { PublicRoute } from './PublicRoute'
import LoginPage from '@/pages/auth/login'
import LandingPage from '@/pages/public/landing'
import AuthCallbackPage from '@/pages/auth/callback'
import OnboardingPage from '@/pages/auth/onboarding'
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
import MyProfilePage from '@/pages/candidate/profile'
import BuyTokensPage from '@/pages/hr/buy-tokens'
import PaymentSuccessPage from '@/pages/hr/payment/success'
import PaymentCancelPage from '@/pages/hr/payment/cancel'
import BillingPage from '@/pages/hr/billing'
import TeamPage from '@/pages/hr/team'
import HRProfilePage from '@/pages/hr/profile'
import AIAssistantPage from '@/pages/hr/ai-assistant'
import PublicDocumentPage from '@/pages/public/document'
import PrivacyPolicyPage from '@/pages/public/privacy'
import TermsPage from '@/pages/public/terms'
import { PageTransition } from '@/shared/ui/PageTransition'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicRoute />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: 'public/document/:id',
        element: (
          <PageTransition>
            <PublicDocumentPage />
          </PageTransition>
        ),
      },
      {
        path: 'public/privacy',
        element: (
          <PageTransition>
            <PrivacyPolicyPage />
          </PageTransition>
        ),
      },
      {
        path: 'public/terms',
        element: (
          <PageTransition>
            <TermsPage />
          </PageTransition>
        ),
      },
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
    path: 'auth/callback',
    element: <AuthCallbackPage />,
  },
  {
    path: 'auth/onboarding',
    element: (
      <PageTransition>
        <OnboardingPage />
      </PageTransition>
    ),
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: 'dashboard',
        element: null, // ProtectedRoute handles the redirect
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
        path: 'hr/ai-assistant',
        element: (
          <PageTransition>
            <AIAssistantPage />
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
        path: 'candidate/profile',
        element: (
          <PageTransition>
            <MyProfilePage />
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

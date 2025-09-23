import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '@/components/auth/NeonProtectedRoute';

// Lazy load page components for better code splitting
const LazyLayout = lazy(() => import('./Layout.jsx'));
const LazyDashboard = lazy(() => import('./dashboard'));
const LazyBillsPage = lazy(() => import('./bills'));
const LazySubscriptions = lazy(() => import('./subscriptions'));
const LazySettingsPage = lazy(() => import('./settings'));
const LazyAssistantPage = lazy(() => import('./assistant'));
const LazyIncomePage = lazy(() => import('./income'));
const LazyBillTransactionsPage = lazy(() => import('./billtransactions'));
const LazyStickyNotesPage = lazy(() => import('./stickynotes'));
const LazyBudgetBuilderPage = lazy(() => import('./budgetbuilder'));
const LazyBudgetsPage = lazy(() => import('./budgets'));
const LazyBudgetDetails = lazy(() => import('./budgetdetails'));
const LazyLoginPage = lazy(() => import('./login'));

// Loading fallback for page transitions
const PageLoadingFallback = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
    <div className="text-white text-xl">Loading page...</div>
  </div>
);

// Wrapper component with Suspense for each lazy-loaded page
const LazyPageWrapper = ({ Component, ...props }) => (
  <Suspense fallback={<PageLoadingFallback />}>
    <Component {...props} />
  </Suspense>
);

const PAGES = {
  bills: LazyBillsPage,
  dashboard: LazyDashboard,
  subscriptions: LazySubscriptions,
  settings: LazySettingsPage,
  assistant: LazyAssistantPage,
  income: LazyIncomePage,
  billtransactions: LazyBillTransactionsPage,
  stickynotes: LazyStickyNotesPage,
  budgetbuilder: LazyBudgetBuilderPage,
  budgets: LazyBudgetsPage,
  budgetdetails: LazyBudgetDetails,
  login: LazyLoginPage,
};

export default function LazyPages() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoadingFallback />}>
        <LazyLayout>
          <Routes>
            {Object.entries(PAGES).map(([path, Component]) => (
              <Route
                key={path}
                path={`/${path}/*`}
                element={<LazyPageWrapper Component={Component} />}
              />
            ))}
            <Route path="/" element={<LazyPageWrapper Component={LazyDashboard} />} />
          </Routes>
        </LazyLayout>
      </Suspense>
    </ProtectedRoute>
  );
}
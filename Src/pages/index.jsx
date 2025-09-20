import Layout from "./Layout.jsx";

import BillsPage from "./bills";

import Dashboard from "./dashboard";

import Subscriptions from "./subscriptions";

import SettingsPage from "./settings";

import AssistantPage from "./assistant";

import IncomePage from "./income";

import BillTransactionsPage from "./billtransactions";

import StickyNotesPage from "./stickynotes";

import BudgetBuilderPage from "./budgetbuilder";

import BudgetsPage from "./budgets";

import BudgetDetails from "./budgetdetails";

import LoginPage from "./login";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

import { AuthProvider } from '@/contexts/AuthContext';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

const PAGES = {

    bills: BillsPage,

    dashboard: Dashboard,

    subscriptions: Subscriptions,

    settings: SettingsPage,

    assistant: AssistantPage,

    income: IncomePage,

    billtransactions: BillTransactionsPage,

    stickynotes: StickyNotesPage,

    budgetbuilder: BudgetBuilderPage,

    budgets: BudgetsPage,

    budgetdetails: BudgetDetails,

}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);

    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/*" element={
                <ProtectedRoute>
                    <Layout currentPageName={currentPage}>
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/bills" element={<BillsPage />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/subscriptions" element={<Subscriptions />} />
                            <Route path="/settings" element={<SettingsPage />} />
                            <Route path="/assistant" element={<AssistantPage />} />
                            <Route path="/income" element={<IncomePage />} />
                            <Route path="/billtransactions" element={<BillTransactionsPage />} />
                            <Route path="/stickynotes" element={<StickyNotesPage />} />
                            <Route path="/budgetbuilder" element={<BudgetBuilderPage />} />
                            <Route path="/budgets" element={<BudgetsPage />} />
                            <Route path="/budgetdetails" element={<BudgetDetails />} />
                        </Routes>
                    </Layout>
                </ProtectedRoute>
            } />
        </Routes>
    );
}

export default function Pages() {
    return (
        <AuthProvider>
            <Router>
                <PagesContent />
            </Router>
        </AuthProvider>
    );
}
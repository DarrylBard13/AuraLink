import Layout from "./Layout.jsx";

import BillsPage from "./bills.jsx";

import Dashboard from "./dashboard.jsx";

import Subscriptions from "./subscriptions.jsx";

import SettingsPage from "./settings.jsx";

import AssistantPage from "./assistant.jsx";

import IncomePage from "./income.jsx";

import BillTransactionsPage from "./billtransactions.jsx";

import StickyNotesPage from "./stickynotes.jsx";

import BudgetBuilderPage from "./budgetbuilder.jsx";

import BudgetsPage from "./budgets.jsx";

import BudgetDetails from "./budgetdetails.jsx";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

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
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}
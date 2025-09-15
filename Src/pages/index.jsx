import Layout from "./Layout.jsx";

import bills from "./bills";

import dashboard from "./dashboard";

import subscriptions from "./subscriptions";

import settings from "./settings";

import assistant from "./assistant";

import income from "./income";

import billtransactions from "./billtransactions";

import stickynotes from "./stickynotes";

import budgetbuilder from "./budgetbuilder";

import budgets from "./budgets";

import budgetdetails from "./budgetdetails";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    bills: bills,
    
    dashboard: dashboard,
    
    subscriptions: subscriptions,
    
    settings: settings,
    
    assistant: assistant,
    
    income: income,
    
    billtransactions: billtransactions,
    
    stickynotes: stickynotes,
    
    budgetbuilder: budgetbuilder,
    
    budgets: budgets,
    
    budgetdetails: budgetdetails,
    
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
                
                    <Route path="/" element={<bills />} />
                
                
                <Route path="/bills" element={<bills />} />
                
                <Route path="/dashboard" element={<dashboard />} />
                
                <Route path="/subscriptions" element={<subscriptions />} />
                
                <Route path="/settings" element={<settings />} />
                
                <Route path="/assistant" element={<assistant />} />
                
                <Route path="/income" element={<income />} />
                
                <Route path="/billtransactions" element={<billtransactions />} />
                
                <Route path="/stickynotes" element={<stickynotes />} />
                
                <Route path="/budgetbuilder" element={<budgetbuilder />} />
                
                <Route path="/budgets" element={<budgets />} />
                
                <Route path="/budgetdetails" element={<budgetdetails />} />
                
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
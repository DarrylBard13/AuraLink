import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import './index.css'

console.log('Starting AuraLink...');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  console.log('Rendering full AuraLink app...');
  ReactDOM.createRoot(root).render(
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
  console.log('AuraLink app rendered successfully!');
} catch (error) {
  console.error('Failed to render React app:', error);
  // Fallback rendering if React fails
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="min-height: 100vh; background: linear-gradient(135deg, #0f172a, #7c3aed, #0f172a); display: flex; align-items: center; justify-content: center; color: white; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <div style="text-align: center; padding: 2rem;">
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">AuraLink</h1>
          <p style="opacity: 0.8;">Failed to load the application</p>
          <button onclick="window.location.reload()" style="margin-top: 1rem; background: #7c3aed; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer;">
            Reload Page
          </button>
        </div>
      </div>
    `;
  }
} 
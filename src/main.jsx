import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

console.log('Starting AuraLink...');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  console.log('Rendering App...');
  ReactDOM.createRoot(root).render(<App />);
  console.log('App rendered successfully!');
} catch (error) {
  console.error('Failed to render React app:', error);

  // Fallback error display
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `
      <div style="
        min-height: 100vh;
        background: linear-gradient(135deg, rgb(15 23 42) 0%, rgb(88 28 135) 50%, rgb(15 23 42) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: system-ui, -apple-system, sans-serif;
        text-align: center;
        padding: 20px;
      ">
        <div>
          <h1 style="font-size: 2rem; margin-bottom: 1rem;">AuraLink</h1>
          <p style="color: #ef4444; margin-bottom: 0.5rem;">Failed to start application</p>
          <p style="color: rgba(255,255,255,0.6); font-size: 0.875rem;">Check the console for error details</p>
        </div>
      </div>
    `;
  }
} 
import React from 'react'
import ReactDOM from 'react-dom/client'
import SimpleApp from './SimpleApp.jsx'
import './index.css'

console.log('Starting AuraLink...');

try {
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }

  console.log('Rendering SimpleApp...');
  ReactDOM.createRoot(root).render(<SimpleApp />);
  console.log('SimpleApp rendered successfully!');
} catch (error) {
  console.error('Failed to render React app:', error);
} 
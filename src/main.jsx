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
} 
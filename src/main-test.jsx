// Minimal test version to check if React works at all
import React from 'react'
import ReactDOM from 'react-dom/client'

console.log('TEST: Starting minimal React test...');

function TestApp() {
  console.log('TEST: TestApp rendering...');
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a, #7c3aed, #0f172a)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'sans-serif'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>AuraLink Test</h1>
        <p>React is working! ✅</p>
        <p>Current time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

try {
  console.log('TEST: Looking for root element...');
  const root = document.getElementById('root');
  if (!root) {
    throw new Error('Root element not found');
  }
  console.log('TEST: Root element found, creating React root...');
  ReactDOM.createRoot(root).render(<TestApp />);
  console.log('TEST: React app rendered successfully!');
} catch (error) {
  console.error('TEST: Failed to render:', error);
}

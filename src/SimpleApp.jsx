import React from 'react';

// Simple app without Stack Auth for testing
function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-white mb-4">AuraLink</h1>
        <p className="text-white/80 mb-6">
          Your personal finance management dashboard
        </p>
        <div className="space-y-4">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors">
            Sign In with Google
          </button>
          <button className="w-full bg-transparent border border-white/30 hover:bg-white/10 text-white font-medium py-2 px-4 rounded transition-colors">
            Create Account
          </button>
        </div>
        <p className="text-white/60 text-sm mt-6">
          Status: React is working ✅
        </p>
      </div>
    </div>
  );
}

export default SimpleApp;
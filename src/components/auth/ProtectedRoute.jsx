import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/login';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <LoginPage />;
  }

  return children;
}
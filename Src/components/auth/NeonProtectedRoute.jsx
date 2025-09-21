import React from 'react';
import { useUser } from '@stackframe/react';
import NeonLoginPage from '@/pages/neon-login';

export default function NeonProtectedRoute({ children }) {
  const userHook = useUser();
  const { user, isLoading } = userHook || { user: null, isLoading: true };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <NeonLoginPage />;
  }

  return children;
}
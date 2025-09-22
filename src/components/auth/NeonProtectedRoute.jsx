import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/react';
import NeonLoginPage from '@/pages/neon-login';

export default function NeonProtectedRoute({ children }) {
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [error, setError] = useState(null);

  let userHook;
  let user = null;
  let isLoading = true;

  try {
    userHook = useUser();
    user = userHook?.user || null;
    isLoading = userHook?.isLoading ?? true;
  } catch (err) {
    console.error('Stack Auth error:', err);
    setError(err);
    isLoading = false;
  }

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('NeonProtectedRoute: Stack Auth loading timeout - forcing login state');
        setLoadingTimeout(true);
      }
    }, 5000); // Reduced to 5 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const actualIsLoading = isLoading && !loadingTimeout && !error;

  if (actualIsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading AuraLink...</div>
      </div>
    );
  }

  if (error) {
    console.error('Stack Auth initialization failed, showing login page:', error);
  }

  if (!user || error || loadingTimeout) {
    return <NeonLoginPage />;
  }

  return children;
}
import React, { useEffect, useState } from 'react';
import { useUser } from '@stackframe/react';
import NeonLoginPage from '@/pages/neon-login';

export default function NeonProtectedRoute({ children }) {
  const userHook = useUser();
  const { user, isLoading } = userHook || { user: null, isLoading: true };
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('NeonProtectedRoute: Stack Auth loading timeout - forcing non-loading state');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  const actualIsLoading = isLoading && !loadingTimeout;

  if (actualIsLoading) {
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
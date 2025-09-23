import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@/hooks/useStackAuth';

const NeonAuthContext = createContext();

export function useAuth() {
  const context = useContext(NeonAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }) {
  const userHook = useUser();
  const { user, isLoading } = userHook || { user: null, isLoading: true };
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  // Add a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isLoading) {
        console.warn('Stack Auth loading timeout - forcing non-loading state');
        setLoadingTimeout(true);
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(timer);
  }, [isLoading]);

  // Override loading state if timeout occurred
  const actualIsLoading = isLoading && !loadingTimeout;

  const login = () => {
    // Neon Auth handles login through their UI components
    // No manual login function needed
  };

  const logout = async () => {
    if (user) {
      await user.signOut();
    }
  };

  const refreshUser = () => {
    // Neon Auth handles user refresh automatically
  };

  const isAuthenticated = () => {
    return user !== null && user !== undefined;
  };

  const value = {
    user,
    login,
    logout,
    refreshUser,
    isAuthenticated,
    isLoading: actualIsLoading
  };

  return (
    <NeonAuthContext.Provider value={value}>
      {children}
    </NeonAuthContext.Provider>
  );
}
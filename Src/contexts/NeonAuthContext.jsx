import React, { createContext, useContext } from 'react';
import { useUser } from '@stackframe/react';

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
    isLoading
  };

  return (
    <NeonAuthContext.Provider value={value}>
      {children}
    </NeonAuthContext.Provider>
  );
}
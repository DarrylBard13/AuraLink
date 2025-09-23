// Optimized Stack Auth hooks with tree shaking
import { useUser } from '@stackframe/react';

// Re-export specific hooks to enable tree shaking
export { useUser };

// Optional: Create wrapper hooks for additional functionality
export const useAuthUser = () => {
  const user = useUser();

  return {
    user,
    isAuthenticated: !!user,
    isLoading: user === null,
  };
};
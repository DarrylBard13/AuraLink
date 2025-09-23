import { lazy, Suspense } from 'react';

// Lazy load Stack Auth components for better code splitting
const LazySignIn = lazy(() =>
  import('@stackframe/react').then(module => ({ default: module.SignIn }))
);

const LazySignUp = lazy(() =>
  import('@stackframe/react').then(module => ({ default: module.SignUp }))
);

const LazyStackHandler = lazy(() =>
  import('@stackframe/react').then(module => ({ default: module.StackHandler }))
);

// Loading fallback component
const AuthLoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="text-white">Loading authentication...</div>
  </div>
);

// Wrapped components with Suspense
export const SignIn = (props) => (
  <Suspense fallback={<AuthLoadingFallback />}>
    <LazySignIn {...props} />
  </Suspense>
);

export const SignUp = (props) => (
  <Suspense fallback={<AuthLoadingFallback />}>
    <LazySignUp {...props} />
  </Suspense>
);

export const StackHandler = (props) => (
  <Suspense fallback={<AuthLoadingFallback />}>
    <LazyStackHandler {...props} />
  </Suspense>
);
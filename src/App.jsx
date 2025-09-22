import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { StackHandler, StackProvider, StackTheme } from '@stackframe/react'
import { stackClientApp } from '@/stack/client'
import { Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

console.log('App.jsx: Starting to load app components...');
console.log('Stack client app:', stackClientApp);

function HandlerRoutes() {
  const location = useLocation();
  return (
    <StackHandler app={stackClientApp} location={location.pathname} fullPage />
  );
}

function App() {
  console.log('App.jsx: App component rendering...');

  try {
    // Check if Stack Auth is properly configured
    if (!stackClientApp) {
      console.error('Stack client app not initialized');
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-center">
            <h1 className="text-2xl mb-4">AuraLink</h1>
            <p className="text-red-400">Authentication service unavailable. Please check configuration.</p>
          </div>
        </div>
      );
    }

    return (
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
          <div className="text-white text-xl">Loading AuraLink...</div>
        </div>
      }>
        <BrowserRouter>
          <StackProvider app={stackClientApp}>
            <StackTheme>
              <Routes>
                <Route path="/handler/*" element={<HandlerRoutes />} />
                <Route path="/auth/*" element={<HandlerRoutes />} />
                <Route path="/*" element={<Pages />} />
              </Routes>
              <Toaster />
            </StackTheme>
          </StackProvider>
        </BrowserRouter>
      </Suspense>
    )
  } catch (error) {
    console.error('App rendering error:', error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl mb-4">AuraLink</h1>
          <p className="text-red-400">An error occurred: {error.message}</p>
          <p className="text-white/60 text-sm mt-2">Please check the console for more details.</p>
        </div>
      </div>
    );
  }
}

export default App 
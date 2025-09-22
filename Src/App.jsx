import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { StackHandler, StackProvider, StackTheme } from '@stackframe/react'
import { stackClientApp } from '@/stack/client'
import { Suspense } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

function HandlerRoutes() {
  const location = useLocation();
  return (
    <StackHandler app={stackClientApp} location={location.pathname} fullPage />
  );
}

function App() {
  return (
    <Suspense fallback={"Loading..."}>
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
}

export default App 
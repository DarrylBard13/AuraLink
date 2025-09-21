import './App.css'
import Pages from "@/pages/index.jsx"
import { Toaster } from "@/components/ui/toaster"
import { StackProvider, StackHandler } from '@stackframe/react'
import { stackClientApp } from '@/lib/stack'
import { useLocation } from 'react-router-dom'

function HandlerRoutes() {
  const location = useLocation();
  return (
    <StackHandler app={stackClientApp} location={location.pathname} fullPage />
  );
}

function App() {
  return (
    <StackProvider app={stackClientApp}>
      <Pages />
      <HandlerRoutes />
      <Toaster />
    </StackProvider>
  )
}

export default App 
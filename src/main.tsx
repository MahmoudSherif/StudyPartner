import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
import "@github/spark/spark"

import App from './App.tsx'

import "./index.css"

function AppErrorFallback({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
      <div className="bg-white/10 backdrop-blur-md rounded-lg p-8 max-w-md mx-4">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong</h2>
        <p className="text-white/80 mb-6">{error.message}</p>
        <button
          onClick={resetErrorBoundary}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={AppErrorFallback}>
    <App />
   </ErrorBoundary>
) 
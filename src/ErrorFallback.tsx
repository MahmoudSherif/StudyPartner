export function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center p-8 bg-red-900/20 rounded-lg border border-red-500/50">
        <h1 className="text-2xl font-bold mb-4 text-red-400">Something went wrong</h1>
        <p className="text-gray-300 mb-4">{error.message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}
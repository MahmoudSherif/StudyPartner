import { AlertTriangleIcon, RefreshCwIcon } from "lucide-react";

export const ErrorFallback = ({ error, resetErrorBoundary }: { error: Error, resetErrorBoundary: () => void }) => {
  // When encountering an error in the development mode, rethrow it and don't display the boundary.
  // The parent UI will take care of showing a more helpful dialog.
  if (import.meta.env.DEV) throw error;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 p-4 border border-red-300 bg-red-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangleIcon className="h-5 w-5 text-red-600" />
            <h2 className="font-semibold text-red-800">This spark has encountered a runtime error</h2>
          </div>
          <p className="text-red-700 text-sm">
            Something unexpected happened while running the application. The error details are shown below. Contact the spark author and let them know about this issue.
          </p>
        </div>
        
        <div className="bg-card border rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-sm text-muted-foreground mb-2">Error Details:</h3>
          <pre className="text-xs text-red-600 bg-gray-100 p-3 rounded border overflow-auto max-h-32">
            {error.message}
          </pre>
        </div>
        
        <button 
          onClick={resetErrorBoundary} 
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <RefreshCwIcon className="h-4 w-4" />
          Try Again
        </button>
      </div>
    </div>
  );
}
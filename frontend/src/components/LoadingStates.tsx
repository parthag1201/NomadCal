export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="frost-card rounded-2xl p-4 space-y-3 animate-pulse"
        >
          <div className="h-4 bg-slate-700 rounded w-3/4" />
          <div className="h-3 bg-slate-800 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 bg-slate-700 rounded-full w-20" />
            <div className="h-6 bg-slate-700 rounded-full w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-cyan-400 border-r-2 border-cyan-400/50" />
    </div>
  )
}

export function ErrorAlert({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-lg bg-rose-900/30 border border-rose-700 p-4 space-y-3">
      <p className="text-rose-200 text-sm">
        <span className="font-semibold">Error:</span> {message}
      </p>
      {retry && (
        <button
          onClick={retry}
          className="text-xs rounded bg-rose-700 hover:bg-rose-600 px-3 py-1.5 transition text-white"
        >
          Try Again
        </button>
      )}
    </div>
  )
}

export function SuccessAlert({ message }: { message: string }) {
  return (
    <div className="rounded-lg bg-emerald-900/30 border border-emerald-700 p-3">
      <p className="text-emerald-200 text-sm">✓ {message}</p>
    </div>
  )
}

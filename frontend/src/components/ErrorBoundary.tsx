import React, { type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error) {
    console.error('ErrorBoundary caught:', error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="rounded-lg bg-rose-900/20 border border-rose-700 p-6 text-center">
            <p className="text-rose-200 font-semibold mb-2">Something went wrong</p>
            <p className="text-rose-100 text-sm mb-4">{this.state.error?.message}</p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs rounded bg-rose-700 hover:bg-rose-600 px-3 py-1.5 transition text-white"
            >
              Try Again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

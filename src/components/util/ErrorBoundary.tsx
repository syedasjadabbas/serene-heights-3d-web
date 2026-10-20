import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  /** Rendered instead of the children after they throw. */
  fallback?: ReactNode
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
}

/**
 * Keeps an optional enhancement (a WebGL scene, a lazy chunk) from taking the
 * whole page down when it fails — the section simply renders without it.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.warn('[ErrorBoundary]', error, info.componentStack)
  }

  render() {
    return this.state.hasError ? (this.props.fallback ?? null) : this.props.children
  }
}

/**
 * Error Boundary Component
 * Catches and handles errors in the React component tree
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary for catching React errors
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error details
    this.setState({
      error,
      errorInfo,
    });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] p-4">
          <div className="max-w-md w-full bg-[#14141f] border border-neon-blue/30 rounded-lg p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">⚠️</div>
              <h2 className="text-xl font-vcr text-neon-pink mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-400 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                <details className="text-left mb-6 text-sm">
                  <summary className="cursor-pointer text-neon-blue hover:text-neon-blue/80 mb-2">
                    Error Details (Dev Only)
                  </summary>
                  <pre className="bg-black/50 p-3 rounded overflow-auto max-h-48 text-xs">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <button
                onClick={this.handleReset}
                className="bg-neon-blue hover:bg-neon-blue/80 text-[#0a0a0f] font-bold py-2 px-4 rounded transition-colors"
              >
                Try Again
              </button>
              
              <button
                onClick={() => window.location.href = '/'}
                className="ml-3 bg-transparent hover:bg-neon-purple/20 text-neon-purple border border-neon-purple py-2 px-4 rounded transition-colors"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

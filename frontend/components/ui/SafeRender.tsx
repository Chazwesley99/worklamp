'use client';

import { Component, ReactNode } from 'react';
import { JsonViewer } from './JsonViewer';

interface SafeRenderProps {
  children: ReactNode;
  fallback?: ReactNode;
  data?: unknown;
}

interface SafeRenderState {
  hasError: boolean;
  error?: Error;
}

/**
 * Error boundary component that catches rendering errors
 * and displays a fallback UI with the raw data
 */
export class SafeRender extends Component<SafeRenderProps, SafeRenderState> {
  constructor(props: SafeRenderProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SafeRenderState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    console.error('SafeRender caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-red-600 dark:text-red-400">❌</span>
              <h4 className="font-medium text-gray-900 dark:text-white">Rendering Error</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {this.state.error?.message || 'An error occurred while displaying the data'}
            </p>
          </div>
          {this.props.data !== undefined && <JsonViewer data={this.props.data} />}
        </>
      );
    }

    return this.props.children;
  }
}

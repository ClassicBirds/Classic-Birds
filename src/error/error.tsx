// components/ErrorBoundary.tsx
import React, { ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log(error);
    console.log(errorInfo);
    console.error('Client-side error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render a custom error UI here
      return <div>Something went wrong!</div>;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

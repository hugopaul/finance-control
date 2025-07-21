import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Log error to external service (e.g., Sentry)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-base-100 p-4">
          <div className="card w-full max-w-md bg-base-200 shadow-xl border border-base-300">
            <div className="card-body text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              
              <h2 className="text-2xl font-bold text-base-content mb-2">
                Ops! Algo deu errado
              </h2>
              
              <p className="text-base-content/60 mb-6">
                Ocorreu um erro inesperado. Tente novamente ou volte para a página inicial.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="collapse collapse-arrow bg-base-300 mb-4">
                  <summary className="collapse-title text-sm font-medium">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="collapse-content text-left">
                    <pre className="text-xs text-error overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="btn btn-primary gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tentar Novamente
                </button>
                
                <button
                  onClick={this.handleGoHome}
                  className="btn btn-outline gap-2"
                >
                  <Home className="w-4 h-4" />
                  Página Inicial
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
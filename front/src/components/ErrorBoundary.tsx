import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      const Sentry = (window as any).__SENTRY__;
      if (Sentry) Sentry.captureException(error, { extra: info });
    } catch {
      // Sentry not available
    }
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div style={{
          padding: '60px 20px', textAlign: 'center', fontFamily: "'Poppins', sans-serif",
          maxWidth: 500, margin: '0 auto',
        }}>
          <h1 style={{ fontSize: 48, marginBottom: 8, color: '#e74c3c' }}>Error</h1>
          <p style={{ color: '#666', marginBottom: 24 }}>
            Algo salió mal. Recarga la página o intenta de nuevo.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '12px 32px', background: '#111', color: '#fff',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 16,
            }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

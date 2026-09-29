import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-container" style={{ padding: '40px 0' }}>
          <div className="card" style={{ borderLeft: '4px solid var(--risk-critical)', padding: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <AlertTriangle size={24} style={{ color: 'var(--risk-critical)' }} />
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Something went wrong in this view</h2>
            </div>
            <p className="text-muted text-sm" style={{ marginBottom: 16 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
            >
              <RotateCcw size={14} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

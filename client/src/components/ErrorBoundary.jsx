import { Component } from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    console.error('App error boundary caught an error.', error);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-shell flex min-h-screen items-center justify-center px-4">
          <div className="w-full max-w-xl rounded-xl border border-border-subtle bg-bg-surface p-8 shadow-card">
            <p className="text-sm uppercase tracking-[0.2em] text-text-muted">
              Something went wrong
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-text-primary">
              We hit an unexpected error.
            </h1>
            <p className="mt-3 text-text-secondary">
              Try resetting this screen, or head back to the home page and
              continue from there.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={this.handleReset}>Reset</Button>
              <Button asChild variant="secondary">
                <Link to="/">Go home</Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

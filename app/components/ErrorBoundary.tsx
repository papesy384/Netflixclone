"use client";

import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, reset: () => void) => ReactNode);
};

type State = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error);
  }

  reset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const fallback = this.props.fallback;
      if (typeof fallback === "function") {
        return fallback(this.state.error, this.reset);
      }
      if (fallback) return fallback;
      return (
        <div className="flex min-h-[200px] flex-col items-center justify-center gap-4 rounded-lg bg-red-950/50 p-6 text-center">
          <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
          <p className="text-sm text-white/70">
            {this.state.error.message ?? "An unexpected error occurred."}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="rounded bg-[#e50914] px-4 py-2 text-sm font-medium text-white hover:bg-[#f40612]"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

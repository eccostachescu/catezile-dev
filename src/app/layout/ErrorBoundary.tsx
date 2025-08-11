import { Component, ReactNode } from "react";

export class ErrorBoundary extends Component<{ fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error("Render error caught:", error, info);
  }

  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children as any;
  }
}

import React from "react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    console.error("TCHAK render error:", error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div
          data-testid="error-boundary"
          style={{ padding: 24, color: "#FF4D4D", fontFamily: "monospace", fontSize: 14 }}
        >
          <strong>Render error:</strong>
          <pre style={{ whiteSpace: "pre-wrap" }}>
            {String(this.state.error?.stack || this.state.error)}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

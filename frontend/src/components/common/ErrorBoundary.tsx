import React, { Component, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("Uncaught Error Boundary Exception:", error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      const isDev = import.meta.env.DEV;

      return (
        <div
          className="flex items-center justify-center min-h-screen p-8 text-foreground"
          style={{ backgroundColor: "#050811" }}
        >
          <div
            className="flex flex-col items-center w-full max-w-xl p-8 rounded-lg border text-center"
            style={{
              backgroundColor: "#060c18",
              borderColor: "rgba(99, 245, 232, 0.2)",
            }}
          >
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6 text-red-400">
              <AlertTriangle size={32} />
            </div>

            <p
              className="text-xs font-mono tracking-widest text-cyan-400 mb-2 uppercase"
              style={{ color: "#63f5e8" }}
            >
              SYSTEM ERROR HANDLER
            </p>

            <h2 className="text-2xl font-medium mb-3 text-white">
              An unexpected application error occurred.
            </h2>

            <p className="text-sm mb-6 max-w-md leading-relaxed" style={{ color: "#8da5ae" }}>
              The application encountered an unhandled rendering error. Please try refreshing the page or navigating back to safety.
            </p>

            {isDev && this.state.error?.stack && (
              <div
                className="p-4 w-full rounded bg-black/60 border border-red-500/20 overflow-auto mb-6 text-left"
                style={{ maxHeight: "200px" }}
              >
                <p className="text-xs font-mono text-red-400 font-semibold mb-1">
                  Developer Stack Trace:
                </p>
                <pre className="text-xs text-muted-foreground whitespace-break-spaces font-mono" style={{ color: "#f87171" }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className={cn(
                  "flex items-center gap-2 px-5 py-2.5 rounded text-xs font-mono uppercase tracking-wider font-bold",
                  "bg-cyan-400 text-black hover:opacity-90 cursor-pointer transition-opacity"
                )}
                style={{ backgroundColor: "#63f5e8", color: "#041014" }}
              >
                <RotateCcw size={14} />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

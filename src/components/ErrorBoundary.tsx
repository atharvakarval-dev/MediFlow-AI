import React, { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans text-white">
          <div className="max-w-md w-full liquid-glass-strong rounded-[2rem] p-8 border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-500/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-inner">
                <AlertTriangle className="w-10 h-10 text-red-400" strokeWidth={1.5} />
              </div>
              
              <h1 className="text-2xl font-medium text-white mb-3 tracking-tight">Something went wrong</h1>
              
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 w-full mb-8 text-left overflow-auto max-h-32">
                <p className="text-sm text-red-200 font-mono text-xs">
                  {this.state.error?.message || 'An unexpected error occurred.'}
                </p>
              </div>
              
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-white hover:bg-gray-100 text-black px-6 py-4 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,255,255,0.2)] hover:scale-[1.02]"
              >
                <RefreshCw className="w-5 h-5" strokeWidth={2} />
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

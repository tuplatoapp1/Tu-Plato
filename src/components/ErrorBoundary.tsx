import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Algo salió mal</h1>
            <p className="text-gray-500 mb-6">
              La aplicación ha encontrado un error inesperado. Por favor, intente recargar la página.
            </p>
            
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-left overflow-auto max-h-40 text-xs font-mono text-red-800 border border-red-100">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 px-6 py-3 bg-tuplato text-white rounded-xl font-bold hover:bg-tuplato-dark transition-colors shadow-lg shadow-tuplato/20"
              >
                <RefreshCw className="w-4 h-4" />
                Recargar Página
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-6 py-3 bg-white text-red-600 border border-red-200 rounded-xl font-bold hover:bg-red-50 transition-colors"
              >
                Reiniciar Datos
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-400">
              Si el problema persiste, intente "Reiniciar Datos" (esto borrará la configuración local).
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

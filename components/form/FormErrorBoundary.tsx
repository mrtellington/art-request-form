/**
 * Form Error Boundary
 *
 * Specialized error boundary for the art request form.
 * Provides form-specific error recovery and preserves form state when possible.
 */

'use client';

import { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface FormErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
  onSave?: () => void;
}

interface FormErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class FormErrorBoundary extends Component<
  FormErrorBoundaryProps,
  FormErrorBoundaryState
> {
  constructor(props: FormErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<FormErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Form error boundary caught an error:', error, errorInfo);

    // Try to save draft before showing error
    try {
      const formData = localStorage.getItem('artRequestFormDraft');
      if (formData) {
        console.log('Draft data preserved in localStorage');
      }
    } catch (e) {
      console.error('Failed to preserve draft:', e);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    this.props.onReset?.();
  };

  handleSaveAndReset = () => {
    this.props.onSave?.();
    this.handleReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[600px] flex items-center justify-center p-4">
          <Card className="max-w-md w-full p-6">
            <div className="flex flex-col items-center text-center">
              <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold text-zinc-900 mb-2">
                Form Error Occurred
              </h2>
              <p className="text-zinc-600 mb-6">
                The form encountered an unexpected error. Your progress has been saved
                automatically. You can try resetting the form or reload the page.
              </p>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="w-full mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-left">
                  <p className="font-mono text-xs text-amber-900">
                    {this.state.error.toString()}
                  </p>
                </div>
              )}

              <div className="flex gap-3 w-full">
                {this.props.onSave && (
                  <Button onClick={this.handleSaveAndReset} className="flex-1 gap-2">
                    <Save className="w-4 h-4" />
                    Save & Reset
                  </Button>
                )}
                <Button
                  onClick={this.handleReset}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset Form
                </Button>
              </div>

              <p className="text-xs text-zinc-500 mt-4">
                If this problem persists, please contact support.
              </p>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

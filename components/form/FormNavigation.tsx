/**
 * Form Navigation Component
 *
 * Previous/Next buttons for multi-step form navigation.
 * Handles validation before allowing progression to next step.
 */

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2, AlertTriangle } from 'lucide-react';
import { FieldErrors } from 'react-hook-form';

interface FormNavigationProps {
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isSubmitting?: boolean;
  nextLabel?: string;
  previousLabel?: string;
  errors?: FieldErrors;
}

export function FormNavigation({
  onPrevious,
  onNext,
  canGoPrevious,
  canGoNext,
  isFirstStep,
  isLastStep,
  isSubmitting = false,
  nextLabel,
  previousLabel,
  errors = {},
}: FormNavigationProps) {
  // Default labels
  const defaultNextLabel = isLastStep ? 'Submit Request' : 'Next';
  const defaultPreviousLabel = 'Previous';

  // Check if there are any validation errors
  const hasErrors = Object.keys(errors).length > 0;
  const showValidationWarning = isLastStep && hasErrors && !canGoNext;

  return (
    <div className="flex flex-col gap-4 pt-6 border-t border-zinc-200">
      {/* Validation Warning */}
      {showValidationWarning && (
        <div className="flex items-start gap-3 p-4 rounded-lg border bg-amber-50 border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-800">
              Please fix the errors above before submitting
            </p>
            <p className="text-xs text-amber-700 mt-1">
              Required fields are marked with an asterisk (*). Scroll up to see error
              messages.
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Previous Button */}
        <div className="order-2 sm:order-1">
          {!isFirstStep && (
            <Button
              type="button"
              variant="outline"
              onClick={onPrevious}
              disabled={!canGoPrevious || isSubmitting}
              className="gap-2 w-full sm:w-auto"
              size="lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">
                {previousLabel || defaultPreviousLabel}
              </span>
              <span className="sm:hidden">Back</span>
            </Button>
          )}
        </div>

        {/* Next/Submit Button */}
        <div className="ml-auto order-1 sm:order-2 w-full sm:w-auto">
          <Button
            type="button"
            onClick={onNext}
            disabled={!canGoNext || isSubmitting}
            className={`gap-2 w-full sm:w-auto shadow-lg ${isLastStep ? 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80' : ''}`}
            variant={isLastStep ? 'default' : 'default'}
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <span>{nextLabel || defaultNextLabel}</span>
                {!isLastStep && <ArrowRight className="w-4 h-4" />}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

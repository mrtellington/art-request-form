/**
 * Form Navigation Component
 *
 * Previous/Next buttons for multi-step form navigation.
 * Handles validation before allowing progression to next step.
 */

'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

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
}: FormNavigationProps) {
  // Default labels
  const defaultNextLabel = isLastStep ? 'Submit Request' : 'Next';
  const defaultPreviousLabel = 'Previous';

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-6 border-t border-zinc-200">
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
  );
}

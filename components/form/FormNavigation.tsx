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
    <div className="flex items-center justify-between pt-6 border-t border-zinc-200">
      {/* Previous Button */}
      <div>
        {!isFirstStep && (
          <Button
            type="button"
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || isSubmitting}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {previousLabel || defaultPreviousLabel}
          </Button>
        )}
      </div>

      {/* Next/Submit Button */}
      <div className="ml-auto">
        <Button
          type="button"
          onClick={onNext}
          disabled={!canGoNext || isSubmitting}
          className="gap-2"
          variant={isLastStep ? 'default' : 'default'}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              {nextLabel || defaultNextLabel}
              {!isLastStep && <ArrowRight className="w-4 h-4" />}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

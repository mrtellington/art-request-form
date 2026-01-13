/**
 * Step Indicator Component
 *
 * Visual progress indicator for multi-step form.
 * Shows current step and allows navigation to completed steps.
 */

'use client';

import { Check } from 'lucide-react';
import { FormStep } from '@/hooks/useStepNavigation';

interface StepIndicatorProps {
  steps: FormStep[];
  currentStepIndex: number;
  completedSteps: Set<number>;
  onStepClick?: (index: number) => void;
}

export function StepIndicator({
  steps,
  currentStepIndex,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-2">
      {/* Step circles and connectors row */}
      <ol className="flex items-center" role="list">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          const canClick = isPast && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className={`flex items-center ${isLast ? '' : 'flex-1'}`}
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Step Circle */}
              <button
                type="button"
                onClick={() => canClick && onStepClick(index)}
                disabled={!canClick}
                aria-label={`${step.label}${isCurrent ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
                className={`relative z-10 flex-shrink-0 group ${
                  canClick ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30'
                      : isCompleted || isPast
                        ? 'border-primary bg-primary text-white shadow-md'
                        : 'border-zinc-300 bg-white text-zinc-500'
                  } ${canClick ? 'hover:scale-105 hover:shadow-lg hover:border-primary/90 hover:bg-primary/90' : ''}`}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </span>
              </button>

              {/* Connector Line - centered with circles */}
              {!isLast && (
                <div className="flex-1 h-1 mx-2" aria-hidden="true">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPast || isCompleted ? 'bg-primary' : 'bg-zinc-200'
                    }`}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Step labels row */}
      <div className="flex mt-3">
        {steps.map((step, index) => {
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          const isLast = index === steps.length - 1;

          return (
            <div key={`label-${step.id}`} className={`${isLast ? '' : 'flex-1'}`}>
              <span
                className={`text-xs sm:text-sm font-medium transition-colors hidden sm:block whitespace-nowrap ${
                  isCurrent
                    ? 'text-primary font-semibold'
                    : isPast
                      ? 'text-zinc-700'
                      : 'text-zinc-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </nav>
  );
}

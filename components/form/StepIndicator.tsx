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
      <ol className="flex items-center justify-between" role="list">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          const canClick = isPast && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={step.id}
              className="relative flex-1 flex flex-col items-center"
              aria-current={isCurrent ? 'step' : undefined}
            >
              {/* Connector Line - enhanced with gradient and animation */}
              {!isLast && (
                <div
                  className="absolute top-5 left-1/2 w-full h-1 -ml-0.5"
                  aria-hidden="true"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPast || isCompleted
                        ? 'bg-gradient-to-r from-primary to-primary/90'
                        : 'bg-zinc-200'
                    }`}
                  />
                </div>
              )}

              {/* Step Circle and Label */}
              <button
                type="button"
                onClick={() => canClick && onStepClick(index)}
                disabled={!canClick}
                aria-label={`${step.label}${isCurrent ? ' (current)' : ''}${isCompleted ? ' (completed)' : ''}`}
                className={`relative z-10 flex flex-col items-center group ${
                  canClick ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                {/* Enhanced step circle with shadow and animation */}
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                    isCurrent
                      ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-110'
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

                {/* Step Label with improved typography */}
                <span
                  className={`mt-3 text-sm font-medium text-center whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'text-primary font-semibold'
                      : isPast
                        ? 'text-zinc-700'
                        : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>

                {/* Step Description - only show for current/completed */}
                {(isCurrent || isCompleted) && step.description && (
                  <span className="mt-1 text-xs text-zinc-500 text-center max-w-[120px] line-clamp-2">
                    {step.description}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      {/* Progress percentage indicator */}
      <div className="mt-6 flex items-center justify-between text-xs text-zinc-600">
        <span>Progress</span>
        <span className="font-medium">
          {Math.round(((currentStepIndex + 1) / steps.length) * 100)}% complete
        </span>
      </div>
      <div className="mt-2 h-2 bg-zinc-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
          style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          role="progressbar"
          aria-valuenow={Math.round(((currentStepIndex + 1) / steps.length) * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </nav>
  );
}

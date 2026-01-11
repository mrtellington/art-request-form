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
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isCurrent = index === currentStepIndex;
          const isPast = index < currentStepIndex;
          const canClick = isPast && onStepClick;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.id} className="relative flex-1 flex flex-col items-center">
              {/* Connector Line - goes behind the circle */}
              {!isLast && (
                <div
                  className={`absolute top-4 left-1/2 w-full h-0.5 ${
                    isPast ? 'bg-primary' : 'bg-zinc-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Circle and Label */}
              <button
                type="button"
                onClick={() => canClick && onStepClick(index)}
                disabled={!canClick}
                className={`relative z-10 flex flex-col items-center ${
                  canClick ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    isCurrent
                      ? 'border-primary bg-primary text-white'
                      : isCompleted || isPast
                        ? 'border-primary bg-primary text-white'
                        : 'border-zinc-300 bg-white text-zinc-500'
                  } ${canClick ? 'hover:border-primary/90 hover:bg-primary/90' : ''}`}
                >
                  {isCompleted || isPast ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </span>

                {/* Step Label */}
                <span
                  className={`mt-2 text-xs font-medium text-center whitespace-nowrap ${
                    isCurrent
                      ? 'text-primary'
                      : isPast
                        ? 'text-zinc-700'
                        : 'text-zinc-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

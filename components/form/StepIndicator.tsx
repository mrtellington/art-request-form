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

          return (
            <li key={step.id} className="relative flex-1">
              {/* Connector Line */}
              {index !== steps.length - 1 && (
                <div
                  className={`absolute top-4 left-[50%] right-[-50%] h-0.5 ${
                    isPast ? 'bg-blue-600' : 'bg-zinc-200'
                  }`}
                  aria-hidden="true"
                />
              )}

              {/* Step Circle */}
              <button
                type="button"
                onClick={() => canClick && onStepClick(index)}
                disabled={!canClick}
                className={`relative flex flex-col items-center group ${
                  canClick ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors ${
                    isCurrent
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isCompleted
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-zinc-300 bg-white text-zinc-500'
                  } ${
                    canClick
                      ? 'hover:border-blue-700 hover:bg-blue-700'
                      : ''
                  }`}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </span>

                {/* Step Label */}
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent
                      ? 'text-blue-600'
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

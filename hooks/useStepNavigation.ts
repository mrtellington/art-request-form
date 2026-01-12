/**
 * Step Navigation Hook
 *
 * Manages multi-step form navigation with conditional step logic.
 * Steps are shown/hidden based on the requestType field.
 */

import { useMemo, useState, useCallback } from 'react';
import { FormData } from '@/types/form';

export interface FormStep {
  id: string;
  label: string;
  description?: string;
}

export interface UseStepNavigationReturn {
  steps: FormStep[];
  currentStepIndex: number;
  currentStep: FormStep;
  isFirstStep: boolean;
  isLastStep: boolean;
  goToStep: (index: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
}

/**
 * Hook to manage form step navigation
 */
export function useStepNavigation(formData: Partial<FormData>): UseStepNavigationReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  /**
   * Determine which steps to show based on form data
   * Steps are conditionally added based on requestType
   */
  const steps = useMemo((): FormStep[] => {
    const baseSteps: FormStep[] = [
      {
        id: 'requestType',
        label: 'Request Type',
      },
      {
        id: 'projectDetails',
        label: 'Project Details',
        description: 'Client, requestor, and timeline information',
      },
    ];

    // Product Details step only for Mockup and Proofs
    // (Type-specific fields are now consolidated into Project Details step)
    if (formData.requestType === 'Mockup' || formData.requestType === 'Proofs') {
      baseSteps.push({
        id: 'products',
        label: 'Product Details',
        description:
          formData.requestType === 'Mockup'
            ? 'Product information for mockup'
            : 'Product information for proof',
      });
    }

    // Additional Information step (combines project metadata, pertinent info, websites, attachments)
    baseSteps.push({
      id: 'additionalInfo',
      label: 'Additional Information',
      description: 'Project info, links, and attachments',
    });

    // Review step
    baseSteps.push({
      id: 'review',
      label: 'Review & Submit',
      description: 'Review your request before submitting',
    });

    return baseSteps;
  }, [formData.requestType]);

  // Current step
  const currentStep = steps[currentStepIndex];

  // Navigation state
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;
  const canGoPrev = !isFirstStep;
  const canGoNext = !isLastStep;

  // Navigation functions
  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index);
      }
    },
    [steps.length]
  );

  const nextStep = useCallback(() => {
    if (canGoNext) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [canGoNext]);

  const prevStep = useCallback(() => {
    if (canGoPrev) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [canGoPrev]);

  return {
    steps,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    goToStep,
    nextStep,
    prevStep,
    canGoNext,
    canGoPrev,
  };
}

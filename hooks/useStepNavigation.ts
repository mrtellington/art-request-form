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
export function useStepNavigation(
  formData: Partial<FormData>
): UseStepNavigationReturn {
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
        description: 'What type of request is this?',
      },
      {
        id: 'client',
        label: 'Client Info',
        description: 'Who is this request for?',
      },
      {
        id: 'basicInfo',
        label: 'Basic Details',
        description: 'Request details and timeline',
      },
      {
        id: 'requestDetails',
        label: 'Request Details',
        description: 'Specific details for your request type',
      },
    ];

    // Add Products step only for Mockup requests
    if (formData.requestType === 'Mockup') {
      baseSteps.push({
        id: 'products',
        label: 'Products',
        description: 'Product information for mockup',
      });
    }

    // Always include final steps
    baseSteps.push(
      {
        id: 'projectMetadata',
        label: 'Project Info',
        description: 'Budget, collaborators, and labels',
      },
      {
        id: 'attachments',
        label: 'Attachments',
        description: 'Files and reference links',
      },
      {
        id: 'review',
        label: 'Review & Submit',
        description: 'Review your request before submitting',
      }
    );

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

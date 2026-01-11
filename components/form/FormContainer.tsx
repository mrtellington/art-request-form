/**
 * Form Container Component
 *
 * Main multi-step form orchestrator using React Hook Form.
 * Handles form state, validation, step navigation, and submission.
 */

'use client';

import { useState, useCallback } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormData, initialFormData } from '@/types/form';
import { formDataSchema } from '@/lib/schemas/form-schema';
import { useStepNavigation } from '@/hooks/useStepNavigation';
import { useFormPersistence } from '@/hooks/useFormPersistence';
import { StepIndicator } from './StepIndicator';
import { FormNavigation } from './FormNavigation';
import { Card } from '@/components/ui/card';
import { Save } from 'lucide-react';

// Import step components
import { RequestTypeStep } from './steps/RequestTypeStep';
import { ProjectDetailsStep } from './steps/ProjectDetailsStep';
import { RequestDetailsStep } from './steps/RequestDetailsStep';
import { ProductsStep } from './steps/ProductsStep';
import { AdditionalInfoStep } from './steps/AdditionalInfoStep';
import { ReviewStep } from './steps/ReviewStep';

interface FormContainerProps {
  onSubmit: (data: FormData) => Promise<void>;
  initialData?: Partial<FormData>;
  userId: string;
  userEmail: string;
  userName?: string;
}

export function FormContainer({
  onSubmit,
  initialData,
  userId,
  userEmail,
  userName,
}: FormContainerProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

  // Initialize React Hook Form
  const methods = useForm<FormData>({
    resolver: zodResolver(formDataSchema),
    defaultValues: {
      ...initialFormData,
      ...initialData,
      requestorEmail: userEmail,
      requestorName: userName || initialData?.requestorName || '',
    },
    mode: 'onChange',
  });

  const { watch, handleSubmit, trigger } = methods;
  const formData = watch();

  // Auto-save draft functionality
  const { isSaving, lastSaved } = useFormPersistence({
    userId,
    userEmail,
    formData,
    enabled: true,
  });

  // Step navigation
  const {
    steps,
    currentStepIndex,
    currentStep,
    isFirstStep,
    isLastStep,
    nextStep,
    prevStep,
    goToStep,
    canGoNext,
    canGoPrev,
  } = useStepNavigation(formData);

  // Validate current step before moving to next
  const handleNext = useCallback(async () => {
    // Get fields for current step
    const fieldsToValidate = getStepFields(currentStep.id);

    // Trigger validation for current step fields
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      // Mark current step as completed
      setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));

      if (isLastStep) {
        // On last step, submit the form
        handleSubmit(handleFormSubmit)();
      } else {
        // Move to next step
        nextStep();
      }
    }
  }, [currentStep.id, currentStepIndex, isLastStep, nextStep, trigger, handleSubmit]);

  // Handle previous button
  const handlePrevious = useCallback(() => {
    prevStep();
  }, [prevStep]);

  // Handle step click (navigate to previous completed step)
  const handleStepClick = useCallback(
    (index: number) => {
      if (index < currentStepIndex) {
        goToStep(index);
      }
    },
    [currentStepIndex, goToStep]
  );

  // Handle form submission
  const handleFormSubmit = useCallback(
    async (data: FormData) => {
      setIsSubmitting(true);
      try {
        await onSubmit(data);
      } catch (error) {
        console.error('Form submission error:', error);
        // Error handling will be improved in later phases
        alert('Failed to submit form. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit]
  );

  // Render current step component
  const renderStep = () => {
    switch (currentStep.id) {
      case 'requestType':
        return <RequestTypeStep />;
      case 'projectDetails':
        return <ProjectDetailsStep />;
      case 'requestDetails':
        return <RequestDetailsStep />;
      case 'products':
        return <ProductsStep />;
      case 'additionalInfo':
        return <AdditionalInfoStep />;
      case 'review':
        return <ReviewStep />;
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="max-w-4xl mx-auto">
        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator
            steps={steps}
            currentStepIndex={currentStepIndex}
            completedSteps={completedSteps}
            onStepClick={handleStepClick}
          />
        </div>

        {/* Form Content */}
        <Card className="p-8">
          {/* Auto-save Indicator */}
          {(isSaving || lastSaved) && (
            <div className="flex items-center gap-2 text-sm text-zinc-600 mb-4">
              <Save className="w-4 h-4" />
              {isSaving ? (
                <span>Saving draft...</span>
              ) : lastSaved ? (
                <span>Draft saved at {lastSaved.toLocaleTimeString()}</span>
              ) : null}
            </div>
          )}

          {/* Step Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-zinc-900">{currentStep.label}</h2>
            {currentStep.description && (
              <p className="text-zinc-600 mt-1">{currentStep.description}</p>
            )}
          </div>

          {/* Current Step Content */}
          <div className="mb-6">{renderStep()}</div>

          {/* Navigation */}
          <FormNavigation
            onPrevious={handlePrevious}
            onNext={handleNext}
            canGoPrevious={canGoPrev}
            canGoNext={canGoNext || isLastStep}
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isSubmitting={isSubmitting}
          />
        </Card>
      </div>
    </FormProvider>
  );
}

/**
 * Get fields to validate for each step
 */
function getStepFields(stepId: string): (keyof FormData)[] {
  switch (stepId) {
    case 'requestType':
      return ['requestType'];
    case 'projectDetails':
      return [
        'clientName',
        'clientExists',
        'requestorName',
        'requestorEmail',
        'region',
        'requestTitle',
        'dueDate',
      ];
    case 'requestDetails':
      // Conditional fields based on request type
      return [
        'mockupType',
        'pptxType',
        'numberOfSlides',
        'sneakPeekOptions',
        'riseAndShineLevel',
      ];
    case 'products':
      return ['products'];
    case 'additionalInfo':
      return [
        'projectValue',
        'billable',
        'clientType',
        'labels',
        'attachments',
        'websiteLinks',
      ];
    case 'review':
      // Review step validates all fields
      return Object.keys(initialFormData) as (keyof FormData)[];
    default:
      return [];
  }
}

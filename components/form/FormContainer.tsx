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
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const {
    watch,
    handleSubmit,
    trigger,
    formState: { errors: formErrors },
  } = methods;
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

  // Validate current step before moving to next
  const handleNext = useCallback(async () => {
    // Clear any previous submit error
    setSubmitError(null);

    // Manual validation for required fields per step
    const stepErrors: string[] = [];

    if (currentStep.id === 'requestType') {
      if (!formData.requestType) {
        stepErrors.push('Please select a request type');
      }
    }

    if (currentStep.id === 'projectDetails') {
      if (!formData.clientName?.trim()) {
        stepErrors.push('Client name is required');
      }
      if (!formData.requestorName?.trim()) {
        stepErrors.push('Requestor name is required');
      }
      if (!formData.requestorEmail?.trim()) {
        stepErrors.push('Requestor email is required');
      }
      if (!formData.region) {
        stepErrors.push('Region is required');
      }
      if (!formData.requestTitle?.trim()) {
        stepErrors.push('Request title is required');
      }
      if (!formData.dueDate) {
        stepErrors.push('Due date is required');
      }
      // Type-specific validation
      if (formData.requestType === 'Mockup' && !formData.mockupType) {
        stepErrors.push('Mockup type is required');
      }
      if (formData.requestType === 'PPTX' && !formData.pptxType) {
        stepErrors.push('PPTX type is required');
      }
      if (formData.requestType === 'Proofs' && !formData.proofType) {
        stepErrors.push('Proof type is required');
      }
      if (formData.requestType === 'Sneak Peek' && !formData.sneakPeekOptions?.trim()) {
        stepErrors.push('Sneak peek options are required');
      }
      if (
        (formData.requestType === 'PPTX' || formData.requestType === 'Rise & Shine') &&
        !formData.numberOfSlides
      ) {
        stepErrors.push('Number of slides is required');
      }
      if (formData.requestType === 'Rise & Shine' && !formData.riseAndShineLevel) {
        stepErrors.push('Rise & Shine level is required');
      }
    }

    if (currentStep.id === 'products') {
      if (
        (formData.requestType === 'Mockup' || formData.requestType === 'Proofs') &&
        formData.products.length === 0
      ) {
        stepErrors.push('At least one product is required');
      }
    }

    if (currentStep.id === 'additionalInfo') {
      // Project Value required for Mockup, PPTX, Rise & Shine
      if (
        (formData.requestType === 'Mockup' ||
          formData.requestType === 'PPTX' ||
          formData.requestType === 'Rise & Shine') &&
        !formData.projectValue
      ) {
        stepErrors.push('Project value is required');
      }
      // Billable required for Creative Design Services, Mockup
      if (
        (formData.requestType === 'Creative Design Services' ||
          formData.requestType === 'Mockup') &&
        !formData.billable
      ) {
        stepErrors.push('Billable status is required');
      }
      if (!formData.clientType) {
        stepErrors.push('Client type is required');
      }
      // Collaborators check
      if (formData.addCollaborators && formData.collaborators.length === 0) {
        stepErrors.push(
          'Please add at least one collaborator or uncheck "Add Collaborators"'
        );
      }
    }

    if (stepErrors.length > 0) {
      setSubmitError(stepErrors.map((e) => `• ${e}`).join('\n'));
      return;
    }

    // Get fields for current step
    const fieldsToValidate = getStepFields(currentStep.id);

    // Trigger validation for current step fields
    const isValid = await trigger(fieldsToValidate);

    if (isValid) {
      // Mark current step as completed
      setCompletedSteps((prev) => new Set(prev).add(currentStepIndex));

      if (isLastStep) {
        // On last step, submit the form
        // Use handleSubmit with an error handler to capture validation errors
        handleSubmit(handleFormSubmit, (errors) => {
          // Handle validation errors - format nested errors properly
          const formatErrors = (errs: typeof errors, prefix = ''): string[] => {
            const messages: string[] = [];
            for (const [key, value] of Object.entries(errs)) {
              if (!value) continue;
              const fieldName = prefix ? `${prefix}.${key}` : key;
              if (value.message) {
                messages.push(`• ${fieldName}: ${value.message}`);
              } else if (typeof value === 'object') {
                messages.push(...formatErrors(value as typeof errors, fieldName));
              }
            }
            return messages;
          };
          const errorMessages = formatErrors(errors);
          setSubmitError(
            errorMessages.length > 0
              ? errorMessages.join('\n')
              : 'Form validation failed. Please check all required fields.'
          );
          console.error('Form validation errors:', errors);
        })();
      } else {
        // Move to next step
        nextStep();
      }
    }
  }, [
    currentStep.id,
    currentStepIndex,
    isLastStep,
    nextStep,
    trigger,
    handleSubmit,
    handleFormSubmit,
    formData,
  ]);

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

  // Render current step component
  const renderStep = () => {
    switch (currentStep.id) {
      case 'requestType':
        return <RequestTypeStep />;
      case 'projectDetails':
        return <ProjectDetailsStep />;
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
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-midnight">{currentStep.label}</h2>
              {/* Show selected request type badge after step 1 */}
              {currentStepIndex > 0 && methods.watch('requestType') && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                  {methods.watch('requestType')}
                </span>
              )}
            </div>
            {currentStep.description && (
              <p className="text-zinc-600 mt-1">{currentStep.description}</p>
            )}
          </div>

          {/* Current Step Content */}
          <div className="mb-6">{renderStep()}</div>

          {/* Validation Error Display */}
          {(submitError || (isLastStep && Object.keys(formErrors).length > 0)) && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <h4 className="font-medium text-red-800 mb-2">
                Please fix the following errors:
              </h4>
              {submitError && (
                <pre className="text-sm text-red-700 whitespace-pre-wrap">
                  {submitError}
                </pre>
              )}
              {isLastStep && Object.keys(formErrors).length > 0 && !submitError && (
                <ul className="text-sm text-red-700 space-y-1">
                  {Object.entries(formErrors).map(([field, error]) => (
                    <li key={field}>
                      • {field}:{' '}
                      {(error as { message?: string })?.message || 'Invalid value'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
      // Project details now includes type-specific fields (consolidated from RequestDetails step)
      return [
        'clientName',
        'clientExists',
        'requestorName',
        'requestorEmail',
        'region',
        'requestTitle',
        'projectNumber',
        'dueDate',
        // Type-specific fields (conditionally validated based on requestType)
        'mockupType',
        'pptxType',
        'numberOfSlides',
        'presentationStructure',
        'proofType',
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

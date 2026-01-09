/**
 * Client Step
 *
 * Second step where user enters client information.
 * Validates client against CommonSKU API.
 */

'use client';

import { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormData } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';

export function ClientStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();

  const clientName = watch('clientName');
  const [isValidating, setIsValidating] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    exists: boolean;
    clientId?: string;
    message?: string;
  } | null>(null);

  // Debounced client validation
  useEffect(() => {
    if (!clientName || clientName.length < 2) {
      setValidationResult(null);
      setValue('clientExists', false);
      setValue('clientId', undefined);
      return;
    }

    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        // Call CommonSKU validation API
        const response = await fetch(
          `/api/validate-client?clientName=${encodeURIComponent(clientName)}`
        );
        const data = await response.json();

        setValidationResult({
          exists: data.exists,
          clientId: data.clientId,
          message: data.message,
        });

        setValue('clientExists', data.exists);
        if (data.exists && data.clientId) {
          setValue('clientId', data.clientId);
        } else {
          setValue('clientId', undefined);
        }
      } catch (error) {
        console.error('Client validation error:', error);
        setValidationResult({
          exists: false,
          message: 'Failed to validate client. Please try again.',
        });
      } finally {
        setIsValidating(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [clientName, setValue]);

  return (
    <div className="space-y-6">
      {/* Client Name Input */}
      <div>
        <Label htmlFor="clientName" className="text-base font-semibold">
          Client Name <span className="text-red-500">*</span>
        </Label>
        <p className="text-sm text-zinc-600 mt-1 mb-3">
          Enter the client name. We'll check if they exist in CommonSKU.
        </p>

        <div className="relative">
          <Input
            id="clientName"
            {...register('clientName')}
            placeholder="Start typing client name..."
            className={`pr-10 ${
              errors.clientName
                ? 'border-red-500 focus:ring-red-500'
                : validationResult?.exists
                ? 'border-green-500 focus:ring-green-500'
                : ''
            }`}
          />

          {/* Validation Status Icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValidating && (
              <Loader2 className="w-5 h-5 text-zinc-400 animate-spin" />
            )}
            {!isValidating && validationResult && (
              <>
                {validationResult.exists ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-amber-600" />
                )}
              </>
            )}
          </div>
        </div>

        {errors.clientName && (
          <p className="text-sm text-red-600 mt-2">
            {errors.clientName.message}
          </p>
        )}
      </div>

      {/* Validation Result Message */}
      {!isValidating && validationResult && clientName && (
        <div
          className={`flex items-start gap-3 p-4 rounded-lg border ${
            validationResult.exists
              ? 'bg-green-50 border-green-200'
              : 'bg-amber-50 border-amber-200'
          }`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {validationResult.exists ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <AlertCircle className="w-5 h-5 text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                validationResult.exists ? 'text-green-800' : 'text-amber-800'
              }`}
            >
              {validationResult.exists
                ? 'Client Found in CommonSKU'
                : 'Client Not Listed'}
            </p>
            <p
              className={`text-sm mt-1 ${
                validationResult.exists ? 'text-green-700' : 'text-amber-700'
              }`}
            >
              {validationResult.exists
                ? `This client exists in CommonSKU. Files will be organized under their client folder.`
                : `This client is not in CommonSKU. Files will be organized in the "Not Listed" folder.`}
            </p>
            {validationResult.clientId && (
              <p className="text-xs text-green-600 mt-2 font-mono">
                Client ID: {validationResult.clientId}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Hidden fields for form state */}
      <input type="hidden" {...register('clientExists')} />
      <input type="hidden" {...register('clientId')} />
    </div>
  );
}

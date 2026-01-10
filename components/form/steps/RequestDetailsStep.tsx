/**
 * Request Details Step
 *
 * Conditional step that shows different fields based on request type.
 * Each request type has specific fields that need to be filled out.
 */

'use client';

import { useFormContext } from 'react-hook-form';
import { FormData, RiseAndShineLevel } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function RequestDetailsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<FormData>();
  const requestType = watch('requestType');

  // Render fields based on request type
  const renderConditionalFields = () => {
    switch (requestType) {
      case 'Mockup':
        return (
          <div>
            <Label htmlFor="mockupType">
              Mockup Type <span className="text-red-500">*</span>
            </Label>
            <Input
              id="mockupType"
              {...register('mockupType')}
              placeholder="e.g., Product Mockup, Scene Mockup"
            />
            {errors.mockupType && (
              <p className="text-sm text-red-600 mt-2">{errors.mockupType.message}</p>
            )}
          </div>
        );

      case 'PPTX':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="pptxType">
                PPTX Type <span className="text-red-500">*</span>
              </Label>
              <Input
                id="pptxType"
                {...register('pptxType')}
                placeholder="e.g., Sales Presentation, Pitch Deck"
              />
              {errors.pptxType && (
                <p className="text-sm text-red-600 mt-2">{errors.pptxType.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="numberOfSlides">
                Number of Slides <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numberOfSlides"
                type="number"
                min="1"
                {...register('numberOfSlides', { valueAsNumber: true })}
                placeholder="e.g., 10"
              />
              {errors.numberOfSlides && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.numberOfSlides.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="presentationStructure">Presentation Structure</Label>
              <Textarea
                id="presentationStructure"
                {...register('presentationStructure')}
                placeholder="Outline the structure or flow of the presentation..."
                rows={4}
              />
            </div>
          </div>
        );

      case 'Rise & Shine':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="riseAndShineLevel">
                Rise & Shine Level <span className="text-red-500">*</span>
              </Label>
              <Select
                value={watch('riseAndShineLevel') || undefined}
                onValueChange={(value) =>
                  setValue('riseAndShineLevel', value as RiseAndShineLevel, {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger id="riseAndShineLevel">
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Bronze">Bronze</SelectItem>
                  <SelectItem value="Silver">Silver</SelectItem>
                  <SelectItem value="Gold">Gold</SelectItem>
                </SelectContent>
              </Select>
              {errors.riseAndShineLevel && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.riseAndShineLevel.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="numberOfSlides">
                Number of Slides <span className="text-red-500">*</span>
              </Label>
              <Input
                id="numberOfSlides"
                type="number"
                min="1"
                {...register('numberOfSlides', { valueAsNumber: true })}
                placeholder="e.g., 5"
              />
              {errors.numberOfSlides && (
                <p className="text-sm text-red-600 mt-2">
                  {errors.numberOfSlides.message}
                </p>
              )}
            </div>
          </div>
        );

      case 'Proofs':
        return (
          <div>
            <Label htmlFor="proofType">
              Proof Type <span className="text-red-500">*</span>
            </Label>
            <Select
              value={watch('proofType') || undefined}
              onValueChange={(value) =>
                setValue('proofType', value, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger id="proofType">
                <SelectValue placeholder="Select proof type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Whitestone Letterhead">
                  Whitestone Letterhead
                </SelectItem>
                <SelectItem value="Tech Pack (List Specs in Pertinent Information)">
                  Tech Pack (List Specs in Pertinent Information)
                </SelectItem>
                <SelectItem value="Supplier Template">Supplier Template</SelectItem>
                <SelectItem value="No Template (Use for Printed Materials)">
                  No Template (Use for Printed Materials)
                </SelectItem>
              </SelectContent>
            </Select>
            {errors.proofType && (
              <p className="text-sm text-red-600 mt-2">{errors.proofType.message}</p>
            )}
          </div>
        );

      case 'Sneak Peek':
        return (
          <div>
            <Label htmlFor="sneakPeekOptions">
              Sneak Peek Options <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="sneakPeekOptions"
              {...register('sneakPeekOptions')}
              placeholder="Describe what you'd like to preview..."
              rows={4}
            />
            {errors.sneakPeekOptions && (
              <p className="text-sm text-red-600 mt-2">
                {errors.sneakPeekOptions.message}
              </p>
            )}
          </div>
        );

      case 'Creative Design Services':
        return (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded">
            <p className="text-sm">
              No additional details required for Creative Design Services. Continue to the
              next step.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="space-y-6">{renderConditionalFields()}</div>;
}

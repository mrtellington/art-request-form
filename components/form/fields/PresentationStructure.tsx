/**
 * Presentation Structure Component
 *
 * Nested repeatable section for Rise & Shine presentations.
 * Each slide has a title and multiple products (title + link).
 */

'use client';

import { useFieldArray, useFormContext } from 'react-hook-form';
import { FormData, PresentationSlide, SlideProduct } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, X, GripVertical } from 'lucide-react';

export function PresentationStructure() {
  const { control, register } = useFormContext<FormData>();

  const {
    fields: slides,
    append: appendSlide,
    remove: removeSlide,
  } = useFieldArray({
    control,
    name: 'slides',
  });

  const handleAddSlide = () => {
    const newSlide: PresentationSlide = {
      id: crypto.randomUUID(),
      title: '',
      products: [
        {
          id: crypto.randomUUID(),
          title: '',
          link: '',
        },
      ],
    };
    appendSlide(newSlide);
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-lg font-semibold text-midnight">
          Presentation Structure
        </Label>
        <p className="text-sm text-zinc-600 mt-1">
          Define the slides and products for your presentation
        </p>
      </div>

      {slides.length === 0 ? (
        <div className="text-center py-8 border-2 border-dashed border-zinc-200 rounded-lg">
          <p className="text-zinc-500 mb-4">No slides added yet</p>
          <Button type="button" variant="outline" onClick={handleAddSlide}>
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide, slideIndex) => (
            <SlideCard
              key={slide.id}
              slideIndex={slideIndex}
              onRemove={() => removeSlide(slideIndex)}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={handleAddSlide}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slide
          </Button>
        </div>
      )}
    </div>
  );
}

interface SlideCardProps {
  slideIndex: number;
  onRemove: () => void;
}

function SlideCard({ slideIndex, onRemove }: SlideCardProps) {
  const { control, register } = useFormContext<FormData>();

  const {
    fields: products,
    append: appendProduct,
    remove: removeProduct,
  } = useFieldArray({
    control,
    name: `slides.${slideIndex}.products`,
  });

  const handleAddProduct = () => {
    const newProduct: SlideProduct = {
      id: crypto.randomUUID(),
      title: '',
      link: '',
    };
    appendProduct(newProduct);
  };

  return (
    <Card className="p-4 bg-zinc-50">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-zinc-400" />
          <span className="font-medium text-midnight">Slide {slideIndex + 1}</span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onRemove}
          className="text-zinc-500 hover:text-red-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Slide Title */}
        <div>
          <Label htmlFor={`slides.${slideIndex}.title`}>Slide Title</Label>
          <Input
            id={`slides.${slideIndex}.title`}
            {...register(`slides.${slideIndex}.title`)}
            placeholder="Enter slide title..."
            className="mt-1"
          />
        </div>

        {/* Products Section */}
        <div className="space-y-3">
          <Label className="text-sm font-medium text-sky-700">Products</Label>

          {products.map((product, productIndex) => (
            <div key={product.id} className="flex items-start gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeProduct(productIndex)}
                className="text-zinc-400 hover:text-red-600 mt-1 p-1"
              >
                <X className="w-3 h-3" />
              </Button>
              <div className="flex-1 grid grid-cols-2 gap-2">
                <Input
                  {...register(`slides.${slideIndex}.products.${productIndex}.title`)}
                  placeholder="Product Title"
                />
                <Input
                  {...register(`slides.${slideIndex}.products.${productIndex}.link`)}
                  placeholder="Link"
                />
              </div>
            </div>
          ))}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleAddProduct}
            className="text-sky-600 hover:text-sky-700"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Product
          </Button>
        </div>
      </div>
    </Card>
  );
}

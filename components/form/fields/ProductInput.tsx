/**
 * Product Input Component
 *
 * Input fields for a single product in the repeatable products section.
 * Uses local state for text fields to prevent focus loss during typing.
 */

'use client';

import { useState, useRef } from 'react';
import { Product } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProductInputProps {
  product: Product;
  onChange: (product: Product) => void;
  baseTabIndex?: number;
}

export function ProductInput({ product, onChange, baseTabIndex = 0 }: ProductInputProps) {
  // Use local state for all text fields to prevent focus loss during typing
  const [localValues, setLocalValues] = useState({
    name: product.name,
    link: product.link || '',
    color: product.color || '',
    imprintMethod: product.imprintMethod || '',
    imprintColor: product.imprintColor || '',
    location: product.location || '',
    size: product.size || '',
    notes: product.notes || '',
  });
  const [prevProductId, setPrevProductId] = useState(product.id);

  // Reset local state when product ID changes (getDerivedStateFromProps pattern)
  if (product.id !== prevProductId) {
    setPrevProductId(product.id);
    setLocalValues({
      name: product.name,
      link: product.link || '',
      color: product.color || '',
      imprintMethod: product.imprintMethod || '',
      imprintColor: product.imprintColor || '',
      location: product.location || '',
      size: product.size || '',
      notes: product.notes || '',
    });
  }

  const handleLocalChange = (field: keyof typeof localValues, value: string) => {
    setLocalValues((prev) => ({ ...prev, [field]: value }));
  };

  /**
   * Normalize URL to ensure it has a protocol
   */
  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  const handleBlur = (field: keyof Product) => {
    let value = localValues[field as keyof typeof localValues];

    // Normalize URL for link field
    if (field === 'link' && value) {
      value = normalizeUrl(value);
      setLocalValues((prev) => ({ ...prev, link: value }));
    }

    if (value !== (product[field] || '')) {
      onChange({
        ...product,
        [field]: value,
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div>
        <Label htmlFor={`product-name-${product.id}`}>
          Product Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`product-name-${product.id}`}
          tabIndex={baseTabIndex + 1}
          value={localValues.name}
          onChange={(e) => handleLocalChange('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="e.g., 20oz Stainless Steel Water Bottle"
          className="mt-1"
        />
      </div>

      {/* Product Link */}
      <div>
        <Label htmlFor={`product-link-${product.id}`}>Product Link</Label>
        <Input
          id={`product-link-${product.id}`}
          type="text"
          tabIndex={baseTabIndex + 2}
          value={localValues.link}
          onChange={(e) => handleLocalChange('link', e.target.value)}
          onBlur={() => handleBlur('link')}
          placeholder="https://..."
          className="mt-1"
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color */}
        <div>
          <Label htmlFor={`product-color-${product.id}`}>Color</Label>
          <Input
            id={`product-color-${product.id}`}
            tabIndex={baseTabIndex + 3}
            value={localValues.color}
            onChange={(e) => handleLocalChange('color', e.target.value)}
            onBlur={() => handleBlur('color')}
            placeholder="e.g., Matte Black"
            className="mt-1"
          />
        </div>

        {/* Imprint Method */}
        <div>
          <Label htmlFor={`product-imprint-method-${product.id}`}>Imprint Method</Label>
          <Input
            id={`product-imprint-method-${product.id}`}
            tabIndex={baseTabIndex + 4}
            value={localValues.imprintMethod}
            onChange={(e) => handleLocalChange('imprintMethod', e.target.value)}
            onBlur={() => handleBlur('imprintMethod')}
            placeholder="e.g., Laser Engraving"
            className="mt-1"
          />
        </div>

        {/* Imprint Color */}
        <div>
          <Label htmlFor={`product-imprint-color-${product.id}`}>Imprint Color</Label>
          <Input
            id={`product-imprint-color-${product.id}`}
            tabIndex={baseTabIndex + 5}
            value={localValues.imprintColor}
            onChange={(e) => handleLocalChange('imprintColor', e.target.value)}
            onBlur={() => handleBlur('imprintColor')}
            placeholder="e.g., White"
            className="mt-1"
          />
        </div>

        {/* Decoration Location */}
        <div>
          <Label htmlFor={`product-location-${product.id}`}>Decoration Location</Label>
          <Input
            id={`product-location-${product.id}`}
            tabIndex={baseTabIndex + 6}
            value={localValues.location}
            onChange={(e) => handleLocalChange('location', e.target.value)}
            onBlur={() => handleBlur('location')}
            placeholder="e.g., Front"
            className="mt-1"
          />
        </div>
      </div>

      {/* Decoration Size */}
      <div>
        <Label htmlFor={`product-size-${product.id}`}>Decoration Size</Label>
        <Input
          id={`product-size-${product.id}`}
          tabIndex={baseTabIndex + 7}
          value={localValues.size}
          onChange={(e) => handleLocalChange('size', e.target.value)}
          onBlur={() => handleBlur('size')}
          placeholder="e.g., 2in x 3in"
          className="mt-1"
        />
      </div>

      {/* Other Info / Notes */}
      <div>
        <Label htmlFor={`product-notes-${product.id}`}>Other Info</Label>
        <Textarea
          id={`product-notes-${product.id}`}
          tabIndex={baseTabIndex + 8}
          value={localValues.notes}
          onChange={(e) => handleLocalChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          placeholder="Additional notes or specifications..."
          rows={3}
          className="mt-1"
        />
      </div>
    </div>
  );
}

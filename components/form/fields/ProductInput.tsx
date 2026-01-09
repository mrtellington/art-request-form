/**
 * Product Input Component
 *
 * Input fields for a single product in the repeatable products section.
 * All fields from the Cognito form product structure.
 */

'use client';

import { Product } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface ProductInputProps {
  product: Product;
  onChange: (product: Product) => void;
}

export function ProductInput({ product, onChange }: ProductInputProps) {
  const handleChange = (field: keyof Product, value: string) => {
    onChange({
      ...product,
      [field]: value,
    });
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
          value={product.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="e.g., 20oz Stainless Steel Water Bottle"
        />
      </div>

      {/* Product Link */}
      <div>
        <Label htmlFor={`product-link-${product.id}`}>Product Link</Label>
        <Input
          id={`product-link-${product.id}`}
          type="url"
          value={product.link || ''}
          onChange={(e) => handleChange('link', e.target.value)}
          placeholder="https://..."
        />
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Color */}
        <div>
          <Label htmlFor={`product-color-${product.id}`}>Color</Label>
          <Input
            id={`product-color-${product.id}`}
            value={product.color || ''}
            onChange={(e) => handleChange('color', e.target.value)}
            placeholder="e.g., Matte Black"
          />
        </div>

        {/* Imprint Method */}
        <div>
          <Label htmlFor={`product-imprint-method-${product.id}`}>
            Imprint Method
          </Label>
          <Input
            id={`product-imprint-method-${product.id}`}
            value={product.imprintMethod || ''}
            onChange={(e) => handleChange('imprintMethod', e.target.value)}
            placeholder="e.g., Laser Engraving"
          />
        </div>

        {/* Imprint Color */}
        <div>
          <Label htmlFor={`product-imprint-color-${product.id}`}>
            Imprint Color
          </Label>
          <Input
            id={`product-imprint-color-${product.id}`}
            value={product.imprintColor || ''}
            onChange={(e) => handleChange('imprintColor', e.target.value)}
            placeholder="e.g., White"
          />
        </div>

        {/* Decoration Location */}
        <div>
          <Label htmlFor={`product-location-${product.id}`}>
            Decoration Location
          </Label>
          <Input
            id={`product-location-${product.id}`}
            value={product.location || ''}
            onChange={(e) => handleChange('location', e.target.value)}
            placeholder="e.g., Front"
          />
        </div>
      </div>

      {/* Decoration Size */}
      <div>
        <Label htmlFor={`product-size-${product.id}`}>Decoration Size</Label>
        <Input
          id={`product-size-${product.id}`}
          value={product.size || ''}
          onChange={(e) => handleChange('size', e.target.value)}
          placeholder="e.g., 2in x 3in"
        />
      </div>

      {/* Other Info / Notes */}
      <div>
        <Label htmlFor={`product-notes-${product.id}`}>Other Info</Label>
        <Textarea
          id={`product-notes-${product.id}`}
          value={product.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="Additional notes or specifications..."
          rows={3}
        />
      </div>
    </div>
  );
}

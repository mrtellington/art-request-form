/**
 * Products Step
 *
 * Step for adding products (only shown for Mockup requests).
 * Uses RepeatableSection with clone and add blank functionality.
 */

'use client';

import { useFormContext, useFieldArray } from 'react-hook-form';
import { FormData, Product } from '@/types/form';
import { RepeatableSection } from '../fields/RepeatableSection';
import { ProductInput } from '../fields/ProductInput';

const emptyProduct: Omit<Product, 'id'> = {
  name: '',
  color: '',
  imprintMethod: '',
  imprintColor: '',
  location: '',
  size: '',
  link: '',
  notes: '',
};

export function ProductsStep() {
  const { control, formState: { errors } } = useFormContext<FormData>();
  const { fields, append, remove, update } = useFieldArray({
    control,
    name: 'products',
  });

  const handleClone = (index: number) => {
    const productToClone = fields[index];
    append({
      ...productToClone,
      id: crypto.randomUUID(),
    });
  };

  return (
    <div className="space-y-4">
      <RepeatableSection<Product>
        items={fields}
        onAdd={(item) => append(item)}
        onRemove={(index) => remove(index)}
        onClone={handleClone}
        renderItem={(product, index, onChange) => (
          <ProductInput
            product={product}
            onChange={(updated) => update(index, updated)}
          />
        )}
        emptyTemplate={emptyProduct}
        title="Products"
        description="Add all products that need to be included in this mockup"
        minItems={1}
        addButtonLabel="Add Blank Product"
        cloneButtonLabel="Clone This Product"
      />

      {errors.products && (
        <p className="text-sm text-red-600 mt-2">
          {errors.products.message || 'At least one product is required'}
        </p>
      )}
    </div>
  );
}

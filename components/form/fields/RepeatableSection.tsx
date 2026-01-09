/**
 * Repeatable Section Component
 *
 * Generic component for repeatable form sections (products, website links).
 * Supports adding blank items, cloning existing items, and removing items.
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Plus, Trash2 } from 'lucide-react';

interface RepeatableSectionProps<T extends { id: string }> {
  items: T[];
  onAdd: (item: T) => void;
  onRemove: (index: number) => void;
  onClone: (index: number) => void;
  renderItem: (item: T, index: number, onChange: (updated: T) => void) => React.ReactNode;
  emptyTemplate: Omit<T, 'id'>;
  title: string;
  description?: string;
  minItems?: number;
  addButtonLabel?: string;
  cloneButtonLabel?: string;
}

export function RepeatableSection<T extends { id: string }>({
  items,
  onAdd,
  onRemove,
  onClone,
  renderItem,
  emptyTemplate,
  title,
  description,
  minItems = 0,
  addButtonLabel = 'Add Blank',
  cloneButtonLabel = 'Clone',
}: RepeatableSectionProps<T>) {
  const canRemove = items.length > minItems;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div>
        <h3 className="text-lg font-semibold text-zinc-900">{title}</h3>
        {description && (
          <p className="text-sm text-zinc-600 mt-1">{description}</p>
        )}
      </div>

      {/* Items */}
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id} className="p-4">
            {/* Item Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-zinc-700">
                Item {index + 1}
              </span>
              <div className="flex gap-2">
                {/* Clone Button */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onClone(index)}
                  className="gap-2"
                >
                  <Copy className="h-3.5 w-3.5" />
                  {cloneButtonLabel}
                </Button>

                {/* Remove Button */}
                {canRemove && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(index)}
                    className="gap-2"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                )}
              </div>
            </div>

            {/* Item Content */}
            <div>
              {renderItem(item, index, (updated) => {
                // Update callback handled by parent
              })}
            </div>
          </Card>
        ))}
      </div>

      {/* Add Blank Button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => onAdd({ ...emptyTemplate, id: crypto.randomUUID() } as T)}
        className="gap-2 w-full"
      >
        <Plus className="h-4 w-4" />
        {addButtonLabel}
      </Button>
    </div>
  );
}

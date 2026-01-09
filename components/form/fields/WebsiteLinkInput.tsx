/**
 * Website Link Input Component
 *
 * Input fields for a single website/social media link.
 */

'use client';

import { WebsiteLink } from '@/types/form';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const linkTypes = [
  'Website',
  'Instagram',
  'Facebook',
  'Pinterest',
  'LinkedIn',
  'Twitter',
  'TikTok',
  'YouTube',
  'Other',
];

interface WebsiteLinkInputProps {
  link: WebsiteLink;
  onChange: (link: WebsiteLink) => void;
}

export function WebsiteLinkInput({ link, onChange }: WebsiteLinkInputProps) {
  const handleChange = (field: keyof WebsiteLink, value: string) => {
    onChange({
      ...link,
      [field]: value,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Link Type */}
      <div>
        <Label htmlFor={`link-type-${link.id}`}>
          Type <span className="text-red-500">*</span>
        </Label>
        <Select
          value={link.type}
          onValueChange={(value) => handleChange('type', value)}
        >
          <SelectTrigger id={`link-type-${link.id}`}>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            {linkTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* URL */}
      <div className="md:col-span-2">
        <Label htmlFor={`link-url-${link.id}`}>
          URL <span className="text-red-500">*</span>
        </Label>
        <Input
          id={`link-url-${link.id}`}
          type="url"
          value={link.url}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}

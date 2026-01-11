/**
 * Website Link Input Component
 *
 * Input fields for a single website/social media link.
 * Uses local state for URL to prevent focus loss during typing.
 */

'use client';

import { useState, useRef } from 'react';
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
  // Use local state for URL to prevent focus loss during typing
  // Key: use link.id as part of the state reset mechanism
  const [localUrl, setLocalUrl] = useState(link.url);
  const prevLinkIdRef = useRef(link.id);

  // Reset local state if the link id changes (e.g., when cloning)
  // This is the "adjusting state during render" pattern from React docs
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  /* eslint-disable react-hooks/refs */
  if (link.id !== prevLinkIdRef.current) {
    prevLinkIdRef.current = link.id;
    setLocalUrl(link.url);
  }
  /* eslint-enable react-hooks/refs */

  const handleTypeChange = (value: string) => {
    onChange({
      ...link,
      type: value,
    });
  };

  const handleUrlChange = (value: string) => {
    setLocalUrl(value);
  };

  /**
   * Normalize URL to ensure it has a protocol
   */
  const normalizeUrl = (url: string): string => {
    if (!url) return url;
    const trimmed = url.trim();
    // If already has a protocol, return as is
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    // Add https:// prefix
    return `https://${trimmed}`;
  };

  const handleUrlBlur = () => {
    // Normalize URL and sync to parent on blur
    const normalizedUrl = normalizeUrl(localUrl);
    if (normalizedUrl !== localUrl) {
      setLocalUrl(normalizedUrl);
    }
    if (normalizedUrl !== link.url) {
      onChange({
        ...link,
        url: normalizedUrl,
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Link Type */}
      <div>
        <Label htmlFor={`link-type-${link.id}`}>
          Type <span className="text-red-500">*</span>
        </Label>
        <Select value={link.type} onValueChange={handleTypeChange}>
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
          type="text"
          value={localUrl}
          onChange={(e) => handleUrlChange(e.target.value)}
          onBlur={handleUrlBlur}
          placeholder="https://..."
        />
      </div>
    </div>
  );
}

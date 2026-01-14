/**
 * Website Link Input Component
 *
 * Compact inline input for website/social media links.
 * Uses local state for URL to prevent focus loss during typing.
 */

'use client';

import { useState } from 'react';
import { WebsiteLink } from '@/types/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trash2 } from 'lucide-react';

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
  onRemove?: () => void;
  canRemove?: boolean;
}

export function WebsiteLinkInput({
  link,
  onChange,
  onRemove,
  canRemove = true,
}: WebsiteLinkInputProps) {
  // Use local state for URL to prevent focus loss during typing
  const [localUrl, setLocalUrl] = useState(link.url);
  const [prevLinkId, setPrevLinkId] = useState(link.id);

  // Reset local state when link ID changes (getDerivedStateFromProps pattern)
  if (link.id !== prevLinkId) {
    setPrevLinkId(link.id);
    setLocalUrl(link.url);
  }

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
    <div className="flex items-start gap-2">
      {/* Link Type - More compact */}
      <Select value={link.type} onValueChange={handleTypeChange}>
        <SelectTrigger id={`link-type-${link.id}`} className="w-40 flex-shrink-0">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {linkTypes.map((type) => (
            <SelectItem key={type} value={type}>
              {type}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* URL - Takes remaining space */}
      <Input
        id={`link-url-${link.id}`}
        type="text"
        value={localUrl}
        onChange={(e) => handleUrlChange(e.target.value)}
        onBlur={handleUrlBlur}
        placeholder="https://..."
        className="flex-1"
      />

      {/* Remove Button */}
      {canRemove && onRemove && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          tabIndex={-1}
          onClick={onRemove}
          className="flex-shrink-0 text-zinc-400 hover:text-red-600"
          title="Remove link"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}

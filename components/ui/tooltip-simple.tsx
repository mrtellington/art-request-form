/**
 * Simple Tooltip Component
 *
 * Lightweight tooltip for showing helpful information on hover/focus
 */

'use client';

import { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  content: React.ReactNode;
  children?: React.ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        className="inline-flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
        aria-label={typeof content === 'string' ? content : 'More information'}
      >
        {children || <Info className="w-4 h-4" />}
      </button>

      {show && (
        <div
          role="tooltip"
          className="absolute z-50 px-3 py-2 text-sm text-white bg-zinc-900 rounded-lg shadow-lg whitespace-normal max-w-xs -top-2 left-full ml-2 animate-in fade-in slide-in-from-left-1 duration-200"
        >
          {content}
          <div className="absolute w-2 h-2 bg-zinc-900 rotate-45 -left-1 top-1/2 -translate-y-1/2" />
        </div>
      )}
    </div>
  );
}

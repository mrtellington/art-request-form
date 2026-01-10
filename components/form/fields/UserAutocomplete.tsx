/**
 * User Autocomplete Component
 *
 * Autocomplete input that searches Asana users by name or email.
 * Used for adding collaborators to art requests.
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

interface AsanaUser {
  gid: string;
  name: string;
  email: string;
}

interface UserAutocompleteProps {
  onSelect: (user: AsanaUser) => void;
  excludeEmails?: string[];
  placeholder?: string;
  disabled?: boolean;
}

export function UserAutocomplete({
  onSelect,
  excludeEmails = [],
  placeholder = 'Search by name or email...',
  disabled = false,
}: UserAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<AsanaUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setUsers([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search-users?q=${encodeURIComponent(query)}`);
        const result = await response.json();

        if (result.success) {
          // Filter out already selected users
          const filteredUsers = result.users.filter(
            (user: AsanaUser) => !excludeEmails.includes(user.email)
          );
          setUsers(filteredUsers);
          setIsOpen(filteredUsers.length > 0);
          setHighlightedIndex(-1);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setUsers([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, excludeEmails]);

  // Handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (user: AsanaUser) => {
      onSelect(user);
      setQuery('');
      setUsers([]);
      setIsOpen(false);
      inputRef.current?.focus();
    },
    [onSelect]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || users.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev < users.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : users.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < users.length) {
          handleSelect(users[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (users.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pr-8"
        />
        {isLoading && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-400" />
          </div>
        )}
      </div>

      {isOpen && users.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-auto"
        >
          {users.map((user, index) => (
            <button
              key={user.gid}
              type="button"
              onClick={() => handleSelect(user)}
              onMouseEnter={() => setHighlightedIndex(index)}
              className={`w-full px-3 py-2 text-left hover:bg-zinc-100 focus:outline-none ${
                index === highlightedIndex ? 'bg-zinc-100' : ''
              }`}
            >
              <div className="font-medium text-sm text-zinc-900">{user.name}</div>
              <div className="text-xs text-zinc-500">{user.email}</div>
            </button>
          ))}
        </div>
      )}

      {isOpen && users.length === 0 && query.length >= 2 && !isLoading && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg p-3">
          <p className="text-sm text-zinc-500">
            No users found matching &quot;{query}&quot;
          </p>
        </div>
      )}
    </div>
  );
}

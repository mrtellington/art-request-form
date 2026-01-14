/**
 * Rich Text Editor Component
 *
 * TipTap editor with bold, italic, links, and lists.
 * Used for the Pertinent Information field.
 */

'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { Bold, Italic, Link2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCallback, useState, useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichTextEditor({
  value,
  onChange,
  placeholder = 'Enter text...',
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Prevent Enter from bubbling up to form submission
        hardBreak: {
          HTMLAttributes: {
            class: 'hard-break',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline hover:text-primary/90',
        },
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[200px] p-4 focus:outline-none',
      },
      // Prevent Enter key from submitting the form
      handleKeyDown: (view, event) => {
        if (
          event.key === 'Enter' &&
          !event.shiftKey &&
          !event.ctrlKey &&
          !event.metaKey
        ) {
          // Let TipTap handle the Enter key (create new paragraph)
          return false;
        }
        return false;
      },
    },
  });

  // Focus link input when dialog opens
  useEffect(() => {
    if (showLinkDialog && linkInputRef.current) {
      linkInputRef.current.focus();
    }
  }, [showLinkDialog]);

  const openLinkDialog = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    setLinkUrl(previousUrl || '');
    setShowLinkDialog(true);
  }, [editor]);

  const closeLinkDialog = useCallback(() => {
    setShowLinkDialog(false);
    setLinkUrl('');
    editor?.commands.focus();
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;

    // Empty string = remove link
    if (linkUrl === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      closeLinkDialog();
      return;
    }

    // Normalize URL (add https:// if missing)
    let url = linkUrl.trim();
    if (url && !/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }

    // Update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    closeLinkDialog();
  }, [editor, linkUrl, closeLinkDialog]);

  const handleLinkKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        applyLink();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        closeLinkDialog();
      }
    },
    [applyLink, closeLinkDialog]
  );

  if (!editor) {
    return null;
  }

  // Check if a mark is active or stored (to be applied on next input)
  const isMarkActive = (markName: string) => {
    if (editor.isActive(markName)) return true;
    // Check stored marks for when user toggles format before typing
    const storedMarks = editor.state.storedMarks || editor.state.selection.$from.marks();
    return storedMarks.some((mark) => mark.type.name === markName);
  };

  return (
    <div className="border border-zinc-200 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b border-zinc-200 bg-zinc-50 p-2 flex flex-wrap gap-1">
        <Button
          type="button"
          variant={isMarkActive('bold') ? 'default' : 'ghost'}
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className="h-8 w-8 p-0"
          title="Bold (⌘B)"
        >
          <Bold className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isMarkActive('italic') ? 'default' : 'ghost'}
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className="h-8 w-8 p-0"
          title="Italic (⌘I)"
        >
          <Italic className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant={isMarkActive('link') ? 'default' : 'ghost'}
          size="sm"
          onMouseDown={(e) => e.preventDefault()}
          onClick={openLinkDialog}
          className="h-8 w-8 p-0"
          title="Add Link (⌘K)"
        >
          <Link2 className="h-4 w-4" />
        </Button>

        {/* Inline Link Dialog */}
        {showLinkDialog && (
          <div className="flex items-center gap-2 ml-2 flex-1">
            <Input
              ref={linkInputRef}
              type="text"
              placeholder="Enter URL (e.g., https://example.com)"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={handleLinkKeyDown}
              className="h-8 text-sm flex-1"
            />
            <Button
              type="button"
              size="sm"
              variant="default"
              onClick={applyLink}
              className="h-8 w-8 p-0"
              title="Apply Link"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={closeLinkDialog}
              className="h-8 w-8 p-0"
              title="Cancel"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}

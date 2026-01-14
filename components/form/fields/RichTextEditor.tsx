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
import { Bold, Italic, Link2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCallback } from 'react';

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
  const editor = useEditor({
    extensions: [
      StarterKit,
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
    },
  });

  const setLink = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl);

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty string = remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Update link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

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
          onClick={setLink}
          className="h-8 w-8 p-0"
          title="Add Link (⌘K)"
        >
          <Link2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor Content */}
      <div className="bg-white">
        <EditorContent editor={editor} placeholder={placeholder} />
      </div>
    </div>
  );
}

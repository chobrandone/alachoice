import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import { useEffect } from 'react';
import {
  Bold,
  Italic,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Undo,
  Redo,
} from 'lucide-react';
import { cn } from '@/lib/cn';

/** Minimal TipTap editor producing HTML for CMS body fields. */
export function RichTextEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (html: string) => void;
}) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3] } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose-ala min-h-[200px] max-w-none px-4 py-3 focus:outline-none',
      },
    },
  });

  // Sync external value changes (e.g. opening a different row) into the editor.
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const btn = (active: boolean) =>
    cn(
      'flex h-8 w-8 items-center justify-center rounded hover:bg-ala-grey-50',
      active && 'bg-ala-navy text-white hover:bg-ala-navy',
    );

  const setLink = () => {
    const url = window.prompt('Link URL');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().setLink({ href: url }).run();
  };

  return (
    <div className="rounded-input border border-ala-grey-200">
      <div className="flex flex-wrap gap-1 border-b border-ala-grey-200 p-1.5">
        <button type="button" className={btn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} aria-label="Bold">
          <Bold className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} aria-label="Italic">
          <Italic className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} aria-label="Heading 2">
          <Heading2 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} aria-label="Heading 3">
          <Heading3 className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} aria-label="Bullet list">
          <List className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} aria-label="Ordered list">
          <ListOrdered className="h-4 w-4" />
        </button>
        <button type="button" className={btn(editor.isActive('link'))} onClick={setLink} aria-label="Link">
          <LinkIcon className="h-4 w-4" />
        </button>
        <span className="mx-1 w-px bg-ala-grey-200" />
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().undo().run()} aria-label="Undo">
          <Undo className="h-4 w-4" />
        </button>
        <button type="button" className={btn(false)} onClick={() => editor.chain().focus().redo().run()} aria-label="Redo">
          <Redo className="h-4 w-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

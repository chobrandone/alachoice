import { cn } from '@/lib/cn';

/**
 * Renders CMS rich-text (HTML from TipTap). Content is sanitised server-side on
 * write; the class scopes typography. Empty content renders nothing.
 */
export function RichText({ html, className }: { html?: string | null; className?: string }) {
  if (!html) return null;
  return (
    <div
      className={cn('prose-ala max-w-none', className)}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

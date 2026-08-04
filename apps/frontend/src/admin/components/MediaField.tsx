import { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import { Spinner } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { useToast } from './Toast';
import type { Media } from '@ala/types';

const MAX_MB = 15;

/** Upload-only image field: files go straight to Supabase storage (no link paste). */
export function MediaField({
  value,
  onChange,
  bucket = 'media',
}: {
  value: string;
  onChange: (url: string) => void;
  bucket?: 'media' | 'logos' | 'events' | 'documents';
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const toast = useToast();

  const onFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast('error', 'Please choose an image file');
    if (file.size > MAX_MB * 1024 * 1024) return toast('error', `Image must be under ${MAX_MB} MB`);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', bucket);
      const { data } = await api.post<Media>('/admin/media/upload', fd, { auth: true });
      onChange(data.file_url);
      toast('success', 'Image uploaded');
    } catch {
      toast('error', 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const hidden = (
    <input
      ref={inputRef}
      type="file"
      accept="image/*"
      className="hidden"
      onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
    />
  );

  if (value) {
    return (
      <div className="space-y-2">
        <div className="relative inline-block">
          <img src={value} alt="Preview" className="h-32 w-auto max-w-full rounded-input border border-ala-grey-200 object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Remove image"
            className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-ala-red text-white shadow-soft"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <button type="button" onClick={() => inputRef.current?.click()} className="block text-xs font-medium text-ala-navy hover:text-ala-red">
          Replace image
        </button>
        {hidden}
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        className={cn(
          'flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-input border-2 border-dashed text-sm transition-colors',
          dragOver ? 'border-ala-navy bg-ala-navy/5 text-ala-navy' : 'border-ala-grey-200 text-ala-grey-500 hover:border-ala-navy hover:text-ala-navy',
        )}
      >
        {busy ? <Spinner className="h-5 w-5" /> : <Upload className="h-6 w-6" />}
        <span>{busy ? 'Uploading…' : 'Drag & drop or click to upload'}</span>
        <span className="text-xs text-ala-grey-400">Images up to {MAX_MB} MB · saved to “{bucket}”</span>
      </button>
      {hidden}
    </div>
  );
}

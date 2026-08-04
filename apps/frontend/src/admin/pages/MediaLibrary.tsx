import { useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, Copy, Trash2, Check } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { useAdminList } from '../lib/crud';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import type { Media } from '@ala/types';

const BUCKETS = ['media', 'logos', 'events', 'documents'] as const;

export function MediaLibrary() {
  const qc = useQueryClient();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [bucket, setBucket] = useState<(typeof BUCKETS)[number]>('media');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<Media | null>(null);

  const list = useAdminList<Media>('/admin/media', { pageSize: 40 });
  const rows = (list.data?.data ?? []).filter((m) => m.bucket === bucket);

  const upload = async (file: File) => {
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('bucket', bucket);
      await api.post('/admin/media/upload', fd, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/media'] });
      toast('success', 'Uploaded');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  const copy = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(url);
    setTimeout(() => setCopied(null), 1500);
  };

  const del = async () => {
    if (!deleting) return;
    try {
      await api.delete(`/admin/media/${deleting.id}`, { auth: true });
      qc.invalidateQueries({ queryKey: ['/admin/media'] });
      toast('success', 'Deleted');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Media Library</h1>
        <div className="flex items-center gap-3">
          <select
            value={bucket}
            onChange={(e) => setBucket(e.target.value as typeof bucket)}
            className="h-10 rounded-input border border-ala-grey-200 bg-white px-3 text-sm focus:border-ala-navy focus:outline-none"
          >
            {BUCKETS.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <Button size="sm" onClick={() => inputRef.current?.click()} disabled={busy}>
            {busy ? <Spinner className="h-4 w-4" /> : <Upload className="h-4 w-4" />} Upload
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
          />
        </div>
      </div>

      {list.isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Spinner className="h-6 w-6 text-ala-navy" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-card border border-dashed border-ala-grey-200 py-16 text-center text-sm text-ala-grey-500">
          No files in “{bucket}” yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {rows.map((m) => (
            <div key={m.id} className="group overflow-hidden rounded-card border border-ala-grey-200 bg-white">
              <div className="flex aspect-square items-center justify-center bg-ala-grey-50">
                {m.mime_type?.startsWith('image/') ? (
                  <img src={m.file_url} alt={m.alt_text ?? m.file_name} className="h-full w-full object-cover" />
                ) : (
                  <span className="px-2 text-center text-xs text-ala-grey-500">{m.file_name}</span>
                )}
              </div>
              <div className="flex items-center justify-between gap-1 p-2">
                <span className="truncate text-xs text-ala-grey-500" title={m.file_name}>
                  {m.file_name}
                </span>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => copy(m.file_url)}
                    aria-label="Copy URL"
                    className="rounded p-1 text-ala-navy hover:bg-ala-navy/10"
                  >
                    {copied === m.file_url ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={() => setDeleting(m)}
                    aria-label="Delete"
                    className="rounded p-1 text-ala-red hover:bg-ala-red/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        message="Delete this file? References to it will break."
        onConfirm={del}
      />
    </div>
  );
}

import { useRef, useState } from 'react';
import { Upload, FileText, Trash2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { ApiError } from '@/lib/api';
import { useDocuments, useUploadDocument, useDeleteDocument, useApplications } from '../portalApi';
import { StatusBadge } from '../StatusBadge';
import { formatDate } from '@/lib/format';
import { docType as docTypeEnum } from '@ala/types';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

const DOC_TYPE_LABELS: Record<string, string> = {
  passport: 'Passport',
  cv: 'CV / Résumé',
  transcript: 'Academic transcript',
  certificate: 'Certificate',
  photo: 'Photo',
  bank_statement: 'Bank statement',
  reference_letter: 'Reference letter',
  other: 'Other',
};

export function PortalDocuments() {
  const { data: docs, isLoading } = useDocuments();
  const { data: apps } = useApplications();
  const upload = useUploadDocument();
  const del = useDeleteDocument();
  const fileRef = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState('passport');
  const [applicationId, setApplicationId] = useState('');
  const [error, setError] = useState('');

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const file = fileRef.current?.files?.[0];
    if (!file) return setError('Please choose a file.');
    const form = new FormData();
    form.append('file', file);
    form.append('doc_type', docType);
    if (applicationId) form.append('application_id', applicationId);
    try {
      await upload.mutateAsync(form);
      if (fileRef.current) fileRef.current.value = '';
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed');
    }
  };

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-ala-navy">Documents</h1>
      <p className="mt-1 text-ala-grey-500">Upload and track your supporting documents.</p>

      {/* Upload form */}
      <form onSubmit={onUpload} className="mt-6 rounded-card border border-ala-grey-200 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Document type</span>
            <select className={inputCls} value={docType} onChange={(e) => setDocType(e.target.value)}>
              {docTypeEnum.options.map((v) => (
                <option key={v} value={v}>{DOC_TYPE_LABELS[v]}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">Link to application (optional)</span>
            <select className={inputCls} value={applicationId} onChange={(e) => setApplicationId(e.target.value)}>
              <option value="">None</option>
              {(apps ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">File</span>
            <input ref={fileRef} type="file" className={cn(inputCls, 'py-2 file:mr-3 file:rounded file:border-0 file:bg-ala-navy file:px-3 file:py-1 file:text-white')} />
          </label>
        </div>
        {error && <p className="mt-3 text-sm text-ala-red">{error}</p>}
        <div className="mt-4">
          <Button type="submit" disabled={upload.isPending}>
            <Upload className="h-4 w-4" /> {upload.isPending ? 'Uploading…' : 'Upload document'}
          </Button>
        </div>
      </form>

      {/* List */}
      <div className="mt-6 overflow-hidden rounded-card border border-ala-grey-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-12"><Spinner className="h-6 w-6 text-ala-navy" /></div>
        ) : (docs ?? []).length === 0 ? (
          <p className="py-12 text-center text-sm text-ala-grey-500">No documents uploaded yet.</p>
        ) : (
          <ul className="divide-y divide-ala-grey-100">
            {(docs ?? []).map((d) => (
              <li key={d.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <FileText className="h-5 w-5 shrink-0 text-ala-grey-400" />
                  <div className="min-w-0">
                    <p className="truncate font-medium text-ala-navy">{d.file_name}</p>
                    <p className="text-xs text-ala-grey-500">
                      {DOC_TYPE_LABELS[d.doc_type ?? 'other']} · {formatDate(d.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <StatusBadge status={d.status} />
                  <a href={d.file_url} target="_blank" rel="noopener noreferrer" className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10" aria-label="Open">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <button onClick={() => del.mutate(d.id)} className="rounded p-1.5 text-ala-red hover:bg-ala-red/10" aria-label="Delete">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

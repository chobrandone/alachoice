import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Spinner } from '@/components/ui/Skeleton';
import { MediaField } from './MediaField';
import { useToast } from './Toast';
import { useState } from 'react';
import type { EventGalleryItem } from '@ala/types';

/** Sub-CRUD for an event's photo gallery. Only usable once the event is saved. */
export function GalleryManager({ eventId }: { eventId?: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [pending, setPending] = useState('');

  const key = ['/admin/events', eventId, 'gallery'];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () =>
      api.get<EventGalleryItem[]>(`/admin/events/${eventId}/gallery`, { auth: true }).then((r) => r.data),
    enabled: !!eventId,
  });

  if (!eventId) {
    return (
      <p className="rounded-input border border-dashed border-ala-grey-200 px-4 py-6 text-center text-sm text-ala-grey-500">
        Save the event first to add gallery images.
      </p>
    );
  }

  const add = async (url: string) => {
    if (!url) return;
    try {
      await api.post(`/admin/events/${eventId}/gallery`, { image_url: url }, { auth: true });
      setPending('');
      qc.invalidateQueries({ queryKey: key });
      toast('success', 'Image added');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Failed');
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/admin/events/gallery/${id}`, { auth: true });
      qc.invalidateQueries({ queryKey: key });
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Failed');
    }
  };

  return (
    <div className="space-y-3">
      {isLoading ? (
        <Spinner className="h-5 w-5 text-ala-navy" />
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {(data ?? []).map((g) => (
            <div key={g.id} className="group relative">
              <img src={g.image_url} alt={g.caption ?? ''} className="aspect-square w-full rounded object-cover" />
              <button
                type="button"
                onClick={() => del(g.id)}
                aria-label="Remove"
                className="absolute right-1 top-1 rounded-full bg-ala-red p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      <MediaField value={pending} onChange={(url) => (url ? add(url) : setPending(url))} bucket="events" />
    </div>
  );
}

import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { MediaField } from './MediaField';
import type { EventSpeaker } from '@ala/types';

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

/** Inline editor for the event.speakers jsonb array. */
export function SpeakersEditor({
  value,
  onChange,
}: {
  value: EventSpeaker[];
  onChange: (v: EventSpeaker[]) => void;
}) {
  const speakers = value ?? [];
  const add = () => onChange([...speakers, { name: '', title: '', photo_url: null }]);
  const update = (i: number, patch: Partial<EventSpeaker>) =>
    onChange(speakers.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const remove = (i: number) => onChange(speakers.filter((_, idx) => idx !== i));

  return (
    <div className="space-y-3 rounded-card border border-ala-grey-200 bg-ala-grey-50 p-4">
      {speakers.length === 0 && (
        <p className="text-center text-sm text-ala-grey-500">No speakers added yet.</p>
      )}
      {speakers.map((s, i) => (
        <div key={i} className="rounded-input border border-ala-grey-200 bg-white p-3">
          <div className="flex items-start gap-3">
            <div className="w-28 shrink-0">
              <MediaField
                value={s.photo_url ?? ''}
                onChange={(url) => update(i, { photo_url: url || null })}
                bucket="media"
              />
            </div>
            <div className="flex-1 space-y-2">
              <input
                className={inputCls}
                placeholder="Speaker name"
                value={s.name}
                onChange={(e) => update(i, { name: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Title / role"
                value={s.title ?? ''}
                onChange={(e) => update(i, { title: e.target.value })}
              />
            </div>
            <button
              type="button"
              aria-label="Remove speaker"
              onClick={() => remove(i)}
              className="rounded p-1.5 text-ala-red hover:bg-ala-red/10"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
      <Button type="button" variant="outline-navy" size="sm" onClick={add}>
        <Plus className="h-4 w-4" /> Add speaker
      </Button>
    </div>
  );
}

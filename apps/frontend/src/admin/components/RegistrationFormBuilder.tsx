import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, ChevronUp, ChevronDown, X } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { Spinner } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { useToast } from './Toast';
import type { EventFormField, EventFieldType, EventFieldOption, RegistrationSection } from '@ala/types';

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

const FIELD_TYPES: { value: EventFieldType; label: string }[] = [
  { value: 'text', label: 'Short text' },
  { value: 'textarea', label: 'Long text' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Dropdown' },
  { value: 'radio', label: 'Radio buttons' },
  { value: 'checkbox', label: 'Checkboxes' },
  { value: 'file', label: 'File / document link' },
];

const SECTIONS: { value: RegistrationSection; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'professional', label: 'Professional' },
  { value: 'educational', label: 'Educational' },
  { value: 'custom', label: 'Custom' },
];

const HAS_OPTIONS: EventFieldType[] = ['select', 'radio', 'checkbox'];

function toKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60);
}

type Draft = {
  id?: string;
  section: RegistrationSection;
  field_key: string;
  label_en: string;
  label_fr: string;
  field_type: EventFieldType;
  options: EventFieldOption[];
  placeholder: string;
  help_text: string;
  is_required: boolean;
};

const blankDraft = (): Draft => ({
  section: 'custom',
  field_key: '',
  label_en: '',
  label_fr: '',
  field_type: 'text',
  options: [],
  placeholder: '',
  help_text: '',
  is_required: false,
});

/** No-code registration form builder for a single event's custom fields. */
export function RegistrationFormBuilder({ eventId }: { eventId?: string }) {
  const qc = useQueryClient();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [keyEdited, setKeyEdited] = useState(false);
  const [busy, setBusy] = useState(false);

  const key = ['/admin/events', eventId, 'fields'];
  const { data, isLoading } = useQuery({
    queryKey: key,
    queryFn: () =>
      api.get<EventFormField[]>(`/admin/events/${eventId}/fields`, { auth: true }).then((r) => r.data),
    enabled: !!eventId,
  });

  if (!eventId) {
    return (
      <p className="rounded-input border border-dashed border-ala-grey-200 px-4 py-6 text-center text-sm text-ala-grey-500">
        Save the event first, then build its registration form.
      </p>
    );
  }

  const fields = data ?? [];
  const refresh = () => qc.invalidateQueries({ queryKey: key });

  const startAdd = () => {
    setDraft(blankDraft());
    setKeyEdited(false);
  };
  const startEdit = (f: EventFormField) => {
    setDraft({
      id: f.id,
      section: f.section,
      field_key: f.field_key,
      label_en: f.label_en,
      label_fr: f.label_fr ?? '',
      field_type: f.field_type,
      options: f.options ?? [],
      placeholder: f.placeholder ?? '',
      help_text: f.help_text ?? '',
      is_required: f.is_required,
    });
    setKeyEdited(true);
  };

  const save = async () => {
    if (!draft) return;
    if (!draft.label_en.trim()) return toast('error', 'Label (EN) is required');
    const field_key = draft.field_key || toKey(draft.label_en);
    if (!field_key) return toast('error', 'Could not derive a field key from the label');
    const payload = {
      section: draft.section,
      field_key,
      label_en: draft.label_en.trim(),
      label_fr: draft.label_fr.trim() || null,
      field_type: draft.field_type,
      options: HAS_OPTIONS.includes(draft.field_type) ? draft.options : [],
      placeholder: draft.placeholder.trim() || null,
      help_text: draft.help_text.trim() || null,
      is_required: draft.is_required,
      sort_order: draft.id ? undefined : fields.length,
    };
    setBusy(true);
    try {
      if (draft.id) {
        await api.patch(`/admin/events/fields/${draft.id}`, payload, { auth: true });
      } else {
        await api.post(`/admin/events/${eventId}/fields`, payload, { auth: true });
      }
      setDraft(null);
      refresh();
      toast('success', 'Field saved');
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  const del = async (id: string) => {
    try {
      await api.delete(`/admin/events/fields/${id}`, { auth: true });
      refresh();
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Delete failed');
    }
  };

  const move = async (index: number, dir: -1 | 1) => {
    const next = [...fields];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    try {
      await api.patch(
        '/admin/events/fields/reorder',
        { items: next.map((f, i) => ({ id: f.id, sort_order: i })) },
        { auth: true },
      );
      refresh();
    } catch (e) {
      toast('error', e instanceof ApiError ? e.message : 'Reorder failed');
    }
  };

  return (
    <div className="space-y-3 rounded-card border border-ala-grey-200 bg-ala-grey-50 p-4">
      <p className="text-xs text-ala-grey-500">
        These fields appear on the public registration form, in addition to the built-in Name, Email,
        Phone and Country fields.
      </p>

      {isLoading ? (
        <Spinner className="h-5 w-5 text-ala-navy" />
      ) : fields.length === 0 ? (
        <p className="py-3 text-center text-sm text-ala-grey-500">No custom fields yet.</p>
      ) : (
        <ul className="space-y-2">
          {fields.map((f, i) => (
            <li
              key={f.id}
              className="flex items-center gap-3 rounded-input border border-ala-grey-200 bg-white px-3 py-2"
            >
              <div className="flex flex-col text-ala-grey-500">
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="disabled:opacity-30">
                  <ChevronUp className="h-3.5 w-3.5" />
                </button>
                <button type="button" aria-label="Move down" disabled={i === fields.length - 1} onClick={() => move(i, 1)} className="disabled:opacity-30">
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ala-navy">
                  {f.label_en}
                  {f.is_required && <span className="ml-1 text-ala-red">*</span>}
                </p>
                <p className="text-xs text-ala-grey-500">
                  <span className="rounded bg-ala-grey-100 px-1.5 py-0.5 font-mono">{f.field_type}</span>{' '}
                  · {f.section} · <span className="font-mono">{f.field_key}</span>
                </p>
              </div>
              <button type="button" aria-label="Edit" onClick={() => startEdit(f)} className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10">
                <Pencil className="h-4 w-4" />
              </button>
              <button type="button" aria-label="Delete" onClick={() => del(f.id)} className="rounded p-1.5 text-ala-red hover:bg-ala-red/10">
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {draft ? (
        <FieldEditor
          draft={draft}
          setDraft={setDraft}
          keyEdited={keyEdited}
          setKeyEdited={setKeyEdited}
          onSave={save}
          onCancel={() => setDraft(null)}
          busy={busy}
        />
      ) : (
        <Button type="button" variant="outline-navy" size="sm" onClick={startAdd}>
          <Plus className="h-4 w-4" /> Add field
        </Button>
      )}
    </div>
  );
}

function FieldEditor({
  draft,
  setDraft,
  keyEdited,
  setKeyEdited,
  onSave,
  onCancel,
  busy,
}: {
  draft: Draft;
  setDraft: (d: Draft) => void;
  keyEdited: boolean;
  setKeyEdited: (b: boolean) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft({ ...draft, [k]: v });
  const showOptions = HAS_OPTIONS.includes(draft.field_type);

  return (
    <div className="space-y-3 rounded-card border border-ala-navy/20 bg-white p-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Label (EN) *</span>
          <input
            className={inputCls}
            value={draft.label_en}
            onChange={(e) => {
              const label_en = e.target.value;
              setDraft({
                ...draft,
                label_en,
                field_key: keyEdited ? draft.field_key : toKey(label_en),
              });
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Label (FR)</span>
          <input className={inputCls} value={draft.label_fr} onChange={(e) => set('label_fr', e.target.value)} />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Field type</span>
          <select className={inputCls} value={draft.field_type} onChange={(e) => set('field_type', e.target.value as EventFieldType)}>
            {FIELD_TYPES.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Section</span>
          <select className={inputCls} value={draft.section} onChange={(e) => set('section', e.target.value as RegistrationSection)}>
            {SECTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Field key</span>
          <input
            className={cn(inputCls, 'font-mono')}
            value={draft.field_key}
            onChange={(e) => {
              setKeyEdited(true);
              set('field_key', toKey(e.target.value));
            }}
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Placeholder</span>
          <input className={inputCls} value={draft.placeholder} onChange={(e) => set('placeholder', e.target.value)} />
        </label>
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs font-medium text-ala-navy">Help text</span>
          <input className={inputCls} value={draft.help_text} onChange={(e) => set('help_text', e.target.value)} />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-ala-navy">
        <input type="checkbox" className="h-4 w-4 accent-ala-navy" checked={draft.is_required} onChange={(e) => set('is_required', e.target.checked)} />
        Required
      </label>

      {showOptions && <OptionsEditor options={draft.options} onChange={(o) => set('options', o)} />}

      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button type="button" size="sm" onClick={onSave} disabled={busy}>{busy ? 'Saving…' : 'Save field'}</Button>
      </div>
    </div>
  );
}

function OptionsEditor({
  options,
  onChange,
}: {
  options: EventFieldOption[];
  onChange: (o: EventFieldOption[]) => void;
}) {
  const add = () => onChange([...options, { value: '', label_en: '', label_fr: '' }]);
  const update = (i: number, patch: Partial<EventFieldOption>) =>
    onChange(options.map((o, idx) => (idx === i ? { ...o, ...patch } : o)));
  const remove = (i: number) => onChange(options.filter((_, idx) => idx !== i));

  return (
    <div className="rounded-input border border-ala-grey-200 bg-ala-grey-50 p-3">
      <p className="mb-2 text-xs font-medium text-ala-navy">Options</p>
      <div className="space-y-2">
        {options.map((o, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              className={cn(inputCls, 'h-9 flex-1 font-mono')}
              placeholder="value"
              value={o.value}
              onChange={(e) => update(i, { value: e.target.value })}
            />
            <input
              className={cn(inputCls, 'h-9 flex-1')}
              placeholder="Label (EN)"
              value={o.label_en}
              onChange={(e) => update(i, { label_en: e.target.value })}
            />
            <input
              className={cn(inputCls, 'h-9 flex-1')}
              placeholder="Label (FR)"
              value={o.label_fr ?? ''}
              onChange={(e) => update(i, { label_fr: e.target.value })}
            />
            <button type="button" aria-label="Remove option" onClick={() => remove(i)} className="rounded p-1.5 text-ala-red hover:bg-ala-red/10">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <Button type="button" variant="ghost" size="sm" onClick={add} className="mt-2">
        <Plus className="h-3.5 w-3.5" /> Add option
      </Button>
    </div>
  );
}

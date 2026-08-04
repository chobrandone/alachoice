import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import type { FieldConfig } from '../lib/fields';
import { slugify } from '../lib/slug';
import { RichTextEditor } from './RichTextEditor';
import { MediaField } from './MediaField';
import { IconPicker } from './IconPicker';
import { GalleryManager } from './GalleryManager';
import { RegistrationFormBuilder } from './RegistrationFormBuilder';
import { SpeakersEditor } from './SpeakersEditor';
import { CountryFaqEditor } from './CountryFaqEditor';
import { ServiceSelect } from './ServiceSelect';
import { TeamSelect } from './TeamSelect';
import type { EventSpeaker, CountryFaq } from '@ala/types';

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

type Values = Record<string, unknown>;

export function ResourceForm({
  fields,
  initial,
  onSubmit,
  onCancel,
  busy,
}: {
  fields: FieldConfig[];
  initial: Values;
  onSubmit: (values: Values) => void;
  onCancel: () => void;
  busy?: boolean;
}) {
  const [values, setValues] = useState<Values>(initial);
  const set = (name: string, v: unknown) => setValues((prev) => ({ ...prev, [name]: v }));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned: Values = { ...values };
    // Auto-fill empty slugs from their source field.
    for (const f of fields) {
      if (f.type === 'slug' && !cleaned[f.name] && f.slugFrom) {
        cleaned[f.name] = slugify(String(cleaned[f.slugFrom] ?? ''));
      }
    }
    onSubmit(cleaned);
  };

  return (
    <form onSubmit={submit} className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.name} className={cn(f.full || isWide(f.type) ? 'col-span-2' : 'col-span-2 sm:col-span-1')}>
              <label className="mb-1.5 block text-sm font-medium text-ala-navy">
                {f.label}
                {f.required && <span className="text-ala-red"> *</span>}
              </label>
              {f.type === 'gallery' ? (
                <GalleryManager eventId={values.id as string | undefined} />
              ) : f.type === 'regform' ? (
                <RegistrationFormBuilder eventId={values.id as string | undefined} />
              ) : f.type === 'speakers' ? (
                <SpeakersEditor
                  value={(values[f.name] as EventSpeaker[] | undefined) ?? []}
                  onChange={(v) => set(f.name, v)}
                />
              ) : f.type === 'faqlist' ? (
                <CountryFaqEditor
                  value={(values[f.name] as CountryFaq[] | undefined) ?? []}
                  onChange={(v) => set(f.name, v)}
                />
              ) : f.type === 'serviceselect' ? (
                <ServiceSelect
                  value={(values[f.name] as string | undefined) ?? ''}
                  onChange={(v) => set(f.name, v)}
                />
              ) : f.type === 'teamselect' ? (
                <TeamSelect
                  value={(values[f.name] as string | undefined) ?? ''}
                  onChange={(v) => set(f.name, v)}
                />
              ) : (
                <FieldInput field={f} value={values[f.name]} onChange={(v) => set(f.name, v)} />
              )}
              {f.help && <p className="mt-1 text-xs text-ala-grey-500">{f.help}</p>}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end gap-3 border-t border-ala-grey-200 bg-white px-6 py-4">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </form>
  );
}

function isWide(type: FieldConfig['type']) {
  return (
    type === 'textarea' ||
    type === 'richtext' ||
    type === 'image' ||
    type === 'icon' ||
    type === 'gallery' ||
    type === 'regform' ||
    type === 'speakers' ||
    type === 'faqlist'
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  const str = (value ?? '') as string;

  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          rows={3}
          className={cn(inputCls, 'h-auto py-2')}
          placeholder={field.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );
    case 'richtext':
      return <RichTextEditor value={str} onChange={onChange} />;
    case 'number':
      return (
        <input
          type="number"
          className={inputCls}
          value={value === null || value === undefined ? '' : Number(value)}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );
    case 'boolean':
      return (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-ala-navy"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm text-ala-grey-500">{field.placeholder ?? 'Enabled'}</span>
        </label>
      );
    case 'select':
      return (
        <select className={inputCls} value={str} onChange={(e) => onChange(e.target.value)}>
          <option value="">—</option>
          {field.options?.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    case 'image':
      return <MediaField value={str} onChange={onChange} bucket={field.bucket} />;
    case 'icon':
      return <IconPicker value={str} onChange={onChange} />;
    case 'date':
      return (
        <input type="date" className={inputCls} value={str?.slice(0, 10)} onChange={(e) => onChange(e.target.value || null)} />
      );
    case 'datetime':
      return (
        <input
          type="datetime-local"
          className={inputCls}
          value={str ? toLocalInput(str) : ''}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );
    default:
      return (
        <input
          type="text"
          className={inputCls}
          placeholder={field.placeholder}
          value={str}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

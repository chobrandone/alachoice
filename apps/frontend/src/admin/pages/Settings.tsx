import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Skeleton';
import { useToast } from '../components/Toast';
import { MediaField } from '../components/MediaField';

type SettingsMap = Record<string, Record<string, unknown>>;

interface FieldDef {
  name: string;
  label: string;
  type?: 'text' | 'textarea' | 'boolean' | 'number' | 'image';
}
interface SectionDef {
  key: string;
  title: string;
  fields: FieldDef[];
}

const SECTIONS: SectionDef[] = [
  {
    key: 'contact',
    title: 'Contact details',
    fields: [
      { name: 'email', label: 'Primary email' },
      { name: 'email_admin', label: 'Admin email' },
      { name: 'phone_us', label: 'US phone' },
      { name: 'phone_cm', label: 'Cameroon phone' },
      { name: 'address', label: 'Address' },
      { name: 'hours', label: 'Opening hours' },
    ],
  },
  {
    key: 'socials',
    title: 'Social media',
    fields: [
      { name: 'facebook', label: 'Facebook URL' },
      { name: 'x', label: 'X (Twitter) URL' },
      { name: 'youtube', label: 'YouTube URL' },
      { name: 'linkedin', label: 'LinkedIn URL' },
    ],
  },
  {
    key: 'brand',
    title: 'Brand',
    fields: [{ name: 'blurb', label: 'Footer blurb', type: 'textarea' }],
  },
  {
    key: 'popup',
    title: 'Consultation popup',
    fields: [
      { name: 'enabled', label: 'Enabled', type: 'boolean' },
      { name: 'delay_ms', label: 'Delay (ms)', type: 'number' },
      { name: 'title_en', label: 'Title (EN)' },
      { name: 'title_fr', label: 'Title (FR)' },
      { name: 'body_en', label: 'Body (EN)', type: 'textarea' },
      { name: 'body_fr', label: 'Body (FR)', type: 'textarea' },
    ],
  },
  {
    key: 'seo',
    title: 'SEO defaults',
    fields: [
      { name: 'default_title', label: 'Default title' },
      { name: 'default_description', label: 'Default description', type: 'textarea' },
    ],
  },
  {
    key: 'images',
    title: 'Section images',
    fields: [
      { name: 'home_about_image', label: 'Home “About ALA” image', type: 'image' },
      { name: 'about_who_image', label: 'About page “Who we are” image', type: 'image' },
    ],
  },
];

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

export function Settings() {
  const toast = useToast();
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/admin/settings'],
    queryFn: () => api.get<SettingsMap>('/admin/settings', { auth: true }).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <Spinner className="h-6 w-6 text-ala-navy" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 font-heading text-2xl font-bold text-ala-navy">Site Settings</h1>
      <div className="space-y-6">
        {SECTIONS.map((section) => (
          <SettingSection
            key={section.key}
            section={section}
            value={data?.[section.key] ?? {}}
            onSaved={() => {
              toast('success', `${section.title} saved`);
              refetch();
            }}
            onError={(m) => toast('error', m)}
          />
        ))}
      </div>
    </div>
  );
}

function SettingSection({
  section,
  value,
  onSaved,
  onError,
}: {
  section: SectionDef;
  value: Record<string, unknown>;
  onSaved: () => void;
  onError: (msg: string) => void;
}) {
  const [state, setState] = useState<Record<string, unknown>>(value);
  const [busy, setBusy] = useState(false);
  useEffect(() => setState(value), [value]);

  const save = async () => {
    setBusy(true);
    try {
      await api.put(`/admin/settings/${section.key}`, { value_json: state }, { auth: true });
      onSaved();
    } catch (e) {
      onError(e instanceof ApiError ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-card border border-ala-grey-200 bg-white p-6">
      <h2 className="mb-4 font-heading text-lg font-semibold text-ala-navy">{section.title}</h2>
      <div className="space-y-4">
        {section.fields.map((f) => (
          <label key={f.name} className="block">
            <span className="mb-1.5 block text-sm font-medium text-ala-navy">{f.label}</span>
            {f.type === 'image' ? (
              <MediaField
                value={String(state[f.name] ?? '')}
                onChange={(url) => setState((s) => ({ ...s, [f.name]: url }))}
                bucket="media"
              />
            ) : f.type === 'textarea' ? (
              <textarea
                rows={3}
                className={`${inputCls} h-auto py-2`}
                value={String(state[f.name] ?? '')}
                onChange={(e) => setState((s) => ({ ...s, [f.name]: e.target.value }))}
              />
            ) : f.type === 'boolean' ? (
              <input
                type="checkbox"
                className="h-4 w-4 accent-ala-navy"
                checked={!!state[f.name]}
                onChange={(e) => setState((s) => ({ ...s, [f.name]: e.target.checked }))}
              />
            ) : (
              <input
                type={f.type === 'number' ? 'number' : 'text'}
                className={inputCls}
                value={String(state[f.name] ?? '')}
                onChange={(e) =>
                  setState((s) => ({
                    ...s,
                    [f.name]: f.type === 'number' ? Number(e.target.value) : e.target.value,
                  }))
                }
              />
            )}
          </label>
        ))}
      </div>
      <div className="mt-5">
        <Button size="sm" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : 'Save'}
        </Button>
      </div>
    </section>
  );
}

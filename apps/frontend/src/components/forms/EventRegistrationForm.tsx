import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Copy, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useEventRegistrationForm } from '@/lib/queries';
import { useRegisterForEvent } from '@/lib/mutations';
import { useLocalized } from '@/lib/i18nField';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/cn';
import { ApiError } from '@/lib/api';
import type { EventFormField } from '@ala/types';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-[0.95rem] text-ala-ink placeholder:text-ala-grey-500/70 focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

type Answer = string | string[] | undefined;

export function EventRegistrationForm({ slug }: { slug: string }) {
  const { t, i18n } = useTranslation();
  const localized = useLocalized();
  const { data: form, isLoading } = useEventRegistrationForm(slug);
  const mutation = useRegisterForEvent(slug);

  const [core, setCore] = useState({ full_name: '', email: '', phone: '', country: '' });
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [company, setCompany] = useState(''); // honeypot
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  const fields = useMemo(() => form?.fields ?? [], [form]);

  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-card bg-ala-grey-100" />;
  }
  if (!form) return null;

  // Success screen
  if (mutation.isSuccess && mutation.data) {
    const ref = mutation.data.registration_ref;
    const waitlisted = mutation.data.status === 'waitlisted';
    return (
      <div className="rounded-card border border-ala-grey-200 bg-ala-grey-50 p-8 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <Check className="h-7 w-7" />
        </span>
        <h3 className="mt-4 font-heading text-xl font-semibold text-ala-navy">
          {waitlisted ? "You're on the waitlist" : "You're registered!"}
        </h3>
        <p className="mt-2 text-sm text-ala-grey-500">
          {waitlisted
            ? 'This event is at capacity. We’ve added you to the waitlist and will be in touch if a place opens up.'
            : 'A confirmation email is on its way. Please keep your registration reference for your records.'}
        </p>
        <div className="mt-5 inline-flex items-center gap-3 rounded-btn bg-white px-4 py-2.5 shadow-soft">
          <span className="font-mono text-lg font-bold tracking-wider text-ala-navy">{ref}</span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(ref);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            className="text-ala-grey-500 hover:text-ala-red"
            aria-label="Copy reference"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      </div>
    );
  }

  // Closed for registration
  if (form.event.is_closed) {
    return (
      <div className="rounded-card border border-ala-grey-200 bg-ala-grey-50 p-6 text-center text-ala-grey-500">
        <p className="font-medium text-ala-navy">Registration is closed</p>
        <p className="mt-1 text-sm">
          {form.event.registration_deadline
            ? `The deadline was ${formatDate(form.event.registration_deadline, i18n.language)}.`
            : 'Registration for this event is not currently open.'}
        </p>
      </div>
    );
  }

  const setAnswer = (key: string, value: Answer) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!core.full_name.trim()) next.full_name = t('forms.required');
    if (!core.email.trim()) next.email = t('forms.required');
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(core.email)) next.email = t('forms.invalidEmail');
    for (const f of fields) {
      if (!f.is_required) continue;
      const v = answers[f.field_key];
      const empty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
      if (empty) next[f.field_key] = t('forms.required');
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    mutation.mutate({
      full_name: core.full_name.trim(),
      email: core.email.trim(),
      phone: core.phone.trim() || undefined,
      country: core.country.trim() || undefined,
      data: answers,
      company: company || undefined,
    });
  };

  const seats = form.event;
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {/* Seats badge */}
      {seats.capacity != null && (
        <div className="flex items-center gap-2 rounded-btn bg-ala-navy/5 px-3 py-2 text-sm text-ala-navy">
          <Users className="h-4 w-4 text-ala-red" />
          {seats.is_full ? (
            <span>This event is full — new registrations join the waitlist.</span>
          ) : (
            <span>
              <strong>{seats.seats_remaining}</strong> of {seats.capacity} seats remaining
            </span>
          )}
        </div>
      )}

      {/* Honeypot */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        value={company}
        onChange={(e) => setCompany(e.target.value)}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('forms.name')} required error={errors.full_name}>
          <input
            className={inputCls}
            value={core.full_name}
            onChange={(e) => setCore({ ...core, full_name: e.target.value })}
          />
        </Field>
        <Field label={t('forms.email')} required error={errors.email}>
          <input
            type="email"
            className={inputCls}
            value={core.email}
            onChange={(e) => setCore({ ...core, email: e.target.value })}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('forms.phone')}>
          <input
            className={inputCls}
            value={core.phone}
            onChange={(e) => setCore({ ...core, phone: e.target.value })}
          />
        </Field>
        <Field label={t('forms.country')}>
          <input
            className={inputCls}
            value={core.country}
            onChange={(e) => setCore({ ...core, country: e.target.value })}
          />
        </Field>
      </div>

      {/* Dynamic custom fields */}
      {fields.map((f) => (
        <DynamicField
          key={f.id}
          field={f}
          value={answers[f.field_key]}
          error={errors[f.field_key]}
          onChange={(v) => setAnswer(f.field_key, v)}
          localized={localized}
        />
      ))}

      {mutation.isError && (
        <p className="text-sm text-ala-red">
          {mutation.error instanceof ApiError ? mutation.error.message : t('forms.error')}
        </p>
      )}

      <Button type="submit" disabled={mutation.isPending} size="lg" className="w-full">
        {mutation.isPending ? t('common.sending') : t('common.register')}
      </Button>
    </form>
  );
}

function DynamicField({
  field,
  value,
  error,
  onChange,
  localized,
}: {
  field: EventFormField;
  value: Answer;
  error?: string;
  onChange: (v: Answer) => void;
  localized: (row: Record<string, unknown>, key: string) => string;
}) {
  const label = localized(field as unknown as Record<string, unknown>, 'label');
  const placeholder = field.placeholder ?? undefined;
  const help = field.help_text ?? undefined;
  const opts = field.options ?? [];

  const control = () => {
    switch (field.field_type) {
      case 'textarea':
        return (
          <textarea
            rows={4}
            placeholder={placeholder}
            className={cn(inputCls, 'h-auto py-3')}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      case 'select':
        return (
          <select
            className={cn(inputCls, 'appearance-none')}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          >
            <option value="">—</option>
            {opts.map((o) => (
              <option key={o.value} value={o.value}>
                {localized(o as unknown as Record<string, unknown>, 'label')}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div className="space-y-2 pt-1">
            {opts.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-ala-ink">
                <input
                  type="radio"
                  name={field.field_key}
                  value={o.value}
                  checked={value === o.value}
                  onChange={() => onChange(o.value)}
                  className="h-4 w-4 accent-ala-red"
                />
                {localized(o as unknown as Record<string, unknown>, 'label')}
              </label>
            ))}
          </div>
        );
      case 'checkbox': {
        const arr = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2 pt-1">
            {opts.map((o) => (
              <label key={o.value} className="flex items-center gap-2 text-sm text-ala-ink">
                <input
                  type="checkbox"
                  value={o.value}
                  checked={arr.includes(o.value)}
                  onChange={(e) =>
                    onChange(
                      e.target.checked
                        ? [...arr, o.value]
                        : arr.filter((v) => v !== o.value),
                    )
                  }
                  className="h-4 w-4 accent-ala-red"
                />
                {localized(o as unknown as Record<string, unknown>, 'label')}
              </label>
            ))}
          </div>
        );
      }
      case 'file':
        // File uploads are captured as a note here; full upload lands in a later phase.
        return (
          <input
            type="text"
            placeholder={placeholder ?? 'Provide a link to your document'}
            className={inputCls}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
      default:
        return (
          <input
            type={field.field_type === 'number' ? 'number' : field.field_type === 'date' ? 'date' : field.field_type === 'email' ? 'email' : field.field_type === 'tel' ? 'tel' : 'text'}
            placeholder={placeholder}
            className={inputCls}
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );
    }
  };

  return (
    <Field label={label} required={field.is_required} error={error} help={help}>
      {control()}
    </Field>
  );
}

function Field({
  label,
  required,
  error,
  help,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ala-navy">
        {label}
        {required && <span className="ml-0.5 text-ala-red">*</span>}
      </span>
      {children}
      {help && !error && <span className="mt-1 block text-xs text-ala-grey-500">{help}</span>}
      {error && <span className="mt-1 block text-xs text-ala-red">{error}</span>}
    </label>
  );
}

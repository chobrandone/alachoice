import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useServices } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import { useSubmitInquiry } from '@/lib/mutations';
import { cn } from '@/lib/cn';

const inputCls =
  'h-11 w-full rounded-input border border-ala-grey-200 bg-white px-3.5 text-[0.95rem] text-ala-ink placeholder:text-ala-grey-500/70 focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

export function InquiryForm({ variant = 'light' }: { variant?: 'light' | 'onGrey' }) {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: services } = useServices();
  const mutation = useSubmitInquiry();

  const schema = z.object({
    name: z.string().min(1, t('forms.required')),
    email: z.string().min(1, t('forms.required')).email(t('forms.invalidEmail')),
    phone: z.string().optional(),
    service_id: z.string().uuid().optional().or(z.literal('')),
    message: z.string().min(1, t('forms.required')),
    company: z.string().max(0).optional(),
  });
  type Values = z.infer<typeof schema>;

  const { register, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
  });
  const errors = formState.errors;

  const onSubmit = (values: Values) => {
    const payload = { ...values, service_id: values.service_id || undefined };
    mutation.mutate(payload, { onSuccess: () => reset() });
  };

  if (mutation.isSuccess) {
    return (
      <div className="flex items-center gap-3 rounded-card bg-ala-grey-50 p-6 text-ala-navy">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-ala-red/10 text-ala-red">
          <Check className="h-5 w-5" />
        </span>
        <p className="font-medium">{t('forms.successInquiry')}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register('company')} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('forms.name')} error={errors.name?.message}>
          <input className={inputCls} {...register('name')} aria-invalid={!!errors.name} />
        </Field>
        <Field label={t('forms.email')} error={errors.email?.message}>
          <input type="email" className={inputCls} {...register('email')} aria-invalid={!!errors.email} />
        </Field>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t('forms.phone')}>
          <input className={inputCls} {...register('phone')} />
        </Field>
        <Field label={t('forms.service')}>
          <select className={cn(inputCls, 'appearance-none')} {...register('service_id')} defaultValue="">
            <option value="">{t('forms.selectService')}</option>
            {(services ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {localized(s, 'title')}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label={t('forms.message')} error={errors.message?.message}>
        <textarea
          rows={5}
          className={cn(inputCls, 'h-auto py-3')}
          {...register('message')}
          aria-invalid={!!errors.message}
        />
      </Field>

      {mutation.isError && <p className="text-sm text-ala-red">{t('forms.error')}</p>}

      <Button type="submit" disabled={mutation.isPending} size="lg" className="w-full sm:w-auto">
        {mutation.isPending ? t('common.sending') : t('common.submit')}
      </Button>
      <span className={variant === 'onGrey' ? 'sr-only' : 'sr-only'} />
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ala-navy">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-ala-red">{error}</span>}
    </label>
  );
}

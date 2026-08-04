import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Check } from 'lucide-react';
import { useSubscribeNewsletter } from '@/lib/mutations';

const schema = z.object({ email: z.string().email(), company: z.string().max(0).optional() });
type Values = z.infer<typeof schema>;

export function NewsletterForm() {
  const { t } = useTranslation();
  const { register, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
  });
  const mutation = useSubscribeNewsletter();

  const onSubmit = (values: Values) =>
    mutation.mutate(values, { onSuccess: () => reset() });

  if (mutation.isSuccess) {
    return (
      <p className="flex items-center gap-2 text-sm text-ala-gold">
        <Check className="h-4 w-4" /> {t('forms.successNewsletter')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex items-center gap-2" noValidate>
      {/* honeypot */}
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register('company')} />
      <label htmlFor="nl-email" className="sr-only">
        {t('forms.email')}
      </label>
      <input
        id="nl-email"
        type="email"
        placeholder={t('forms.newsletterPlaceholder')}
        className="h-10 w-full rounded-input bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-ala-red"
        aria-invalid={!!formState.errors.email}
        {...register('email')}
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        aria-label={t('forms.subscribe')}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-input bg-ala-red text-white transition-colors hover:bg-ala-red-dark disabled:opacity-60"
      >
        <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { useSubscribeNewsletter } from '@/lib/mutations';
import { useRecaptcha } from '@/lib/recaptcha';

const schema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  company: z.string().max(0).optional(),
});
type Values = z.infer<typeof schema>;

const inputCls =
  'h-10 w-full rounded-input bg-white/10 px-3 text-sm text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-ala-cta';

export function NewsletterForm() {
  const { t, i18n } = useTranslation();
  const fr = i18n.language?.startsWith('fr');
  const { register, handleSubmit, reset, formState } = useForm<Values>({
    resolver: zodResolver(schema),
  });
  const mutation = useSubscribeNewsletter();
  const getRecaptchaToken = useRecaptcha();

  // Only email is persisted for now; the name improves the sign-up experience.
  const onSubmit = async (values: Values) => {
    const recaptcha_token = await getRecaptchaToken('newsletter');
    mutation.mutate({ email: values.email, recaptcha_token }, { onSuccess: () => reset() });
  };

  if (mutation.isSuccess) {
    return (
      <p className="flex items-center gap-2 text-sm text-ala-gold">
        <Check className="h-4 w-4" /> {t('forms.successNewsletter')}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5" noValidate>
      <input type="text" tabIndex={-1} autoComplete="off" className="hidden" {...register('company')} />
      <label htmlFor="nl-name" className="sr-only">
        {fr ? 'Votre nom' : 'Your name'}
      </label>
      <input id="nl-name" type="text" placeholder={fr ? 'Votre nom' : 'Your name'} className={inputCls} {...register('name')} />
      <label htmlFor="nl-email" className="sr-only">
        {t('forms.email')}
      </label>
      <input
        id="nl-email"
        type="email"
        placeholder={fr ? 'Votre e-mail' : 'Your email'}
        className={inputCls}
        aria-invalid={!!formState.errors.email}
        {...register('email')}
      />
      <button
        type="submit"
        disabled={mutation.isPending}
        className="h-10 w-full rounded-input bg-ala-cta text-sm font-semibold text-white transition-colors hover:bg-ala-cta-dark disabled:opacity-60"
      >
        {fr ? 'S’inscrire' : 'Sign up'}
      </button>
    </form>
  );
}

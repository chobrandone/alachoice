import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';

export function LanguageSwitcher({ className, invert }: { className?: string; invert?: boolean }) {
  const { i18n } = useTranslation();
  const current = i18n.language.startsWith('fr') ? 'fr' : 'en';

  return (
    <div className={cn('flex items-center gap-1 text-sm font-medium', className)} role="group" aria-label="Language">
      {(['en', 'fr'] as const).map((lng, i) => (
        <span key={lng} className="flex items-center gap-1">
          {i > 0 && <span className={invert ? 'text-white/30' : 'text-ala-grey-200'}>/</span>}
          <button
            type="button"
            onClick={() => i18n.changeLanguage(lng)}
            aria-pressed={current === lng}
            className={cn(
              'uppercase transition-colors',
              current === lng
                ? 'text-ala-red'
                : invert
                  ? 'text-white/70 hover:text-white'
                  : 'text-ala-grey-500 hover:text-ala-navy',
            )}
          >
            {lng}
          </button>
        </span>
      ))}
    </div>
  );
}

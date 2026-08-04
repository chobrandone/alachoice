import { useServices } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

/** Dropdown of published services, bound to a service_id value. */
export function ServiceSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string | null) => void;
}) {
  const { data: services } = useServices();
  const localized = useLocalized();
  return (
    <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— None —</option>
      {(services ?? []).map((s) => (
        <option key={s.id} value={s.id}>
          {localized(s, 'title')}
        </option>
      ))}
    </select>
  );
}

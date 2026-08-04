import { useTeam } from '@/lib/queries';

const inputCls =
  'h-10 w-full rounded-input border border-ala-grey-200 bg-white px-3 text-sm text-ala-ink focus:border-ala-navy focus:outline-none focus:ring-1 focus:ring-ala-navy';

/** Dropdown of team members, bound to a consultant_id value. */
export function TeamSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string | null) => void;
}) {
  const { data: team } = useTeam();
  return (
    <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">— Any consultant —</option>
      {(team ?? []).map((m) => (
        <option key={m.id} value={m.id}>
          {m.full_name}
        </option>
      ))}
    </select>
  );
}

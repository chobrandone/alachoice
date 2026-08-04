import { cn } from '@/lib/cn';

const STYLES: Record<string, string> = {
  draft: 'bg-ala-grey-200 text-ala-grey-500',
  submitted: 'bg-sky-100 text-sky-700',
  in_review: 'bg-amber-100 text-amber-700',
  approved: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-ala-navy/10 text-ala-navy',
  rejected: 'bg-red-100 text-red-700',
  pending: 'bg-amber-100 text-amber-700',
  requested: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-ala-grey-200 text-ala-grey-500',
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-0.5 text-xs font-medium capitalize',
        STYLES[status] ?? 'bg-ala-grey-200 text-ala-grey-500',
      )}
    >
      {status.replace('_', ' ')}
    </span>
  );
}

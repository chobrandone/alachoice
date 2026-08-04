import { cn } from '@/lib/cn';

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-ala-grey-200/70', className)} />;
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent',
        className,
      )}
    />
  );
}

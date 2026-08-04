import { ICON_NAMES } from '@/components/ui/iconRegistry';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { cn } from '@/lib/cn';

/** Grid of the curated Lucide icons for services.icon_name. */
export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  return (
    <div className="grid max-h-48 grid-cols-8 gap-1 overflow-y-auto rounded-input border border-ala-grey-200 p-2">
      {ICON_NAMES.map((name) => (
        <button
          key={name}
          type="button"
          title={name}
          onClick={() => onChange(name)}
          className={cn(
            'flex h-9 items-center justify-center rounded hover:bg-ala-grey-50',
            value === name && 'bg-ala-navy text-white hover:bg-ala-navy',
          )}
        >
          <DynamicIcon name={name} className="h-5 w-5" strokeWidth={1.5} />
        </button>
      ))}
    </div>
  );
}

import { Facebook, Youtube, Linkedin, Twitter } from 'lucide-react';
import { cn } from '@/lib/cn';

type Settings = Record<string, Record<string, unknown>> | undefined;

const NETWORKS = [
  { key: 'facebook', Icon: Facebook, label: 'Facebook' },
  { key: 'x', Icon: Twitter, label: 'X' },
  { key: 'youtube', Icon: Youtube, label: 'YouTube' },
  { key: 'linkedin', Icon: Linkedin, label: 'LinkedIn' },
] as const;

export function Socials({
  settings,
  className,
  iconClass = 'h-4 w-4',
}: {
  settings: Settings;
  className?: string;
  iconClass?: string;
}) {
  const socials = (settings?.socials ?? {}) as Record<string, string>;
  const active = NETWORKS.filter((n) => socials[n.key]);
  if (!active.length) return null;

  return (
    <div className={cn('flex items-center gap-3', className)}>
      {active.map(({ key, Icon, label }) => (
        <a
          key={key}
          href={socials[key]}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="transition-colors hover:text-ala-red"
        >
          <Icon className={iconClass} />
        </a>
      ))}
    </div>
  );
}

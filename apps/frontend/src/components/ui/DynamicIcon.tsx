import { Briefcase, type LucideProps } from 'lucide-react';
import { ICON_REGISTRY, normalizeIconName } from './iconRegistry';

/**
 * Renders a curated Lucide icon by name (from services.icon_name).
 * Only the registry icons are bundled. Falls back to Briefcase.
 */
export function DynamicIcon({
  name,
  ...props
}: { name?: string | null } & Omit<LucideProps, 'name'>) {
  const Icon = ICON_REGISTRY[normalizeIconName(name)] ?? Briefcase;
  return <Icon {...props} />;
}

import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { DynamicIcon } from '@/components/ui/DynamicIcon';
import { useLocalized } from '@/lib/i18nField';
import type { Service } from '@ala/types';

export function ServiceCard({ service }: { service: Service }) {
  const localized = useLocalized();
  return (
    <Link
      to={`/services/${service.slug}`}
      className="group relative flex flex-col rounded-card border border-ala-grey-200 bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ala-navy/5 text-ala-navy transition-colors group-hover:bg-ala-navy group-hover:text-white">
        <DynamicIcon name={service.icon_name} className="h-6 w-6" strokeWidth={1.5} />
      </span>
      <h3 className="mt-5 font-heading text-xl font-semibold text-ala-navy">
        {localized(service, 'title')}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-ala-grey-500">
        {localized(service, 'excerpt')}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-ala-red">
        <span className="relative">
          Learn more
          <span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-ala-red transition-all duration-300 group-hover:w-full" />
        </span>
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </Link>
  );
}

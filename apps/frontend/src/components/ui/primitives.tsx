import { cn } from '@/lib/cn';

export function Container({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('container', className)} {...props} />;
}

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  tone?: 'white' | 'grey' | 'navy';
}
export function Section({ tone = 'white', className, children, ...props }: SectionProps) {
  const toneClass =
    tone === 'navy'
      ? 'bg-navy-gradient text-white'
      : tone === 'grey'
        ? 'bg-ala-grey-50'
        : 'bg-white';
  return (
    <section className={cn('py-16 md:py-24 lg:py-32', toneClass, className)} {...props}>
      {children}
    </section>
  );
}

export function Eyebrow({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={cn('eyebrow mb-3', className)}>{children}</p>;
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  align?: 'left' | 'center';
  invert?: boolean;
  className?: string;
}
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  invert = false,
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl',
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className={cn('text-h2', invert && 'text-white')}>{title}</h2>
      {intro && (
        <p className={cn('mt-4 text-body', invert ? 'text-white/80' : 'text-ala-grey-500')}>
          {intro}
        </p>
      )}
    </div>
  );
}

import { Container } from '@/components/ui/primitives';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: string | null;
}

/** Compact navy hero for interior pages. */
export function PageHero({ eyebrow, title, intro, image }: PageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-navy-gradient pb-16 pt-32 text-white md:pb-20 md:pt-40">
      {image && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{ backgroundImage: `url(${image})` }}
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-ala-navy/50" aria-hidden />
      <Container className="relative">
        {eyebrow && <p className="eyebrow text-ala-gold">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-h1 text-white">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-white/80">{intro}</p>}
      </Container>
    </section>
  );
}

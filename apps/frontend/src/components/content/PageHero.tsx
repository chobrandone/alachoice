import { motion, useReducedMotion } from 'framer-motion';
import { Container } from '@/components/ui/primitives';
import pageHeroBg from '@/assets/hero-bridge.jpg';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  image?: string | null;
}

/**
 * Compact navy hero for interior pages. Uses the page's own image when one is
 * set (DB / admin), otherwise a bundled on-brand background so every page hero
 * renders a subtly animated image even when the API/DB is unavailable.
 */
export function PageHero({ eyebrow, title, intro, image }: PageHeroProps) {
  const reduce = useReducedMotion();
  const bg = image || pageHeroBg;
  return (
    <section className="relative overflow-hidden bg-navy-gradient pb-16 pt-32 text-white md:pb-20 md:pt-40">
      <motion.div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bg})` }}
        initial={reduce ? undefined : { scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: 'easeOut' }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-ala-navy/50" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ala-navy-deep via-transparent to-transparent"
        aria-hidden
      />
      <Container className="relative">
        {eyebrow && <p className="eyebrow text-ala-gold">{eyebrow}</p>}
        <h1 className="mt-3 max-w-3xl text-h1 text-white">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-white/80">{intro}</p>}
      </Container>
    </section>
  );
}

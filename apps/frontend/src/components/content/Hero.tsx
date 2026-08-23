import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Container } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { useHeroSlides } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';
import heroBridge from '@/assets/hero-bridge.jpg';

export function Hero() {
  const localized = useLocalized();
  const { data: slides } = useHeroSlides();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  const list = slides ?? [];
  const count = list.length;

  useEffect(() => {
    if (count <= 1 || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(id);
  }, [count, reduce]);

  const slide = list[index];

  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-navy-gradient text-white">
      {/* Background image with 60% navy overlay for AA contrast */}
      <AnimatePresence mode="wait">
        <motion.div
          key={slide?.id ?? 'default'}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${slide?.image_url || heroBridge})` }}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-ala-navy/60" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-t from-ala-navy-deep via-ala-navy/40 to-transparent"
        aria-hidden
      />

      <Container className="relative z-10 py-32">
        <motion.div
          key={slide?.id ?? 'default'}
          initial={reduce ? undefined : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-3xl"
        >
          <p className="eyebrow text-ala-gold">
            {localized(slide, 'eyebrow') || 'Welcome to ALA'}
          </p>
          <h1 className="mt-4 text-h1 text-white">
            {localized(slide, 'title') || 'American Liaison in Africa'}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/85">
            {localized(slide, 'subtitle') ||
              'Bridging Cameroon, Africa, and the United States through trusted business consultancy — investment, trade, and diplomacy done right.'}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Button asChild size="lg">
              <Link to={slide?.cta_primary_url || '/about'}>
                {slide?.cta_primary_label || 'Know More'}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to={slide?.cta_secondary_url || '/contact'}>
                {slide?.cta_secondary_label || 'Contact Us'}
              </Link>
            </Button>
          </div>
        </motion.div>

        {count > 1 && (
          <div className="mt-12 flex gap-2" role="tablist" aria-label="Hero slides">
            {list.map((s, i) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={i === index}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-8 bg-ala-red' : 'w-4 bg-white/40 hover:bg-white/60'
                }`}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}

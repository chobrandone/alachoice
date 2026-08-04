import { Seo } from '@/components/Seo';
import { Container, Section } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { Skeleton } from '@/components/ui/Skeleton';
import { PageHero } from '@/components/content/PageHero';
import { ServiceCard } from '@/components/content/ServiceCard';
import { useServices } from '@/lib/queries';

export default function Services() {
  const { data: services, isLoading } = useServices();

  return (
    <>
      <Seo title="Services" description="Mobility, trade, AI, and academy — the four ALA pillars bridging Africa and the United States." />
      <PageHero
        eyebrow="Services"
        title="Four pillars, one bridge across the Atlantic"
        intro="Mobility, trade, AI, and training — end-to-end solutions moving people, products, and know-how between Africa and the United States."
      />
      <Section tone="grey">
        <Container>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-56 rounded-card" />)
              : (services ?? []).map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.06}>
                    <ServiceCard service={s} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </Section>
    </>
  );
}

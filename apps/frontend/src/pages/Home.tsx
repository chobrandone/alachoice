import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading, Eyebrow } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { Accordion } from '@/components/ui/Accordion';
import { Skeleton } from '@/components/ui/Skeleton';
import { Hero } from '@/components/content/Hero';
import { ServiceCard } from '@/components/content/ServiceCard';
import { EventCard } from '@/components/content/EventCard';
import { PartnerMarquee } from '@/components/content/PartnerMarquee';
import { NewsTicker } from '@/components/content/NewsTicker';
import { NewsCard } from '@/components/content/NewsCard';
import { TestimonialCard } from '@/components/content/TestimonialCard';
import { InquiryForm } from '@/components/forms/InquiryForm';
import {
  useServices,
  useStatistics,
  useMethodology,
  useFaqs,
  useFeaturedEvent,
  useTestimonials,
  useNews,
  useSiteSettings,
} from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

const MEDIA = 'https://bihhaxezlkgusionmlwm.supabase.co/storage/v1/object/public/media/alachoice/2025/04';

export default function Home() {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: stats } = useStatistics();
  const { data: pillars } = useMethodology();
  const { data: faqs } = useFaqs();
  const { data: featured } = useFeaturedEvent();
  const { data: testimonials } = useTestimonials();
  const { data: news } = useNews();
  const { data: settings } = useSiteSettings();
  const aboutImage =
    ((settings?.images as Record<string, string> | undefined)?.home_about_image) || `${MEDIA}/Africa.jpg`;

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'American Liaison in Africa',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://alachoice.com',
    address: { '@type': 'PostalAddress', addressLocality: 'Douala', addressCountry: 'CM' },
  };

  return (
    <>
      <Seo jsonLd={orgJsonLd} />
      <Hero />
      <NewsTicker />

      {/* About teaser — 7/5 split */}
      <Section>
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="relative">
              <div className="aspect-[4/5] overflow-hidden rounded-card bg-ala-grey-50 shadow-soft">
                <img
                  src={aboutImage}
                  alt="American Liaison in Africa"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 rounded-card bg-ala-navy px-6 py-5 text-white shadow-soft-lg">
                <p className="font-heading text-3xl font-bold text-ala-gold">15+</p>
                <p className="text-sm text-white/80">Years of Experience</p>
              </div>
            </div>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <Eyebrow>About ALA</Eyebrow>
            <h2 className="text-h2">
              A trusted bridge between Africa and the United States
            </h2>
            <p className="mt-5 text-body text-ala-grey-500">
              American Liaison in Africa partners with businesses, investors, and institutions to
              navigate cross-border opportunity — combining local insight in Cameroon and the wider
              continent with deep access to U.S. markets.
            </p>
            <ul className="mt-6 space-y-3">
              {['Business development', 'Investment advisory', 'International trade'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-ala-navy">
                  <CheckCircle2 className="h-5 w-5 text-ala-red" />
                  {item}
                </li>
              ))}
            </ul>
            <Button asChild className="mt-8">
              <Link to="/about">{t('nav.knowMore')}</Link>
            </Button>
          </Reveal>
        </Container>
      </Section>

      {/* Services grid */}
      <Section tone="grey">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="What we do"
            title="Consulting services built for cross-Atlantic growth"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {servicesLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-card" />
                ))
              : (services ?? []).map((s, i) => (
                  <Reveal key={s.id} delay={i * 0.06} as="div">
                    <ServiceCard service={s} />
                  </Reveal>
                ))}
          </div>
        </Container>
      </Section>

      {/* Methodology — navy */}
      <Section tone="navy">
        <Container className="grid gap-12 lg:grid-cols-2">
          <div>
            <Eyebrow className="text-ala-gold">Our approach</Eyebrow>
            <h2 className="text-h2 text-white">Strategic Excellence, Proven Results</h2>
            <p className="mt-5 text-white/75">
              A disciplined methodology that turns cross-border complexity into sustainable outcomes.
            </p>
          </div>
          <div className="space-y-8">
            {(pillars ?? []).map((p, i) => (
              <Reveal key={p.id} delay={i * 0.08} as="div" className="flex gap-5">
                <span className="font-heading text-2xl font-bold text-ala-gold">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  <h3 className="font-heading text-lg font-semibold text-white">
                    {localized(p, 'title')}
                  </h3>
                  <p className="mt-1 text-sm text-white/70">{localized(p, 'description')}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Statistics band */}
      {stats && stats.length > 0 && (
        <Section className="py-16 md:py-20">
          <Container>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.id} className="text-center">
                  <p className="font-heading text-4xl font-bold text-ala-navy md:text-5xl">
                    <span className="text-ala-gold">
                      <CountUp value={Number(s.value)} suffix={s.suffix} />
                    </span>
                  </p>
                  <p className="mt-2 text-sm font-medium text-ala-grey-500">{localized(s, 'label')}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* CTA band */}
      <Section className="bg-navy-gradient py-20 text-white">
        <Container className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          <div>
            <h2 className="text-h2 text-white">Let's Build Together.</h2>
            <p className="mt-2 text-white/80">Schedule a free consultation today.</p>
          </div>
          <Button asChild size="lg">
            <Link to="/contact">Get a Quotation</Link>
          </Button>
        </Container>
      </Section>

      {/* Partner marquee */}
      <Section className="py-14">
        <Container>
          <p className="mb-8 text-center text-sm font-medium uppercase tracking-wider text-ala-grey-500">
            Trusted by partners across two continents
          </p>
          <PartnerMarquee />
        </Container>
      </Section>

      {/* Featured event */}
      {featured && (
        <Section tone="grey">
          <Container>
            <SectionHeading eyebrow="Next event" title={localized(featured, 'title')} />
            <div className="mt-8 max-w-md">
              <EventCard event={featured} />
            </div>
          </Container>
        </Section>
      )}

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <Section tone="grey">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="Testimonials"
              title="Trusted by clients across two continents"
            />
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {testimonials.slice(0, 3).map((tst, i) => (
                <Reveal key={tst.id} delay={i * 0.06} as="div">
                  <TestimonialCard testimonial={tst} />
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Button asChild variant="outline-navy">
                <Link to="/testimonials">Read more success stories</Link>
              </Button>
            </div>
          </Container>
        </Section>
      )}

      {/* Latest news */}
      {news && news.length > 0 && (
        <Section>
          <Container>
            <div className="flex items-end justify-between gap-4">
              <SectionHeading eyebrow="News & Updates" title="Latest opportunities & insights" />
              <Link to="/news" className="hidden shrink-0 text-sm font-semibold text-ala-red hover:underline sm:block">
                View all news →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {news.slice(0, 3).map((n, i) => (
                <Reveal key={n.id} delay={i * 0.06} as="div">
                  <NewsCard article={n} />
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Inquiry form + FAQ */}
      <Section>
        <Container className="grid gap-16 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Get in touch" title={t('home.inquiryTitle')} />
            <div className="mt-8">
              <InquiryForm />
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="FAQ" title={t('home.faqTitle')} />
            <div className="mt-8">
              <Accordion
                items={(faqs ?? []).map((f) => ({
                  id: f.id,
                  question: localized(f, 'question'),
                  answer: localized(f, 'answer'),
                }))}
              />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

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
import { NewsCard } from '@/components/content/NewsCard';
import { TestimonialCard } from '@/components/content/TestimonialCard';
import { InquiryForm } from '@/components/forms/InquiryForm';
import {
  useServices,
  useStatistics,
  useMethodology,
  useFaqs,
  useTestimonials,
  useNews,
  useSiteSettings,
} from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

const MEDIA = 'https://alachoice.com/wp-content/uploads/2025/04';

export default function Home() {
  const { t } = useTranslation();
  const localized = useLocalized();
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: stats } = useStatistics();
  const { data: pillars } = useMethodology();
  const { data: faqs } = useFaqs();
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
            <Eyebrow>About Us</Eyebrow>
            <h2 className="text-h2">
              We are business consultants dedicated to driving your success
            </h2>
            <p className="mt-5 text-body text-ala-grey-500">
              At American Liaison in Africa (ALA), our mission is simple yet powerful: to bridge the
              gap between Cameroon and the United States through strategic consulting, cross-border
              collaboration, and impactful development initiatives. We are your trusted partner in
              navigating international opportunities with confidence, clarity, and cultural
              intelligence.
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
            eyebrow="Consulting Solutions"
            title="We've got your business covered"
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
            <Eyebrow className="text-ala-gold">Our methodology for delivering solutions</Eyebrow>
            <h2 className="text-h2 text-white">Strategic Excellence, Proven Results</h2>
            <p className="mt-5 text-white/75">
              At American Liaison in Africa, we blend strategic insight with local expertise to
              deliver tailored, sustainable outcomes — through deep stakeholder engagement,
              data-driven planning, and agile implementation aligned with your goals.
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
          <div className="max-w-2xl">
            <h2 className="text-h2 text-white">
              Let's Build Together. Schedule a free consultation today
            </h2>
            <p className="mt-3 text-white/80">
              Whether you're a U.S. company exploring African markets or a Cameroonian entrepreneur
              seeking American partnerships — ALA is your gateway to growth, influence, and
              opportunity.
            </p>
          </div>
          <Button asChild size="lg">
            <Link to="/contact">Get a Quotation</Link>
          </Button>
        </Container>
      </Section>

      {/* Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <Section tone="grey">
          <Container>
            <SectionHeading
              align="center"
              eyebrow="They Trust Us"
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
              <SectionHeading eyebrow="Our Knowledge" title="Stay updated with our consulting services" />
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

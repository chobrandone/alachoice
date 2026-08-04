import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Reveal } from '@/components/ui/Reveal';
import { CountUp } from '@/components/ui/CountUp';
import { PageHero } from '@/components/content/PageHero';
import { Skeleton } from '@/components/ui/Skeleton';
import { TeamCard } from '@/components/content/TeamCard';
import { useTeam, useTimeline, useStatistics, usePage, useSiteSettings, usePartners } from '@/lib/queries';
import { useLocalized } from '@/lib/i18nField';

const MEDIA = 'https://bihhaxezlkgusionmlwm.supabase.co/storage/v1/object/public/media/alachoice/2025/04';

export default function About() {
  const localized = useLocalized();
  const { data: page } = usePage('about');
  const { data: team, isLoading: teamLoading } = useTeam();
  const { data: timeline } = useTimeline();
  const { data: stats } = useStatistics();
  const { data: settings } = useSiteSettings();
  const { data: partners } = usePartners();
  const whoImage =
    ((settings?.images as Record<string, string> | undefined)?.about_who_image) || `${MEDIA}/US-AFRICA.webp`;

  return (
    <>
      <Seo title="About Us" description="Our mission, story, and leadership team." />
      <PageHero
        eyebrow="About Us"
        title={localized(page, 'title') || 'Bridging two continents with integrity'}
        intro={localized(page, 'seo_description') || undefined}
        image={page?.hero_image_url}
      />

      {/* Mission / vision */}
      <Section>
        <Container className="grid items-center gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <SectionHeading eyebrow="Who we are" title="Mission & Vision" />
            <div className="prose-ala mt-6">
              {page?.body_en ? (
                <div dangerouslySetInnerHTML={{ __html: localized(page, 'body') }} />
              ) : (
                <p className="text-body text-ala-grey-500">
                  American Liaison in Africa exists to connect ambition with opportunity across the
                  Atlantic — advising businesses, investors, and institutions with diplomacy and rigour.
                </p>
              )}
            </div>
          </Reveal>
          <Reveal className="lg:col-span-7" delay={0.1}>
            <div className="relative">
              <img
                src={whoImage}
                alt="American Liaison in Africa — bridging two continents"
                className="aspect-[4/3] w-full rounded-card object-cover shadow-soft-lg"
              />
              <div className="absolute -bottom-5 -left-5 hidden rounded-card bg-ala-red px-5 py-4 text-white shadow-soft-lg sm:block">
                <p className="font-heading text-lg font-bold">Cameroon ⇄ USA</p>
                <p className="text-xs text-white/85">Trusted cross-border partner</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      {/* Timeline */}
      {timeline && timeline.length > 0 && (
        <Section tone="grey">
          <Container>
            <SectionHeading eyebrow="Our journey" title="A story of steady growth" />
            <div className="mt-12 space-y-8 border-l-2 border-ala-grey-200 pl-8">
              {timeline.map((entry, i) => (
                <Reveal key={entry.id} delay={i * 0.05} className="relative">
                  <span className="absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-ala-red bg-white" />
                  <p className="font-heading text-lg font-bold text-ala-red">{entry.year}</p>
                  <h3 className="mt-1 font-heading text-xl font-semibold text-ala-navy">
                    {localized(entry, 'title')}
                  </h3>
                  <p className="mt-1 text-ala-grey-500">{localized(entry, 'description')}</p>
                </Reveal>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Stats */}
      {stats && stats.length > 0 && (
        <Section tone="navy" className="py-16">
          <Container>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <div key={s.id} className="text-center">
                  <p className="font-heading text-4xl font-bold text-ala-gold md:text-5xl">
                    <CountUp value={Number(s.value)} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-white/70">{localized(s, 'label')}</p>
                </div>
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Team */}
      <Section>
        <Container>
          <SectionHeading align="center" eyebrow="Leadership" title="The people behind ALA" />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {teamLoading
              ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-80 rounded-card" />)
              : (team ?? []).map((m) => <TeamCard key={m.id} member={m} />)}
          </div>
        </Container>
      </Section>

      {/* Partners */}
      {partners && partners.length > 0 && (
        <Section tone="grey">
          <Container>
            <SectionHeading align="center" eyebrow="Our partners" title="Trusted by organizations across two continents" />
            <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {partners.map((p) => {
                const logo = (
                  <div className="flex h-28 items-center justify-center rounded-card border border-ala-grey-200 bg-white p-5 shadow-soft transition-shadow hover:shadow-soft-lg">
                    <img src={p.logo_url ?? ''} alt={p.name} loading="lazy" className="max-h-full max-w-full object-contain" />
                  </div>
                );
                return p.website_url ? (
                  <a key={p.id} href={p.website_url} target="_blank" rel="noopener noreferrer">{logo}</a>
                ) : (
                  <div key={p.id}>{logo}</div>
                );
              })}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}

import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowRight,
  Store,
  ShoppingBag,
  Search,
  Handshake,
  ShieldCheck,
  Globe2,
  FileCheck2,
  LineChart,
  Truck,
  CheckCircle2,
} from 'lucide-react';
import { Seo } from '@/components/Seo';
import { Container, Section, SectionHeading } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/components/ui/Reveal';
import heroBg from '@/assets/hero-bridge.jpg';

/**
 * The ALA B2B Trade Platform — the "platform" the ATA page links out to.
 * A distinct, on-brand landing that connects export-ready African suppliers
 * with verified international buyers. Bilingual via inline EN/FR content.
 */
export default function B2BPlatform() {
  const { i18n } = useTranslation();
  const fr = i18n.language?.startsWith('fr');
  const t = (en: string, frr: string) => (fr ? frr : en);

  const audiences = [
    {
      icon: Store,
      title: t('For African suppliers', 'Pour les fournisseurs africains'),
      intro: t(
        'List your export-ready products, get verified, and reach international buyers actively sourcing from Africa.',
        'Référencez vos produits prêts à l’export, faites-vous vérifier et atteignez des acheteurs internationaux qui sourcent activement en Afrique.',
      ),
      points: [
        t('Create a verified supplier profile', 'Créez un profil fournisseur vérifié'),
        t('Showcase products, capacity & certifications', 'Présentez produits, capacité et certifications'),
        t('Receive qualified buyer enquiries', 'Recevez des demandes d’acheteurs qualifiés'),
        t('Get export & compliance support from ALA', 'Bénéficiez de l’appui export et conformité d’ALA'),
      ],
    },
    {
      icon: ShoppingBag,
      title: t('For international buyers', 'Pour les acheteurs internationaux'),
      intro: t(
        'Discover vetted African suppliers, compare offers, and source with confidence — backed by ALA’s on-the-ground support.',
        'Découvrez des fournisseurs africains vérifiés, comparez les offres et sourcez en toute confiance — avec l’appui terrain d’ALA.',
      ),
      points: [
        t('Browse vetted, export-ready suppliers', 'Parcourez des fournisseurs vérifiés, prêts à l’export'),
        t('Request quotes and samples', 'Demandez devis et échantillons'),
        t('Due diligence & quality checks via partners', 'Due diligence et contrôles qualité via partenaires'),
        t('Logistics & payment coordination', 'Coordination logistique et paiement'),
      ],
    },
  ];

  const steps = [
    {
      icon: ShieldCheck,
      title: t('Get export-ready', 'Préparez-vous à l’export'),
      body: t(
        'Through the Africa Trade Accelerator, suppliers reach the standards buyers expect.',
        'Grâce à l’Africa Trade Accelerator, les fournisseurs atteignent les standards attendus par les acheteurs.',
      ),
    },
    {
      icon: FileCheck2,
      title: t('List & get verified', 'Référencez-vous & faites-vous vérifier'),
      body: t(
        'Create a profile; ALA verifies products, capacity and documentation.',
        'Créez un profil ; ALA vérifie produits, capacité et documentation.',
      ),
    },
    {
      icon: Search,
      title: t('Get matched', 'Soyez mis en relation'),
      body: t(
        'We connect the right buyers and suppliers and arrange introductions.',
        'Nous connectons les bons acheteurs et fournisseurs et organisons les introductions.',
      ),
    },
    {
      icon: Handshake,
      title: t('Close the deal', 'Concluez l’accord'),
      body: t(
        'From negotiation to logistics and financing, ALA supports the deal through.',
        'De la négociation à la logistique et au financement, ALA accompagne l’accord jusqu’au bout.',
      ),
    },
  ];

  const features = [
    {
      icon: ShieldCheck,
      title: t('Verified counterparties', 'Contreparties vérifiées'),
      body: t('Every supplier is vetted before being matched with buyers.', 'Chaque fournisseur est vérifié avant toute mise en relation.'),
    },
    {
      icon: Handshake,
      title: t('Buyer–supplier matchmaking', 'Mise en relation acheteur-fournisseur'),
      body: t('Introductions based on products, volumes and standards.', 'Des introductions fondées sur produits, volumes et normes.'),
    },
    {
      icon: FileCheck2,
      title: t('Trade compliance support', 'Appui à la conformité'),
      body: t('Standards, certifications and documentation guidance.', 'Accompagnement normes, certifications et documentation.'),
    },
    {
      icon: Truck,
      title: t('Logistics & financing links', 'Logistique & financement'),
      body: t('Access to freight, customs and trade-finance partners.', 'Accès à des partenaires fret, douane et financement.'),
    },
    {
      icon: LineChart,
      title: t('Market intelligence', 'Intelligence de marché'),
      body: t('Demand, pricing and regulatory insight for target markets.', 'Demande, prix et réglementation des marchés cibles.'),
    },
    {
      icon: Globe2,
      title: t('Cross-border reach', 'Portée transfrontalière'),
      body: t('A bridge between African supply and global demand.', 'Un pont entre l’offre africaine et la demande mondiale.'),
    },
  ];

  return (
    <>
      <Seo
        title={t('B2B Trade Platform', 'Plateforme commerciale B2B')}
        description={t(
          'The ALA B2B Trade Platform connects export-ready African suppliers with verified international buyers.',
          'La plateforme commerciale B2B d’ALA connecte les fournisseurs africains prêts à l’export avec des acheteurs internationaux vérifiés.',
        )}
      />

      {/* Hero */}
      <section className="relative flex min-h-[80vh] items-center overflow-hidden bg-navy-gradient pt-32 text-white md:pt-40">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25"
          style={{ backgroundImage: `url(${heroBg})` }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ala-navy-deep via-ala-navy/50 to-transparent" aria-hidden />
        <Container className="relative z-10 pb-20 md:pb-28">
          <Reveal>
            <p className="eyebrow text-ala-gold">{t('ALA B2B Trade Platform', 'Plateforme commerciale B2B d’ALA')}</p>
            <h1 className="mt-4 max-w-4xl text-h1 text-white">
              {t('Where African suppliers meet global buyers', 'Là où les fournisseurs africains rencontrent les acheteurs mondiaux')}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/85">
              {t(
                'The digital extension of the Africa Trade Accelerator — connecting export-ready African businesses with verified international buyers, and supporting every deal from introduction to delivery.',
                'Le prolongement digital de l’Africa Trade Accelerator — connecter les entreprises africaines prêtes à l’export avec des acheteurs internationaux vérifiés, et accompagner chaque transaction de l’introduction à la livraison.',
              )}
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Button asChild size="lg">
                <Link to="/contact">{t('Request access', 'Demander un accès')}</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/ata">{t('About the Accelerator', 'À propos de l’Accélérateur')}</Link>
              </Button>
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-white/70">
              {[
                t('Verified suppliers', 'Fournisseurs vérifiés'),
                t('Vetted buyers', 'Acheteurs vérifiés'),
                t('Trade-ready deals', 'Transactions prêtes'),
              ].map((x) => (
                <span key={x} className="inline-flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-ala-gold" /> {x}
                </span>
              ))}
            </div>
          </Reveal>
        </Container>
      </section>

      {/* For suppliers / buyers */}
      <Section>
        <Container>
          <SectionHeading
            align="center"
            eyebrow={t('One platform, two sides', 'Une plateforme, deux côtés')}
            title={t('Built for suppliers and buyers alike', 'Conçue pour les fournisseurs comme pour les acheteurs')}
            className="mb-12"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {audiences.map((a, i) => (
              <Reveal key={a.title} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-card border border-ala-grey-200 bg-white p-8 shadow-soft">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-ala-navy/5 text-ala-navy">
                    <a.icon className="h-6 w-6" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-5 font-heading text-xl font-semibold text-ala-navy">{a.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ala-grey-500">{a.intro}</p>
                  <ul className="mt-5 space-y-2.5">
                    {a.points.map((p) => (
                      <li key={p} className="flex gap-2.5 text-sm text-ala-grey-500">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-ala-red" />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* How it works */}
      <Section tone="grey">
        <Container>
          <SectionHeading
            align="center"
            eyebrow={t('How it works', 'Comment ça marche')}
            title={t('From export-ready to deal done', 'De la préparation à l’export à l’accord conclu')}
            className="mb-12"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.06}>
                <div className="relative h-full rounded-card bg-white p-7 shadow-soft">
                  <span className="font-heading text-sm font-bold text-ala-gold">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="mt-3 flex h-11 w-11 items-center justify-center rounded-xl bg-ala-navy text-white">
                    <s.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-ala-navy">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ala-grey-500">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* Features */}
      <Section>
        <Container>
          <SectionHeading
            align="center"
            eyebrow={t('What you get', 'Ce que vous obtenez')}
            title={t('A platform backed by real support', 'Une plateforme soutenue par un accompagnement réel')}
            className="mb-12"
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05}>
                <div className="flex h-full flex-col rounded-card border border-ala-grey-200 bg-white p-7 shadow-soft transition-shadow hover:shadow-soft-lg">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-ala-red/10 text-ala-red">
                    <f.icon className="h-5 w-5" strokeWidth={1.5} />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-ala-navy">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ala-grey-500">{f.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      {/* CTA band */}
      <Section tone="navy">
        <Container className="text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl text-h2 text-white">
              {t('Ready to trade across borders?', 'Prêt à commercer au-delà des frontières ?')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
              {t(
                'Request access to the ALA B2B Trade Platform and let us connect you with the right partners.',
                'Demandez l’accès à la plateforme commerciale B2B d’ALA et laissez-nous vous connecter aux bons partenaires.',
              )}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/contact">
                  {t('Request access', 'Demander un accès')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">{t('Explore our services', 'Découvrir nos services')}</Link>
              </Button>
            </div>
          </Reveal>
        </Container>
      </Section>
    </>
  );
}

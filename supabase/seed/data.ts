/**
 * Baseline content for the ALA site, sourced from the live alachoice.com.
 * Bilingual EN/FR. This is the editable starting point — everything here can be
 * changed from the admin panel after seeding.
 *
 * Notes on fidelity to the source:
 *  - Live statistics show 0 and the team is a "John Doe" placeholder; sensible
 *    editable defaults are used here instead.
 *  - The two real events are dated 2026-03-31 (already past); placeholder FUTURE
 *    dates are used so the Upcoming / Featured sections render. Update in admin.
 *  - "What we deliver" lists and process steps are composed (the source pages
 *    only carry summary descriptions).
 */

/**
 * Brand images mirrored from alachoice.com into this project's Supabase Storage
 * (bucket `media`, path prefix `alachoice/<year>/<month>/<file>`). Helper builds
 * the public URL; swap the base if the project ref ever changes.
 */
const MEDIA_BASE = 'https://alachoice.com/wp-content/uploads/';
const media = (p: string) => MEDIA_BASE + p;

export const siteSettings: { key: string; value_json: Record<string, unknown> }[] = [
  {
    key: 'contact',
    value_json: {
      email: 'contacts@alachoice.com',
      email_admin: 'administrator@alachoice.com',
      phone_us: '+1 945 276 7857',
      phone_cm: '+237 676 936 019',
      address: 'Bonaberi, Douala, Cameroon',
      hours: 'Mon–Fri 08:00–22:00',
    },
  },
  {
    key: 'socials',
    // Fill exact profile URLs from the admin Site Settings module.
    value_json: { facebook: '', x: '', youtube: '', linkedin: '' },
  },
  {
    key: 'brand',
    value_json: {
      blurb:
        'American Liaison in Africa bridges the gap between Cameroon and the United States through strategic consulting, cross-border collaboration, and impactful development initiatives.',
    },
  },
  {
    key: 'popup',
    value_json: {
      enabled: true,
      delay_ms: 8000,
      title_en: 'Get a Free Consultation',
      title_fr: 'Consultation gratuite',
      body_en:
        'Schedule a free consultation with our team and discover how ALA can open doors across the Atlantic.',
      body_fr:
        "Planifiez une consultation gratuite avec notre équipe et découvrez comment ALA peut vous ouvrir des portes des deux côtés de l'Atlantique.",
    },
  },
  {
    key: 'seo',
    value_json: {
      default_title: 'American Liaison in Africa',
      default_description:
        'Corporate mobility, international trade, AI business automation, and corporate training bridging Cameroon, Africa, and the United States.',
    },
  },
];

export const heroSlides = [
  {
    eyebrow_en: 'Welcome to ALA',
    eyebrow_fr: 'Bienvenue chez ALA',
    title_en: 'American Liaison in Africa',
    title_fr: 'American Liaison in Africa',
    subtitle_en:
      'From entrepreneurs and investors to government institutions and nonprofit leaders, we help our clients build meaningful partnerships and unlock new potential across both sides of the Atlantic.',
    subtitle_fr:
      "Des entrepreneurs et investisseurs aux institutions publiques et dirigeants d'ONG, nous aidons nos clients à bâtir des partenariats solides et à révéler un nouveau potentiel des deux côtés de l'Atlantique.",
    image_url: media('2025/04/Bridge_011-min-1024x672-1.jpg'),
    cta_primary_label: 'Know More',
    cta_primary_url: '/about',
    cta_secondary_label: 'Contact Us',
    cta_secondary_url: '/contact',
    sort_order: 0,
    is_published: true,
  },
];

// The four ALA pillars. Each pillar is one service with an icon, cover image,
// and a rich body whose <h3> sections group its sub-services. Cover images are
// royalty-free Unsplash photos chosen to reflect each pillar; swap any of them
// in the admin Services module. Verified to load during bring-up.
export const services = [
  {
    slug: 'ala-mobility',
    icon_name: 'plane',
    title_en: 'ALA Mobility',
    title_fr: 'ALA Mobility',
    cover_image_url: media('2025/04/visa-assistance-service.jpg'),
    excerpt_en:
      'Corporate travel and international mobility — from business visas and invitation letters to executive travel, relocation, and airport meet-and-greet.',
    excerpt_fr:
      'Voyages d’affaires et mobilité internationale — des visas d’affaires et lettres d’invitation à la coordination des voyages, la relocation et l’accueil à l’aéroport.',
    body_en:
      '<p>ALA Mobility delivers corporate travel and international mobility solutions that move executives, teams, and families across borders with confidence — handling the visas, logistics, and on-the-ground support so you can focus on the purpose of the trip.</p><h3>Our services</h3><ul><li>Business visa assistance</li><li>Executive travel coordination</li><li>Invitation letters</li><li>Visa interview preparation</li><li>Passport assistance</li><li>Travel insurance</li><li>Business travel planning</li><li>Work permit guidance (through partners)</li><li>Expat relocation support</li><li>Airport meet-and-greet services</li></ul>',
    body_fr:
      '<p>ALA Mobility propose des solutions de voyages d’affaires et de mobilité internationale pour déplacer dirigeants, équipes et familles au-delà des frontières en toute sérénité — en prenant en charge les visas, la logistique et l’accompagnement sur le terrain afin que vous puissiez vous concentrer sur l’objet de votre voyage.</p><h3>Nos services</h3><ul><li>Assistance pour les visas d’affaires</li><li>Coordination des voyages des dirigeants</li><li>Lettres d’invitation</li><li>Préparation à l’entretien de visa</li><li>Assistance passeport</li><li>Assurance voyage</li><li>Organisation des voyages d’affaires</li><li>Accompagnement pour les permis de travail (via partenaires)</li><li>Accompagnement à la relocation des expatriés</li><li>Services d’accueil à l’aéroport</li></ul>',
    sort_order: 0,
    is_published: true,
  },
  {
    slug: 'ala-trade',
    icon_name: 'ship',
    title_en: 'ALA Trade',
    title_fr: 'ALA Trade',
    cover_image_url: media('2025/04/ImportExport2.jpeg'),
    excerpt_en:
      'International trade, import and export solutions — export readiness, sourcing, compliance, logistics, B2B matchmaking, and trade intelligence.',
    excerpt_fr:
      'Commerce international, import et export — préparation à l’export, sourcing, conformité, logistique, mise en relation B2B et intelligence commerciale.',
    body_en:
      '<p>ALA Trade helps African and American businesses move products across borders with confidence — from getting export-ready and sourcing the right suppliers to compliance, logistics, matchmaking, and the market intelligence behind every decision.</p><section class="svc-group"><img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Export services" /><h3>Export services</h3><ul><li>Export Readiness Training (Africa Trade Accelerator)</li><li>Export documentation support</li><li>Product compliance and certification guidance</li><li>FDA, USDA, EU and other market requirements</li><li>Packaging and labeling advisory</li><li>Export pricing strategy</li><li>Buyer matchmaking</li><li>International trade missions</li><li>Market research</li><li>Export financing support</li><li>Freight and logistics coordination</li><li>Quality inspections (through partners)</li></ul></section><section class="svc-group"><img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Import services" /><h3>Import services</h3><ul><li>International product sourcing</li><li>Supplier identification and verification</li><li>Factory audits (through partners)</li><li>Procurement management</li><li>Price negotiation support</li><li>Shipping and freight coordination</li><li>Customs documentation guidance</li><li>Import compliance advisory</li><li>Supply chain management</li><li>Warehousing and distribution partner referrals</li></ul></section><section class="svc-group"><img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="B2B trade services" /><h3>B2B trade services</h3><ul><li>Buyer and supplier matchmaking</li><li>Trade representation</li><li>International business development</li><li>B2B meetings</li><li>Trade fairs and exhibition support</li><li>Commercial due diligence</li><li>Contract negotiation support</li><li>Trade missions</li><li>International partnerships</li><li>Government and institutional liaison</li></ul></section><section class="svc-group"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Trade intelligence" /><h3>Trade intelligence</h3><ul><li>Market entry strategies</li><li>Country risk analysis</li><li>Industry reports</li><li>Trade regulations updates</li><li>Tariff and customs advisory</li><li>Incoterms guidance</li><li>Cross-border trade advisory</li></ul></section>',
    body_fr:
      '<p>ALA Trade aide les entreprises africaines et américaines à faire circuler leurs produits au-delà des frontières en toute confiance — de la préparation à l’export et du sourcing des bons fournisseurs à la conformité, la logistique, la mise en relation et l’intelligence de marché qui sous-tend chaque décision.</p><section class="svc-group"><img src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Services d’export" /><h3>Services d’export</h3><ul><li>Formation à la préparation à l’export (Africa Trade Accelerator)</li><li>Accompagnement à la documentation d’export</li><li>Conformité produit et certifications</li><li>Exigences des marchés FDA, USDA, UE et autres</li><li>Conseil en emballage et étiquetage</li><li>Stratégie de prix à l’export</li><li>Mise en relation avec les acheteurs</li><li>Missions commerciales internationales</li><li>Études de marché</li><li>Accompagnement au financement à l’export</li><li>Coordination du fret et de la logistique</li><li>Inspections qualité (via partenaires)</li></ul></section><section class="svc-group"><img src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Services d’import" /><h3>Services d’import</h3><ul><li>Sourcing de produits à l’international</li><li>Identification et vérification des fournisseurs</li><li>Audits d’usine (via partenaires)</li><li>Gestion des achats</li><li>Accompagnement à la négociation des prix</li><li>Coordination de l’expédition et du fret</li><li>Accompagnement à la documentation douanière</li><li>Conseil en conformité import</li><li>Gestion de la chaîne d’approvisionnement</li><li>Mise en relation avec partenaires d’entreposage et de distribution</li></ul></section><section class="svc-group"><img src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Services commerciaux B2B" /><h3>Services commerciaux B2B</h3><ul><li>Mise en relation acheteurs et fournisseurs</li><li>Représentation commerciale</li><li>Développement commercial international</li><li>Rendez-vous B2B</li><li>Accompagnement aux salons et expositions</li><li>Due diligence commerciale</li><li>Accompagnement à la négociation de contrats</li><li>Missions commerciales</li><li>Partenariats internationaux</li><li>Liaison avec les institutions et les pouvoirs publics</li></ul></section><section class="svc-group"><img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&amp;fit=crop&amp;w=1200&amp;q=80" alt="Intelligence commerciale" /><h3>Intelligence commerciale</h3><ul><li>Stratégies d’entrée sur le marché</li><li>Analyse du risque pays</li><li>Rapports sectoriels</li><li>Mises à jour des réglementations commerciales</li><li>Conseil tarifaire et douanier</li><li>Conseil sur les Incoterms</li><li>Conseil en commerce transfrontalier</li></ul></section>',
    sort_order: 1,
    is_published: true,
  },
  {
    slug: 'ala-ai',
    icon_name: 'bot',
    title_en: 'ALA AI',
    title_fr: 'ALA AI',
    cover_image_url: media(
      '2025/04/group-of-business-consultant-working-management-big-data-and-analyze-financial-document-of-company.jpg',
    ),
    excerpt_en:
      'AI employees and business automation — deploy AI assistants across sales, service, HR, legal, and marketing, plus CRM and process automation.',
    excerpt_fr:
      'Employés IA et automatisation des affaires — déployez des assistants IA pour la vente, le service, les RH, le juridique et le marketing, avec automatisation du CRM et des processus.',
    body_en:
      '<p>ALA AI puts a team of AI employees to work in your business — always on, always consistent — automating sales, customer service, HR, and back-office work so your people can focus on what matters most.</p><h3>Our services</h3><ul><li>AI Executive Assistant</li><li>AI Sales Representative</li><li>AI Customer Service</li><li>AI WhatsApp Assistant</li><li>AI HR Assistant</li><li>AI Legal Assistant</li><li>AI Marketing Assistant</li><li>CRM automation</li><li>Lead generation</li><li>Business process automation</li></ul>',
    body_fr:
      '<p>ALA AI met une équipe d’employés IA au service de votre entreprise — toujours disponibles, toujours cohérents — pour automatiser la vente, le service client, les RH et les tâches administratives, afin que vos équipes se concentrent sur l’essentiel.</p><h3>Nos services</h3><ul><li>Assistant de direction IA</li><li>Commercial IA</li><li>Service client IA</li><li>Assistant WhatsApp IA</li><li>Assistant RH IA</li><li>Assistant juridique IA</li><li>Assistant marketing IA</li><li>Automatisation du CRM</li><li>Génération de prospects</li><li>Automatisation des processus métier</li></ul>',
    sort_order: 2,
    is_published: true,
  },
  {
    slug: 'ala-academy',
    icon_name: 'graduation-cap',
    title_en: 'ALA Academy',
    title_fr: 'ALA Academy',
    cover_image_url: media(
      '2025/04/mature-business-coach-or-speaker-make-flip-chart-presentation-to-diverse-businesspeople-at-meeting.jpg',
    ),
    excerpt_en:
      'Corporate training and capacity building — from export readiness and international trade to AI for business, leadership, and executive masterclasses.',
    excerpt_fr:
      'Formation professionnelle et renforcement des capacités — de la préparation à l’export et du commerce international à l’IA pour les entreprises, au leadership et aux masterclasses pour dirigeants.',
    body_en:
      '<p>ALA Academy builds the skills your teams need to compete internationally — practical, expert-led training and capacity building across trade, technology, and leadership, delivered as workshops, masterclasses, and corporate programs.</p><h3>Our programs</h3><ul><li>Export Readiness</li><li>International Trade</li><li>Import Management</li><li>AI for Business</li><li>Digital Transformation</li><li>Procurement</li><li>Leadership Development</li><li>Cross-cultural Business</li><li>Business English</li><li>Sales &amp; Negotiation</li><li>Corporate workshops</li><li>Executive masterclasses</li></ul>',
    body_fr:
      '<p>ALA Academy développe les compétences dont vos équipes ont besoin pour être compétitives à l’international — des formations pratiques animées par des experts et un renforcement des capacités en commerce, technologie et leadership, sous forme d’ateliers, de masterclasses et de programmes en entreprise.</p><h3>Nos programmes</h3><ul><li>Préparation à l’export</li><li>Commerce international</li><li>Gestion des importations</li><li>L’IA pour les entreprises</li><li>Transformation digitale</li><li>Achats</li><li>Développement du leadership</li><li>Affaires interculturelles</li><li>Anglais des affaires</li><li>Vente et négociation</li><li>Ateliers en entreprise</li><li>Masterclasses pour dirigeants</li></ul>',
    sort_order: 3,
    is_published: true,
  },
];

export const methodologyPillars = [
  {
    title_en: 'Industry Insights',
    title_fr: 'Connaissance du secteur',
    description_en:
      'Deep, current knowledge of the markets, regulations, and networks on both sides of the Atlantic.',
    description_fr:
      'Une connaissance approfondie et actuelle des marchés, des réglementations et des réseaux des deux côtés de l’Atlantique.',
    sort_order: 0,
  },
  {
    title_en: 'Innovative Strategies',
    title_fr: 'Stratégies innovantes',
    description_en:
      'Tailored, forward-looking strategies that turn cross-border complexity into competitive advantage.',
    description_fr:
      'Des stratégies sur mesure et tournées vers l’avenir qui transforment la complexité transfrontalière en avantage concurrentiel.',
    sort_order: 1,
  },
  {
    title_en: 'Drive Sustainable Success',
    title_fr: 'Réussite durable',
    description_en:
      'A relentless focus on outcomes that last — sustainable growth, not one-off wins.',
    description_fr:
      'Une concentration constante sur des résultats durables — une croissance pérenne, et non des succès ponctuels.',
    sort_order: 2,
  },
];

// Live site shows 0 for all; these are sensible editable defaults.
export const statistics = [
  { label_en: 'Businesses Trust Us', label_fr: 'Entreprises nous font confiance', value: 200, suffix: '+', sort_order: 0 },
  { label_en: 'Projects Done', label_fr: 'Projets réalisés', value: 350, suffix: '+', sort_order: 1 },
  { label_en: 'Success Rate', label_fr: 'Taux de réussite', value: 98, suffix: '%', sort_order: 2 },
  { label_en: 'Years of Experience', label_fr: 'Ans d’expérience', value: 15, suffix: '+', sort_order: 3 },
];

export const faqs = [
  {
    question_en: 'Do you only work in Cameroon?',
    question_fr: 'Travaillez-vous uniquement au Cameroun ?',
    answer_en:
      'No. While Cameroon is our home base, we operate globally with a particular focus on building partnerships between Africa and the United States.',
    answer_fr:
      'Non. Bien que le Cameroun soit notre base, nous opérons à l’échelle mondiale, avec un accent particulier sur les partenariats entre l’Afrique et les États-Unis.',
    sort_order: 0,
    is_published: true,
  },
  {
    question_en: 'Do you offer virtual consulting?',
    question_fr: 'Proposez-vous du conseil à distance ?',
    answer_en:
      'Yes. We offer remote consulting services so we can support clients wherever they are located.',
    answer_fr:
      'Oui. Nous proposons des services de conseil à distance afin d’accompagner nos clients où qu’ils se trouvent.',
    sort_order: 1,
    is_published: true,
  },
  {
    question_en: 'Can you help me invest in the U.S. or Cameroon?',
    question_fr: 'Pouvez-vous m’aider à investir aux États-Unis ou au Cameroun ?',
    answer_en:
      'Absolutely. We support foreign direct investment in both directions with market insights, due diligence, and on-the-ground support.',
    answer_fr:
      'Absolument. Nous accompagnons les investissements directs étrangers dans les deux sens avec des analyses de marché, de la due diligence et un accompagnement terrain.',
    sort_order: 2,
    is_published: true,
  },
];

export const teamMembers = [
  {
    full_name: 'ALA Leadership',
    role_en: 'Director',
    role_fr: 'Directeur',
    bio_en:
      'Placeholder profile — replace with the real leadership bio, photo, and LinkedIn from the admin Team module.',
    bio_fr:
      'Profil provisoire — remplacez par la biographie, la photo et le LinkedIn réels depuis le module Équipe de l’administration.',
    photo_url: null,
    linkedin_url: null,
    sort_order: 0,
    is_published: true,
  },
];

export const timelineEntries = [
  {
    year: '2009',
    title_en: 'Founded',
    title_fr: 'Création',
    description_en: 'American Liaison in Africa is established to bridge Cameroon and the United States.',
    description_fr: 'American Liaison in Africa est créée pour rapprocher le Cameroun et les États-Unis.',
    sort_order: 0,
  },
  {
    year: '2015',
    title_en: 'Regional Expansion',
    title_fr: 'Expansion régionale',
    description_en: 'Services broaden across trade, investment, and event management for pan-African clients.',
    description_fr: 'Les services s’élargissent au commerce, à l’investissement et à l’événementiel pour une clientèle panafricaine.',
    sort_order: 1,
  },
  {
    year: '2024',
    title_en: 'Africa Trade Accelerator',
    title_fr: 'Africa Trade Accelerator',
    description_en: 'ATA is launched to give export-oriented African companies structured access to U.S. markets.',
    description_fr: 'ATA est lancé pour offrir aux entreprises africaines exportatrices un accès structuré aux marchés américains.',
    sort_order: 2,
  },
];

export const pages = [
  {
    slug: 'about',
    title_en: 'A trusted bridge between Africa and the United States',
    title_fr: 'Un pont de confiance entre l’Afrique et les États-Unis',
    seo_title: 'About Us',
    seo_description:
      'Our mission is to bridge the gap between Cameroon and the United States through strategic consulting and cross-border collaboration.',
    hero_image_url: media('2025/04/Africa.jpg'),
    is_published: true,
    body_en:
      '<h2>Our Mission</h2><p>To deliver tailored consulting solutions that drive sustainable success, by leveraging our expertise in business development, public affairs, international trade, communications, and negotiation.</p><h2>Our Vision</h2><p>To be the leading bridge between African innovation and global opportunity — empowering businesses, brands, and organizations to thrive through strategic partnerships.</p><h2>Who We Are</h2><p>At American Liaison in Africa (ALA), our mission is simple yet powerful: to bridge the gap between Cameroon and the United States through strategic consulting, cross-border collaboration, and impactful development initiatives. We are your trusted partner in navigating international opportunities with confidence, clarity, and cultural intelligence.</p>',
    body_fr:
      '<h2>Notre mission</h2><p>Offrir des solutions de conseil sur mesure qui favorisent une réussite durable, en nous appuyant sur notre expertise en développement des affaires, affaires publiques, commerce international, communication et négociation.</p><h2>Notre vision</h2><p>Être le principal pont entre l’innovation africaine et les opportunités mondiales — en permettant aux entreprises, marques et organisations de prospérer grâce à des partenariats stratégiques.</p><h2>Qui sommes-nous</h2><p>Chez American Liaison in Africa (ALA), notre mission est simple mais puissante : rapprocher le Cameroun et les États-Unis par le conseil stratégique, la collaboration transfrontalière et des initiatives de développement à fort impact.</p>',
  },
  {
    slug: 'ata',
    title_en: 'Africa Trade Accelerator',
    title_fr: 'Africa Trade Accelerator',
    seo_title: 'ATA — Africa Trade Accelerator',
    seo_description:
      'A strategic initiative helping export-oriented African companies gain structured access to international markets, particularly the United States.',
    hero_image_url: media('2026/03/ata-hero-ZLCgrvN0.jpg'),
    is_published: true,
    body_en:
      '<p>The Africa Trade Accelerator (ATA) is a strategic initiative by American Liaison in Africa designed to support export-oriented African companies. The programme helps businesses — especially in the agri-food sector — gain structured access to international markets, particularly the United States.</p>' +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar1-D9DLgQcU.jpg')}" alt="Export Readiness" /><h3>Export Readiness</h3><p>FDA/USDA standards compliance, packaging, labeling, certifications, and structuring products for worldwide distribution.</p></section>` +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar2-Bu7PpSlr.jpg')}" alt="Market Access" /><h3>Market Access</h3><p>Connections with international buyers, strategies for entering U.S. markets, and participation in trade fairs and missions.</p></section>` +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar3-cmmXPuZk.jpg')}" alt="Logistics &amp; Financing" /><h3>Logistics &amp; Financing</h3><p>International supply chains, transportation, storage, Incoterms, and access to financing through banks and investors.</p></section>` +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar4-xplCdMh0.jpg')}" alt="E-commerce &amp; Digital Trade" /><h3>E-commerce &amp; Digital Trade</h3><p>Leveraging digital platforms for international sales, reducing intermediaries, and enabling direct consumer and distributor access.</p></section>` +
      '<p><strong>Join the ATA program and access international markets today.</strong></p>',
    body_fr:
      '<p>L’Africa Trade Accelerator (ATA) est une initiative stratégique d’American Liaison in Africa destinée à soutenir les entreprises africaines exportatrices. Le programme aide les entreprises — notamment du secteur agroalimentaire — à accéder de manière structurée aux marchés internationaux, en particulier aux États-Unis.</p>' +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar1-D9DLgQcU.jpg')}" alt="Préparation à l’export" /><h3>Préparation à l’export</h3><p>Conformité aux normes FDA/USDA, emballage, étiquetage, certifications et structuration des produits pour la distribution mondiale.</p></section>` +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar2-Bu7PpSlr.jpg')}" alt="Accès au marché" /><h3>Accès au marché</h3><p>Mises en relation avec des acheteurs internationaux, stratégies d’entrée sur le marché américain et participation à des salons et missions commerciales.</p></section>` +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar3-cmmXPuZk.jpg')}" alt="Logistique et financement" /><h3>Logistique et financement</h3><p>Chaînes d’approvisionnement internationales, transport, stockage, Incoterms et accès au financement via banques et investisseurs.</p></section>` +
      `<section class="svc-group"><img src="${media('2026/03/ata-pillar4-xplCdMh0.jpg')}" alt="E-commerce et commerce digital" /><h3>E-commerce et commerce digital</h3><p>Exploiter les plateformes numériques pour la vente internationale, réduire les intermédiaires et permettre un accès direct aux consommateurs et distributeurs.</p></section>` +
      '<p><strong>Rejoignez le programme ATA et accédez dès aujourd’hui aux marchés internationaux.</strong></p>',
  },
];

// Real event titles; placeholder FUTURE dates (source dates were already past).
export const events = [
  {
    slug: 'us-africa-business-summit-2026',
    title_en: 'U.S.–Africa Business Summit 2026',
    title_fr: 'Sommet d’affaires États-Unis–Afrique 2026',
    description_en:
      'A premier gathering connecting American and African business leaders, investors, and institutions to forge new partnerships.',
    description_fr:
      'Un rendez-vous majeur réunissant dirigeants, investisseurs et institutions américains et africains pour nouer de nouveaux partenariats.',
    body_en:
      '<p>The U.S.–Africa Business Summit brings together key stakeholders from across the Atlantic for two days of high-level dialogue, matchmaking, and deal-making. ALA delegates gain invaluable opportunities to engage directly with investors and decision-makers.</p>',
    body_fr:
      '<p>Le Sommet d’affaires États-Unis–Afrique réunit les acteurs clés des deux côtés de l’Atlantique pour deux journées de dialogue de haut niveau, de mise en relation et de conclusion d’accords.</p>',
    poster_url: media('2025/04/US-AFRICA.webp'),
    start_date: '2026-10-15T09:00:00Z',
    end_date: '2026-10-16T17:00:00Z',
    location: 'Douala, Cameroon',
    registration_url: 'https://alachoice.com/u-s-africa-business-summit-2026/',
    status: 'upcoming' as const,
    is_featured: true,
    is_published: true,
  },
  {
    slug: 'africa-ceo-forum-2026',
    title_en: 'Africa CEO Forum 2026',
    title_fr: 'Africa CEO Forum 2026',
    description_en:
      'ALA leads a corporate delegation to one of the continent’s most influential gatherings of business leaders and investors.',
    description_fr:
      'ALA conduit une délégation d’entreprises à l’un des rassemblements les plus influents du continent pour dirigeants et investisseurs.',
    body_en:
      '<p>Join ALA’s delegation to the Africa CEO Forum for unparalleled access to the continent’s top executives, investors, and policymakers. A distinct experience offering members invaluable opportunities to engage directly with decision-makers.</p>',
    body_fr:
      '<p>Rejoignez la délégation ALA à l’Africa CEO Forum pour un accès inégalé aux principaux dirigeants, investisseurs et décideurs du continent.</p>',
    poster_url: media('2025/04/Blue-Modern-Business-Conference-Promotion-Newsletter-3.jpg'),
    start_date: '2026-11-20T09:00:00Z',
    end_date: '2026-11-21T17:00:00Z',
    location: 'Abidjan, Côte d’Ivoire',
    registration_url: 'https://alachoice.com/africa-ceo-forum-2026/',
    status: 'upcoming' as const,
    is_featured: false,
    is_published: true,
  },
];

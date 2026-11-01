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
        'International trade and export advisory, market entry, business matchmaking, visa and global mobility, investment facilitation, and trade training — bridging Africa and the United States.',
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

// The six ALA service pillars (from the Service Catalogue). Each pillar is one
// service with an icon, cover image (from alachoice.com media), and a rich body
// whose <section class="svc-group"> blocks render the "What ALA delivers"
// sub-services as clean cards. Edit any of this in the admin Services module.
export const services = [
  {
    slug: 'international-trade-export-advisory',
    icon_name: 'ship',
    title_en: 'International Trade & Export Advisory',
    title_fr: 'Commerce international et conseil à l’export',
    cover_image_url: media('2025/04/ImportExport2.jpeg'),
    excerpt_en:
      'Export readiness, import/export support, trade compliance and international market access — helping African companies reach buyers abroad, especially in the United States.',
    excerpt_fr:
      'Préparation à l’export, accompagnement import/export, conformité commerciale et accès aux marchés internationaux — pour aider les entreprises africaines à atteindre des acheteurs à l’étranger, en particulier aux États-Unis.',
    body_en:
      '<p>We help African companies get export-ready and reach international buyers — handling the preparation, documentation, compliance and connections that cross-border trade requires, with a particular focus on the United States.</p>' +
      '<section class="svc-group"><h3>Export readiness</h3><p>Assessing and preparing a company’s products, capacity and documentation so that it is ready to sell in international markets.</p></section>' +
      '<section class="svc-group"><h3>Import/export support</h3><p>Practical support with the steps and documents involved in importing and exporting goods.</p></section>' +
      '<section class="svc-group"><h3>Trade compliance coordination</h3><p>Coordinating the standards, registrations, labelling and certifications that target markets require.</p></section>' +
      '<section class="svc-group"><h3>International market access</h3><p>Helping companies reach buyers and markets abroad, particularly in the United States.</p></section>',
    body_fr:
      '<p>Nous aidons les entreprises africaines à se préparer à l’export et à atteindre des acheteurs internationaux — en prenant en charge la préparation, la documentation, la conformité et les mises en relation qu’exige le commerce transfrontalier, avec un accent particulier sur les États-Unis.</p>' +
      '<section class="svc-group"><h3>Préparation à l’export</h3><p>Évaluer et préparer les produits, la capacité et la documentation d’une entreprise afin qu’elle soit prête à vendre sur les marchés internationaux.</p></section>' +
      '<section class="svc-group"><h3>Accompagnement import/export</h3><p>Un appui concret sur les étapes et les documents liés à l’importation et à l’exportation de marchandises.</p></section>' +
      '<section class="svc-group"><h3>Coordination de la conformité commerciale</h3><p>Coordonner les normes, enregistrements, étiquetages et certifications exigés par les marchés cibles.</p></section>' +
      '<section class="svc-group"><h3>Accès aux marchés internationaux</h3><p>Aider les entreprises à atteindre des acheteurs et des marchés à l’étranger, en particulier aux États-Unis.</p></section>',
    sort_order: 0,
    is_published: true,
  },
  {
    slug: 'market-entry-business-expansion',
    icon_name: 'target',
    title_en: 'Market Entry & Business Expansion',
    title_fr: 'Entrée sur le marché et expansion',
    cover_image_url: media(
      '2025/04/business-team-consultant-working-with-new-startup-growth-project-plan-and-discussion-analyzing-for.jpg',
    ),
    excerpt_en:
      'Market research, business establishment coordination, expansion strategies and local representation to help you enter a new market or grow in an existing one.',
    excerpt_fr:
      'Études de marché, coordination de la création d’entreprise, stratégies d’expansion et représentation locale pour entrer sur un nouveau marché ou se développer sur un marché existant.',
    body_en:
      '<p>From first research to on-the-ground representation, we help you understand a market, set up for it, and grow — turning cross-border complexity into a clear, practical plan.</p>' +
      '<section class="svc-group"><h3>Market research</h3><p>Researching target markets, demand, competition and the regulatory environment for a client’s project.</p></section>' +
      '<section class="svc-group"><h3>Business establishment coordination</h3><p>Coordinating the steps to set up a business, working with partner firms on legal and tax matters.</p></section>' +
      '<section class="svc-group"><h3>Expansion strategies</h3><p>Developing practical strategies for entering a new market or growing in an existing one.</p></section>' +
      '<section class="svc-group"><h3>Local representation</h3><p>Acting as the client’s local point of contact and representative on the ground.</p></section>',
    body_fr:
      '<p>De la première étude de marché à la représentation sur le terrain, nous vous aidons à comprendre un marché, à vous y implanter et à vous développer — en transformant la complexité transfrontalière en un plan clair et concret.</p>' +
      '<section class="svc-group"><h3>Études de marché</h3><p>Étudier les marchés cibles, la demande, la concurrence et l’environnement réglementaire du projet d’un client.</p></section>' +
      '<section class="svc-group"><h3>Coordination de la création d’entreprise</h3><p>Coordonner les étapes de création d’une entreprise, en collaboration avec des cabinets partenaires pour les questions juridiques et fiscales.</p></section>' +
      '<section class="svc-group"><h3>Stratégies d’expansion</h3><p>Élaborer des stratégies concrètes pour entrer sur un nouveau marché ou se développer sur un marché existant.</p></section>' +
      '<section class="svc-group"><h3>Représentation locale</h3><p>Agir comme point de contact local et représentant du client sur le terrain.</p></section>',
    sort_order: 1,
    is_published: true,
  },
  {
    slug: 'business-matchmaking-partnerships',
    icon_name: 'handshake',
    title_en: 'Business Matchmaking & Strategic Partnerships',
    title_fr: 'Mise en relation et partenariats stratégiques',
    cover_image_url: media('2025/04/consultant-greeting-international-client-with-handshake-after-partnership.jpg'),
    excerpt_en:
      'Buyer-supplier connections, distributor identification, B2B introductions and partnership development — the right people, in the right market, at the right time.',
    excerpt_fr:
      'Mise en relation acheteurs-fournisseurs, identification de distributeurs, introductions B2B et développement de partenariats — les bonnes personnes, sur le bon marché, au bon moment.',
    body_en:
      '<p>We connect you with the buyers, suppliers, distributors and partners that fit your products and goals — and support you from first introduction all the way to agreement.</p>' +
      '<section class="svc-group"><h3>Buyer-supplier connections</h3><p>Connecting clients with buyers or suppliers that match their products, volumes and standards.</p></section>' +
      '<section class="svc-group"><h3>Distributor identification</h3><p>Identifying and shortlisting distributors or agents in the target market.</p></section>' +
      '<section class="svc-group"><h3>B2B introductions</h3><p>Arranging introductions and meetings between the client and relevant businesses.</p></section>' +
      '<section class="svc-group"><h3>Partnership development</h3><p>Supporting clients in building partnerships, from first contact to agreement.</p></section>',
    body_fr:
      '<p>Nous vous mettons en relation avec les acheteurs, fournisseurs, distributeurs et partenaires adaptés à vos produits et à vos objectifs — et nous vous accompagnons de la première introduction jusqu’à l’accord.</p>' +
      '<section class="svc-group"><h3>Mise en relation acheteurs-fournisseurs</h3><p>Mettre les clients en relation avec des acheteurs ou des fournisseurs correspondant à leurs produits, volumes et normes.</p></section>' +
      '<section class="svc-group"><h3>Identification de distributeurs</h3><p>Identifier et présélectionner des distributeurs ou des agents sur le marché cible.</p></section>' +
      '<section class="svc-group"><h3>Introductions B2B</h3><p>Organiser des introductions et des rencontres entre le client et les entreprises pertinentes.</p></section>' +
      '<section class="svc-group"><h3>Développement de partenariats</h3><p>Accompagner les clients dans la construction de partenariats, du premier contact à l’accord.</p></section>',
    sort_order: 2,
    is_published: true,
  },
  {
    slug: 'visa-global-mobility',
    icon_name: 'plane',
    title_en: 'Visa & Global Mobility Services',
    title_fr: 'Visa et mobilité internationale',
    cover_image_url: media('2025/04/visa-assistance-service.jpg'),
    excerpt_en:
      'Visa application administrative support, business travel coordination, relocation logistics and mobility orientation for professionals moving across borders.',
    excerpt_fr:
      'Appui administratif aux demandes de visa, coordination des voyages d’affaires, logistique de relocation et orientation à la mobilité pour les professionnels qui franchissent les frontières.',
    body_en:
      '<p>We handle the practical side of moving people across borders — from organising visa documents to arranging travel and settling in — so professionals, teams and families can focus on the purpose of the move.</p>' +
      '<section class="svc-group"><h3>Visa application administrative support</h3><p>Helping applicants prepare and organise visa documents and get ready for interviews. Visa decisions rest solely with the relevant embassy.</p></section>' +
      '<section class="svc-group"><h3>Business travel coordination</h3><p>Organising the practical arrangements for business trips.</p></section>' +
      '<section class="svc-group"><h3>Relocation logistics</h3><p>Practical support for people relocating for work.</p></section>' +
      '<section class="svc-group"><h3>Mobility orientation</h3><p>Briefings to help travellers and new arrivals understand how life and business work in their destination.</p></section>',
    body_fr:
      '<p>Nous gérons le côté pratique du déplacement des personnes au-delà des frontières — de l’organisation des documents de visa aux arrangements de voyage et à l’installation — afin que professionnels, équipes et familles puissent se concentrer sur l’objet de leur déplacement.</p>' +
      '<section class="svc-group"><h3>Appui administratif aux demandes de visa</h3><p>Aider les demandeurs à préparer et organiser leurs documents de visa et à se préparer aux entretiens. Les décisions de visa relèvent exclusivement de l’ambassade concernée.</p></section>' +
      '<section class="svc-group"><h3>Coordination des voyages d’affaires</h3><p>Organiser les aspects pratiques des déplacements professionnels.</p></section>' +
      '<section class="svc-group"><h3>Logistique de relocation</h3><p>Un appui concret pour les personnes qui se relocalisent pour le travail.</p></section>' +
      '<section class="svc-group"><h3>Orientation à la mobilité</h3><p>Des briefings pour aider voyageurs et nouveaux arrivants à comprendre la vie et les affaires dans leur destination.</p></section>',
    sort_order: 3,
    is_published: true,
  },
  {
    slug: 'investment-diaspora-facilitation',
    icon_name: 'piggy-bank',
    title_en: 'Investment & Diaspora Facilitation',
    title_fr: 'Investissement et facilitation diaspora',
    cover_image_url: media(
      '2025/04/financial-analyst-analyzes-business-people-investment-consultant-analyzing-company-financial-report-1.jpg',
    ),
    excerpt_en:
      'Investment opportunity identification, diaspora business engagement and investor introductions — connecting capital with the right projects and partners.',
    excerpt_fr:
      'Identification d’opportunités d’investissement, mobilisation de la diaspora et mises en relation avec des investisseurs — pour connecter les capitaux aux bons projets et partenaires.',
    body_en:
      '<p>We connect investors, the diaspora and project owners — identifying opportunities that fit, engaging the African diaspora, and making the introductions that turn interest into investment.</p>' +
      '<section class="svc-group"><h3>Investment opportunity identification</h3><p>Identifying investment opportunities that match an investor’s interests and profile.</p></section>' +
      '<section class="svc-group"><h3>Diaspora business engagement</h3><p>Engaging the African diaspora in business and investment opportunities at home.</p></section>' +
      '<section class="svc-group"><h3>Investor introductions</h3><p>Introducing investors to project owners, partners and opportunities.</p></section>',
    body_fr:
      '<p>Nous connectons investisseurs, diaspora et porteurs de projets — en identifiant les opportunités adaptées, en mobilisant la diaspora africaine et en réalisant les introductions qui transforment l’intérêt en investissement.</p>' +
      '<section class="svc-group"><h3>Identification d’opportunités d’investissement</h3><p>Identifier des opportunités d’investissement correspondant aux intérêts et au profil d’un investisseur.</p></section>' +
      '<section class="svc-group"><h3>Mobilisation de la diaspora</h3><p>Impliquer la diaspora africaine dans les opportunités d’affaires et d’investissement dans son pays d’origine.</p></section>' +
      '<section class="svc-group"><h3>Mises en relation avec des investisseurs</h3><p>Présenter des investisseurs à des porteurs de projets, des partenaires et des opportunités.</p></section>',
    sort_order: 4,
    is_published: true,
  },
  {
    slug: 'trade-training-capacity-building',
    icon_name: 'graduation-cap',
    title_en: 'Trade Training & Capacity Building',
    title_fr: 'Formation commerciale et renforcement des capacités',
    cover_image_url: media(
      '2025/04/mature-business-coach-or-speaker-make-flip-chart-presentation-to-diverse-businesspeople-at-meeting.jpg',
    ),
    excerpt_en:
      'The Africa Trade Accelerator, export-readiness workshops and international business training — practical, expert-led capacity building to help you compete internationally.',
    excerpt_fr:
      'L’Africa Trade Accelerator, des ateliers de préparation à l’export et des formations au commerce international — un renforcement des capacités concret, animé par des experts, pour être compétitif à l’international.',
    body_en:
      '<p>We build the skills African businesses need to compete abroad — through our flagship Africa Trade Accelerator, hands-on export-readiness workshops, and practical international business training.</p>' +
      '<section class="svc-group"><h3>Africa Trade Accelerator</h3><p>ALA’s flagship initiative preparing African businesses to compete in international markets, particularly the United States.</p></section>' +
      '<section class="svc-group"><h3>Export-readiness workshops</h3><p>Practical workshops on what businesses need to export successfully.</p></section>' +
      '<section class="svc-group"><h3>International business training</h3><p>Training on international trade and doing business across borders.</p></section>',
    body_fr:
      '<p>Nous développons les compétences dont les entreprises africaines ont besoin pour être compétitives à l’étranger — à travers notre initiative phare, l’Africa Trade Accelerator, des ateliers pratiques de préparation à l’export et des formations concrètes au commerce international.</p>' +
      '<section class="svc-group"><h3>Africa Trade Accelerator</h3><p>L’initiative phare d’ALA qui prépare les entreprises africaines à être compétitives sur les marchés internationaux, en particulier aux États-Unis.</p></section>' +
      '<section class="svc-group"><h3>Ateliers de préparation à l’export</h3><p>Des ateliers pratiques sur ce dont les entreprises ont besoin pour exporter avec succès.</p></section>' +
      '<section class="svc-group"><h3>Formation au commerce international</h3><p>Des formations sur le commerce international et les affaires transfrontalières.</p></section>',
    sort_order: 5,
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

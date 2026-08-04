import type { ResourceConfig, ColumnConfig } from '../lib/fields';

/* ---- shared column renderers ---- */
const publishedCol: ColumnConfig = {
  key: 'is_published',
  label: 'Status',
  render: (r) =>
    (r as { is_published?: boolean }).is_published ? (
      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
        Published
      </span>
    ) : (
      <span className="rounded-full bg-ala-grey-200 px-2 py-0.5 text-xs font-medium text-ala-grey-500">
        Draft
      </span>
    ),
};

const thumb = (key: string): ColumnConfig => ({
  key,
  label: 'Image',
  render: (r) => {
    const src = (r as Record<string, string>)[key];
    return src ? (
      <img src={src} alt="" className="h-9 w-14 rounded object-cover" />
    ) : (
      <span className="text-ala-grey-500">—</span>
    );
  },
});

const publishField = {
  name: 'is_published',
  label: 'Published',
  type: 'boolean' as const,
  placeholder: 'Visible on the site',
};

/* ---- English/French field pair helper ---- */
const bilingual = (
  base: string,
  label: string,
  type: 'text' | 'textarea' | 'richtext' = 'text',
) => [
  { name: `${base}_en`, label: `${label} (EN)`, type, required: base.startsWith('title') || base.startsWith('question') || base.startsWith('label') },
  { name: `${base}_fr`, label: `${label} (FR)`, type },
];

export const resourceConfigs: Record<string, ResourceConfig> = {
  'hero-slides': {
    key: 'hero-slides',
    labelSingular: 'Hero Slide',
    labelPlural: 'Hero Slides',
    path: '/admin/hero-slides',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [thumb('image_url'), { key: 'title_en', label: 'Title' }, publishedCol],
    defaults: { is_published: true, sort_order: 0 },
    fields: [
      ...bilingual('eyebrow', 'Eyebrow'),
      ...bilingual('title', 'Title'),
      ...bilingual('subtitle', 'Subtitle', 'textarea'),
      { name: 'image_url', label: 'Background image', type: 'image', bucket: 'media', full: true },
      { name: 'cta_primary_label', label: 'Primary CTA label', type: 'text' },
      { name: 'cta_primary_url', label: 'Primary CTA URL', type: 'text' },
      { name: 'cta_secondary_label', label: 'Secondary CTA label', type: 'text' },
      { name: 'cta_secondary_url', label: 'Secondary CTA URL', type: 'text' },
      publishField,
    ],
  },

  pages: {
    key: 'pages',
    labelSingular: 'Page',
    labelPlural: 'Pages',
    path: '/admin/pages',
    defaultSort: 'title_en',
    columns: [{ key: 'title_en', label: 'Title' }, { key: 'slug', label: 'Slug' }, publishedCol],
    defaults: { is_published: true },
    fields: [
      ...bilingual('title', 'Title'),
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title_en', help: 'URL path, e.g. "about"' },
      ...bilingual('body', 'Body', 'richtext'),
      { name: 'hero_image_url', label: 'Hero image', type: 'image', bucket: 'media', full: true },
      { name: 'seo_title', label: 'SEO title', type: 'text' },
      { name: 'seo_description', label: 'SEO description', type: 'textarea' },
      publishField,
    ],
  },

  services: {
    key: 'services',
    labelSingular: 'Service',
    labelPlural: 'Services',
    path: '/admin/services',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [{ key: 'title_en', label: 'Title' }, { key: 'slug', label: 'Slug' }, publishedCol],
    defaults: { is_published: true, sort_order: 0 },
    fields: [
      ...bilingual('title', 'Title'),
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title_en' },
      { name: 'icon_name', label: 'Icon', type: 'icon', full: true },
      ...bilingual('excerpt', 'Excerpt', 'textarea'),
      ...bilingual('body', 'Body', 'richtext'),
      { name: 'cover_image_url', label: 'Cover image', type: 'image', bucket: 'media', full: true },
      publishField,
    ],
  },

  methodology: {
    key: 'methodology',
    labelSingular: 'Pillar',
    labelPlural: 'Methodology',
    path: '/admin/methodology',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [{ key: 'title_en', label: 'Title' }],
    fields: [...bilingual('title', 'Title'), ...bilingual('description', 'Description', 'textarea')],
  },

  statistics: {
    key: 'statistics',
    labelSingular: 'Statistic',
    labelPlural: 'Statistics',
    path: '/admin/statistics',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [
      { key: 'label_en', label: 'Label' },
      { key: 'value', label: 'Value' },
      { key: 'suffix', label: 'Suffix' },
    ],
    defaults: { value: 0 },
    fields: [
      ...bilingual('label', 'Label'),
      { name: 'value', label: 'Value', type: 'number', required: true },
      { name: 'suffix', label: 'Suffix', type: 'text', placeholder: '+ or %' },
    ],
  },

  partners: {
    key: 'partners',
    labelSingular: 'Partner',
    labelPlural: 'Partners',
    path: '/admin/partners',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [thumb('logo_url'), { key: 'name', label: 'Name' }, publishedCol],
    defaults: { is_published: true },
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'logo_url', label: 'Logo', type: 'image', bucket: 'logos', full: true },
      { name: 'website_url', label: 'Website URL', type: 'text' },
      publishField,
    ],
  },

  team: {
    key: 'team',
    labelSingular: 'Team Member',
    labelPlural: 'Team',
    path: '/admin/team',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [thumb('photo_url'), { key: 'full_name', label: 'Name' }, { key: 'role_en', label: 'Role' }, publishedCol],
    defaults: { is_published: true },
    fields: [
      { name: 'full_name', label: 'Full name', type: 'text', required: true },
      ...bilingual('role', 'Role'),
      ...bilingual('bio', 'Bio', 'textarea'),
      { name: 'photo_url', label: 'Photo', type: 'image', bucket: 'media', full: true },
      { name: 'linkedin_url', label: 'LinkedIn URL', type: 'text' },
      publishField,
    ],
  },

  timeline: {
    key: 'timeline',
    labelSingular: 'Timeline Entry',
    labelPlural: 'Timeline',
    path: '/admin/timeline',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [{ key: 'year', label: 'Year' }, { key: 'title_en', label: 'Title' }],
    fields: [
      { name: 'year', label: 'Year', type: 'text', required: true },
      ...bilingual('title', 'Title'),
      ...bilingual('description', 'Description', 'textarea'),
    ],
  },

  events: {
    key: 'events',
    labelSingular: 'Event',
    labelPlural: 'Events',
    path: '/admin/events',
    defaultSort: 'start_date',
    columns: [
      thumb('poster_url'),
      { key: 'title_en', label: 'Title' },
      {
        key: 'status',
        label: 'Status',
        render: (r) => {
          const s = (r as { status?: string }).status;
          return (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                s === 'upcoming' ? 'bg-emerald-100 text-emerald-700' : 'bg-ala-grey-200 text-ala-grey-500'
              }`}
            >
              {s}
            </span>
          );
        },
      },
      {
        key: 'is_featured',
        label: 'Featured',
        render: (r) => ((r as { is_featured?: boolean }).is_featured ? '★' : '—'),
      },
      publishedCol,
    ],
    defaults: {
      status: 'upcoming',
      is_featured: false,
      is_published: true,
      registration_enabled: true,
      speakers: [],
    },
    fields: [
      ...bilingual('title', 'Title'),
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title_en' },
      ...bilingual('description', 'Short description', 'textarea'),
      ...bilingual('body', 'Full body', 'richtext'),
      { name: 'poster_url', label: 'Poster', type: 'image', bucket: 'events', full: true },
      { name: 'start_date', label: 'Start date', type: 'datetime' },
      { name: 'end_date', label: 'End date', type: 'datetime' },
      { name: 'event_time', label: 'Time (display)', type: 'text', placeholder: 'e.g. 09:00 – 17:00' },
      { name: 'location', label: 'Location (short)', type: 'text' },
      { name: 'venue_name', label: 'Venue name', type: 'text' },
      { name: 'venue_address', label: 'Venue address', type: 'text' },
      { name: 'google_maps_url', label: 'Google Maps URL', type: 'text' },
      { name: 'organizer', label: 'Organizer', type: 'text' },
      ...bilingual('agenda', 'Agenda', 'richtext'),
      { name: 'speakers', label: 'Speakers', type: 'speakers', full: true },
      {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: [
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'past', label: 'Past' },
        ],
      },
      { name: 'is_featured', label: 'Featured', type: 'boolean', placeholder: 'Feature on home page' },
      publishField,
      // Registration
      {
        name: 'registration_enabled',
        label: 'Registration open',
        type: 'boolean',
        placeholder: 'Accept registrations on the site',
      },
      { name: 'registration_deadline', label: 'Registration deadline', type: 'datetime' },
      { name: 'capacity', label: 'Capacity (seats)', type: 'number', help: 'Leave blank for unlimited' },
      { name: 'registration_url', label: 'External registration URL', type: 'text', help: 'Optional — used only if on-site registration is off' },
      {
        name: 'regform',
        label: 'Registration form builder',
        type: 'regform',
        full: true,
        help: 'Custom questions shown on the registration form',
      },
      { name: 'gallery', label: 'Gallery', type: 'gallery', full: true, help: 'Add photos (past events)' },
      {
        name: 'video_urls',
        label: 'Video URLs (YouTube)',
        type: 'textarea',
        full: true,
        help: 'One YouTube link per line — shown on the past-event page and the Gallery',
      },
    ],
  },

  faqs: {
    key: 'faqs',
    labelSingular: 'FAQ',
    labelPlural: 'FAQs',
    path: '/admin/faqs',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [{ key: 'question_en', label: 'Question' }, publishedCol],
    defaults: { is_published: true },
    fields: [
      ...bilingual('question', 'Question'),
      ...bilingual('answer', 'Answer', 'textarea'),
      publishField,
    ],
  },

  countries: {
    key: 'countries',
    labelSingular: 'Country',
    labelPlural: 'Countries',
    path: '/admin/countries',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [
      { key: 'flag_emoji', label: 'Flag' },
      { key: 'name_en', label: 'Name' },
      { key: 'slug', label: 'Slug' },
      publishedCol,
    ],
    defaults: { is_published: true, sort_order: 0, faqs: [] },
    fields: [
      { name: 'name_en', label: 'Name (EN)', type: 'text', required: true },
      { name: 'name_fr', label: 'Name (FR)', type: 'text' },
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'name_en' },
      { name: 'flag_emoji', label: 'Flag emoji', type: 'text', placeholder: '🇺🇸' },
      { name: 'hero_image_url', label: 'Hero image', type: 'image', bucket: 'media', full: true },
      ...bilingual('summary', 'Summary', 'textarea'),
      ...bilingual('overview', 'Overview', 'richtext'),
      ...bilingual('immigration', 'Immigration options', 'richtext'),
      ...bilingual('study', 'Study opportunities', 'richtext'),
      ...bilingual('living_costs', 'Living costs', 'richtext'),
      ...bilingual('visa_requirements', 'Visa requirements', 'richtext'),
      ...bilingual('processing_times', 'Processing times', 'richtext'),
      { name: 'faqs', label: 'FAQs', type: 'faqlist', full: true },
      publishField,
    ],
  },

  news: {
    key: 'news',
    labelSingular: 'Article',
    labelPlural: 'News',
    path: '/admin/news',
    defaultSort: 'published_at',
    columns: [
      thumb('cover_image_url'),
      { key: 'title_en', label: 'Title' },
      { key: 'category', label: 'Category' },
      publishedCol,
    ],
    defaults: { is_published: true, is_featured: false, category: 'announcements' },
    fields: [
      ...bilingual('title', 'Title'),
      { name: 'slug', label: 'Slug', type: 'slug', slugFrom: 'title_en' },
      {
        name: 'category',
        label: 'Category',
        type: 'select',
        options: [
          { value: 'immigration_news', label: 'Immigration News' },
          { value: 'visa_updates', label: 'Visa Updates' },
          { value: 'scholarships', label: 'Scholarship Opportunities' },
          { value: 'study_abroad', label: 'Study Abroad' },
          { value: 'business_immigration', label: 'Business Immigration' },
          { value: 'announcements', label: 'ALA Announcements' },
          { value: 'event_news', label: 'Event News' },
          { value: 'success_stories', label: 'Success Stories' },
        ],
      },
      ...bilingual('summary', 'Summary', 'textarea'),
      ...bilingual('body', 'Body', 'richtext'),
      { name: 'cover_image_url', label: 'Cover image', type: 'image', bucket: 'media', full: true },
      { name: 'author', label: 'Author', type: 'text' },
      { name: 'published_at', label: 'Publish date', type: 'datetime' },
      { name: 'is_featured', label: 'Featured', type: 'boolean', placeholder: 'Highlight this article' },
      publishField,
    ],
  },

  testimonials: {
    key: 'testimonials',
    labelSingular: 'Testimonial',
    labelPlural: 'Testimonials',
    path: '/admin/testimonials',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [
      thumb('photo_url'),
      { key: 'author_name', label: 'Author' },
      { key: 'country', label: 'Country' },
      publishedCol,
    ],
    defaults: { is_published: true, is_featured: false, sort_order: 0 },
    fields: [
      { name: 'author_name', label: 'Author name', type: 'text', required: true },
      ...bilingual('author_role', 'Role / title'),
      { name: 'country', label: 'Country', type: 'text' },
      { name: 'service_id', label: 'Related service', type: 'serviceselect' },
      { name: 'quote_en', label: 'Quote (EN)', type: 'textarea', required: true },
      { name: 'quote_fr', label: 'Quote (FR)', type: 'textarea' },
      { name: 'photo_url', label: 'Photo', type: 'image', bucket: 'media', full: true },
      { name: 'video_url', label: 'Video URL', type: 'text' },
      { name: 'rating', label: 'Rating (1–5)', type: 'number' },
      { name: 'is_featured', label: 'Featured', type: 'boolean', placeholder: 'Show on home page' },
      publishField,
    ],
  },

  announcements: {
    key: 'announcements',
    labelSingular: 'Announcement',
    labelPlural: 'Announcements',
    path: '/admin/announcements',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [
      { key: 'message_en', label: 'Message' },
      { key: 'style', label: 'Style' },
      publishedCol,
    ],
    defaults: { is_published: true, sort_order: 0, style: 'info', dismissible: true },
    fields: [
      { name: 'message_en', label: 'Message (EN)', type: 'text', required: true, full: true },
      { name: 'message_fr', label: 'Message (FR)', type: 'text', full: true },
      {
        name: 'style',
        label: 'Style',
        type: 'select',
        options: [
          { value: 'info', label: 'Info (navy)' },
          { value: 'success', label: 'Success (green)' },
          { value: 'warning', label: 'Warning (amber)' },
          { value: 'promo', label: 'Promo (red/gold)' },
        ],
      },
      { name: 'dismissible', label: 'Dismissible', type: 'boolean', placeholder: 'Visitors can close it' },
      { name: 'link_url', label: 'Link URL', type: 'text' },
      { name: 'link_label_en', label: 'Link label (EN)', type: 'text' },
      { name: 'link_label_fr', label: 'Link label (FR)', type: 'text' },
      { name: 'starts_at', label: 'Start (optional)', type: 'datetime' },
      { name: 'ends_at', label: 'End (optional)', type: 'datetime' },
      publishField,
    ],
  },

  popups: {
    key: 'popups',
    labelSingular: 'Popup',
    labelPlural: 'Popups',
    path: '/admin/popups',
    orderable: true,
    defaultSort: 'sort_order',
    columns: [
      { key: 'name', label: 'Name' },
      { key: 'trigger', label: 'Trigger' },
      { key: 'frequency', label: 'Frequency' },
      publishedCol,
    ],
    defaults: {
      is_published: true,
      sort_order: 0,
      trigger: 'delay',
      delay_seconds: 5,
      scroll_percent: 40,
      frequency: 'session',
      audience: 'all',
      device: 'all',
      show_newsletter: false,
    },
    fields: [
      { name: 'name', label: 'Internal name', type: 'text', required: true, help: 'Admin reference only' },
      ...bilingual('title', 'Title'),
      ...bilingual('body', 'Body', 'textarea'),
      { name: 'image_url', label: 'Image', type: 'image', bucket: 'media', full: true },
      { name: 'cta_label_en', label: 'CTA label (EN)', type: 'text' },
      { name: 'cta_label_fr', label: 'CTA label (FR)', type: 'text' },
      { name: 'cta_url', label: 'CTA URL', type: 'text' },
      {
        name: 'trigger',
        label: 'Trigger',
        type: 'select',
        options: [
          { value: 'load', label: 'On page load' },
          { value: 'delay', label: 'After a delay' },
          { value: 'scroll', label: 'On scroll' },
          { value: 'exit_intent', label: 'On exit intent' },
        ],
      },
      { name: 'delay_seconds', label: 'Delay (seconds)', type: 'number', help: 'For "After a delay"' },
      { name: 'scroll_percent', label: 'Scroll %', type: 'number', help: 'For "On scroll"' },
      {
        name: 'frequency',
        label: 'Frequency',
        type: 'select',
        options: [
          { value: 'once', label: 'Once per visitor' },
          { value: 'session', label: 'Once per session' },
          { value: 'always', label: 'Every page view' },
        ],
      },
      {
        name: 'audience',
        label: 'Audience',
        type: 'select',
        options: [
          { value: 'all', label: 'Everyone' },
          { value: 'first_time', label: 'First-time visitors' },
          { value: 'returning', label: 'Returning visitors' },
        ],
      },
      {
        name: 'device',
        label: 'Device',
        type: 'select',
        options: [
          { value: 'all', label: 'All devices' },
          { value: 'mobile', label: 'Mobile only' },
          { value: 'desktop', label: 'Desktop only' },
        ],
      },
      { name: 'target_paths', label: 'Target pages', type: 'text', full: true, help: 'Comma-separated path prefixes, e.g. /countries,/events. Blank = all pages.' },
      { name: 'countdown_to', label: 'Countdown to (optional)', type: 'datetime' },
      { name: 'show_newsletter', label: 'Show newsletter signup', type: 'boolean' },
      { name: 'starts_at', label: 'Start (optional)', type: 'datetime' },
      { name: 'ends_at', label: 'End (optional)', type: 'datetime' },
      publishField,
    ],
  },

  'availability-slots': {
    key: 'availability-slots',
    labelSingular: 'Availability Slot',
    labelPlural: 'Availability',
    path: '/admin/availability-slots',
    defaultSort: 'starts_at',
    columns: [
      {
        key: 'starts_at',
        label: 'Starts',
        render: (r) => new Date((r as { starts_at: string }).starts_at).toLocaleString(),
      },
      { key: 'duration_minutes', label: 'Mins' },
      { key: 'mode', label: 'Mode' },
      {
        key: 'is_booked',
        label: 'Booked',
        render: (r) =>
          (r as { is_booked?: boolean }).is_booked ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">Booked</span>
          ) : (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">Open</span>
          ),
      },
    ],
    defaults: { duration_minutes: 30, mode: 'both', is_active: true },
    fields: [
      { name: 'starts_at', label: 'Start date & time', type: 'datetime', required: true },
      { name: 'duration_minutes', label: 'Duration (minutes)', type: 'number' },
      {
        name: 'mode',
        label: 'Meeting type',
        type: 'select',
        options: [
          { value: 'both', label: 'Online or in-person' },
          { value: 'online', label: 'Online only' },
          { value: 'physical', label: 'In-person only' },
        ],
      },
      { name: 'consultant_id', label: 'Consultant', type: 'teamselect' },
      { name: 'is_active', label: 'Active', type: 'boolean', placeholder: 'Available for booking' },
    ],
  },
};

import { useQuery } from '@tanstack/react-query';
import { api } from './api';
import type {
  HeroSlide,
  Service,
  Statistic,
  MethodologyPillar,
  Partner,
  TeamMember,
  TimelineEntry,
  Faq,
  EventRow,
  EventWithGallery,
  EventRegistrationForm,
  Page,
  Country,
  NewsArticle,
  Testimonial,
  Announcement,
  Popup,
} from '@ala/types';

type SiteSettings = Record<string, Record<string, unknown>>;

const list =
  <T>(path: string) =>
  () =>
    api.get<T[]>(path).then((r) => r.data);

export const useSiteSettings = () =>
  useQuery({ queryKey: ['settings'], queryFn: () => api.get<SiteSettings>('/settings').then((r) => r.data) });

export const useHeroSlides = () =>
  useQuery({ queryKey: ['hero-slides'], queryFn: list<HeroSlide>('/hero-slides') });

export const useServices = () =>
  useQuery({ queryKey: ['services'], queryFn: list<Service>('/services') });

export const useService = (slug: string) =>
  useQuery({
    queryKey: ['services', slug],
    queryFn: () => api.get<Service>(`/services/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

export const useStatistics = () =>
  useQuery({ queryKey: ['statistics'], queryFn: list<Statistic>('/statistics') });

export const useMethodology = () =>
  useQuery({ queryKey: ['methodology'], queryFn: list<MethodologyPillar>('/methodology') });

export const usePartners = () =>
  useQuery({ queryKey: ['partners'], queryFn: list<Partner>('/partners') });

export const useTeam = () =>
  useQuery({ queryKey: ['team'], queryFn: list<TeamMember>('/team') });

export const useTimeline = () =>
  useQuery({ queryKey: ['timeline'], queryFn: list<TimelineEntry>('/timeline') });

export const useFaqs = () => useQuery({ queryKey: ['faqs'], queryFn: list<Faq>('/faqs') });

export const usePage = (slug: string) =>
  useQuery({
    queryKey: ['pages', slug],
    queryFn: () => api.get<Page>(`/pages/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

export const useEvents = (status?: 'upcoming' | 'past') =>
  useQuery({
    queryKey: ['events', status ?? 'all'],
    queryFn: () =>
      api.get<EventRow[]>(`/events${status ? `?status=${status}` : ''}`).then((r) => r.data),
  });

export const useEvent = (slug: string) =>
  useQuery({
    queryKey: ['events', 'detail', slug],
    queryFn: () => api.get<EventWithGallery>(`/events/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

export const useFeaturedEvent = () =>
  useQuery({
    queryKey: ['events', 'featured'],
    queryFn: () => api.get<EventRow | null>('/events/featured/next').then((r) => r.data),
  });

export interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string | null;
  event_slug: string | null;
  event_title: string | null;
}
export const useGallery = () =>
  useQuery({
    queryKey: ['gallery'],
    queryFn: () => api.get<GalleryPhoto[]>('/events/gallery/all').then((r) => r.data),
  });

export const useEventRegistrationForm = (slug: string) =>
  useQuery({
    queryKey: ['events', slug, 'registration-form'],
    queryFn: () =>
      api
        .get<EventRegistrationForm>(`/events/${slug}/registration-form`)
        .then((r) => r.data),
    enabled: !!slug,
  });

export const useCountries = () =>
  useQuery({ queryKey: ['countries'], queryFn: list<Country>('/countries') });

export const useCountry = (slug: string) =>
  useQuery({
    queryKey: ['countries', slug],
    queryFn: () => api.get<Country>(`/countries/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

export const useNews = () =>
  useQuery({ queryKey: ['news'], queryFn: () => api.get<NewsArticle[]>('/news?pageSize=100').then((r) => r.data) });

export const useNewsArticle = (slug: string) =>
  useQuery({
    queryKey: ['news', slug],
    queryFn: () => api.get<NewsArticle>(`/news/${slug}`).then((r) => r.data),
    enabled: !!slug,
  });

export const useTestimonials = () =>
  useQuery({ queryKey: ['testimonials'], queryFn: list<Testimonial>('/testimonials') });

export const useAnnouncements = () =>
  useQuery({ queryKey: ['announcements'], queryFn: list<Announcement>('/announcements') });

export const usePopups = () =>
  useQuery({ queryKey: ['popups'], queryFn: list<Popup>('/popups') });

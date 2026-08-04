import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Spinner } from '@/components/ui/Skeleton';

const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Services = lazy(() => import('@/pages/Services'));
const ServiceDetail = lazy(() => import('@/pages/ServiceDetail'));
const Ata = lazy(() => import('@/pages/Ata'));
const Events = lazy(() => import('@/pages/Events'));
const EventDetail = lazy(() => import('@/pages/EventDetail'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const Countries = lazy(() => import('@/pages/Countries'));
const CountryDetail = lazy(() => import('@/pages/CountryDetail'));
const News = lazy(() => import('@/pages/News'));
const NewsDetail = lazy(() => import('@/pages/NewsDetail'));
const Testimonials = lazy(() => import('@/pages/Testimonials'));
const Contact = lazy(() => import('@/pages/Contact'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const AdminApp = lazy(() => import('@/admin/AdminApp'));
const PortalApp = lazy(() => import('@/portal/PortalApp'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-ala-navy">
      <Spinner className="h-8 w-8" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        {/* Admin tree — own layout, auth, and toasts */}
        <Route path="/admin/*" element={<AdminApp />} />

        {/* Client portal — own layout and auth */}
        <Route path="/portal/*" element={<PortalApp />} />

        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="services" element={<Services />} />
          <Route path="services/:slug" element={<ServiceDetail />} />
          <Route path="ata" element={<Ata />} />
          <Route path="events" element={<Events />} />
          <Route path="events/:slug" element={<EventDetail />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="countries" element={<Countries />} />
          <Route path="countries/:slug" element={<CountryDetail />} />
          <Route path="news" element={<News />} />
          <Route path="news/:slug" element={<NewsDetail />} />
          <Route path="testimonials" element={<Testimonials />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

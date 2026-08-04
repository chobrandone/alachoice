import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { ScrollToTop } from '@/components/ScrollToTop';
import { AnnouncementBar } from '@/components/AnnouncementBar';
import { PopupManager } from '@/components/PopupManager';
import { FloatingContact } from '@/components/FloatingContact';

/** Public site shell: announcement bar, fixed header, routed content, footer, popups. */
export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <AnnouncementBar />
      <Header />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-btn focus:bg-white focus:px-4 focus:py-2 focus:text-ala-navy focus:shadow-soft"
      >
        Skip to content
      </a>
      {/* padding-top follows the announcement-bar height so the fixed header/content clear it */}
      <main id="main" className="flex-1" style={{ paddingTop: 'var(--ala-banner-h, 0px)' }}>
        <Outlet />
      </main>
      <Footer />
      <PopupManager />
      <FloatingContact />
    </div>
  );
}

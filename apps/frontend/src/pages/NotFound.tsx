import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Seo } from '@/components/Seo';
import { Container } from '@/components/ui/primitives';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <>
      <Seo title="404" />
      <div className="flex min-h-[70vh] items-center bg-navy-gradient text-white">
        <Container className="text-center">
          <p className="font-heading text-7xl font-bold text-ala-gold md:text-9xl">404</p>
          <h1 className="mt-4 text-h2 text-white">{t('notFound.title')}</h1>
          <p className="mx-auto mt-3 max-w-md text-white/75">{t('notFound.body')}</p>
          <Button asChild className="mt-8">
            <Link to="/">{t('common.backHome')}</Link>
          </Button>
        </Container>
      </div>
    </>
  );
}

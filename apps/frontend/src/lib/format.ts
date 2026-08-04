/** Locale-aware date formatting for CMS timestamps. */
export function formatDate(iso: string | null | undefined, lang = 'en'): string {
  if (!iso) return '';
  const locale = lang.startsWith('fr') ? 'fr-FR' : 'en-US';
  try {
    return new Date(iso).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

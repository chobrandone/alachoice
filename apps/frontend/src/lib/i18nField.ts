import { useTranslation } from 'react-i18next';

/**
 * Picks the localized value from a CMS row that stores `<field>_en` / `<field>_fr`.
 * Falls back to EN when the FR value is empty.
 */
export function localizedField<T extends Record<string, unknown>>(
  row: T | null | undefined,
  field: string,
  lang: string,
): string {
  if (!row) return '';
  const key = lang.startsWith('fr') ? `${field}_fr` : `${field}_en`;
  const val = row[key];
  // Fall back to EN when the localized value is missing OR blank — CMS rows
  // often store an empty string for an untranslated field.
  const chosen = typeof val === 'string' && val.trim() !== '' ? val : row[`${field}_en`];
  return typeof chosen === 'string' ? chosen : '';
}

/** Hook variant bound to the active language. */
export function useLocalized() {
  const { i18n } = useTranslation();
  const lang = i18n.language;
  return <T extends Record<string, unknown>>(row: T | null | undefined, field: string) =>
    localizedField(row, field, lang);
}

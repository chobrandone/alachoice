import { describe, it, expect } from 'vitest';
import { localizedField } from './i18nField';

const row = {
  title_en: 'Business Development',
  title_fr: 'Développement des affaires',
  excerpt_en: 'English only',
  excerpt_fr: '',
};

describe('localizedField', () => {
  it('returns the English value for an en language', () => {
    expect(localizedField(row, 'title', 'en')).toBe('Business Development');
  });

  it('returns the French value for an fr language', () => {
    expect(localizedField(row, 'title', 'fr')).toBe('Développement des affaires');
  });

  it('handles locale codes like fr-FR', () => {
    expect(localizedField(row, 'title', 'fr-FR')).toBe('Développement des affaires');
  });

  it('falls back to English when the French value is empty', () => {
    expect(localizedField(row, 'excerpt', 'fr')).toBe('English only');
  });

  it('returns an empty string for a null row', () => {
    expect(localizedField(null, 'title', 'en')).toBe('');
  });
});

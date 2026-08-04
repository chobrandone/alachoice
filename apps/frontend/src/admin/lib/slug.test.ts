import { describe, it, expect } from 'vitest';
import { slugify } from './slug';

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Business Development')).toBe('business-development');
  });

  it('strips accents', () => {
    expect(slugify('Développement des affaires')).toBe('developpement-des-affaires');
  });

  it('collapses non-alphanumerics and trims leading/trailing hyphens', () => {
    expect(slugify('  Hello, World!!  ')).toBe('hello-world');
  });

  it('handles an already-clean slug', () => {
    expect(slugify('u-s-africa-summit-2026')).toBe('u-s-africa-summit-2026');
  });

  it('returns an empty string for punctuation-only input', () => {
    expect(slugify('!!!')).toBe('');
  });
});

import type { ReactNode } from 'react';

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'boolean'
  | 'select'
  | 'image'
  | 'date'
  | 'datetime'
  | 'slug'
  | 'icon'
  | 'gallery'
  | 'regform'
  | 'speakers'
  | 'faqlist'
  | 'serviceselect'
  | 'teamselect';

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  /** For select fields. */
  options?: { value: string; label: string }[];
  /** Bucket for image uploads. */
  bucket?: 'media' | 'logos' | 'events' | 'documents';
  /** Full-width in the two-column grid. */
  full?: boolean;
  /** Auto-derive slug from this field when empty (slug fields only). */
  slugFrom?: string;
}

export interface ColumnConfig<T = Record<string, unknown>> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  /** Sortable via the API. */
  sortable?: boolean;
}

export interface ResourceConfig {
  key: string;
  /** Nav + page label (singular / plural). */
  labelSingular: string;
  labelPlural: string;
  /** Admin API path, e.g. '/admin/services'. */
  path: string;
  columns: ColumnConfig[];
  fields: FieldConfig[];
  orderable?: boolean;
  /** Default values for the create form. */
  defaults?: Record<string, unknown>;
  /** Column the table sorts by initially. */
  defaultSort?: string;
}

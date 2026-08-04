import type { ApplicationType } from '@ala/types';

export interface DetailField {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'select';
  options?: string[];
}

/** Step-2 detail fields, per application type. */
export const DETAIL_FIELDS: Record<ApplicationType, DetailField[]> = {
  study_abroad: [
    { key: 'destination', label: 'Destination country', type: 'text' },
    { key: 'level', label: 'Study level', type: 'select', options: ['Undergraduate', 'Master\'s', 'PhD', 'Language program'] },
    { key: 'field', label: 'Field of study', type: 'text' },
    { key: 'intake', label: 'Preferred intake', type: 'text' },
    { key: 'budget', label: 'Annual budget (USD)', type: 'select', options: ['< $10k', '$10k–$25k', '$25k–$50k', '> $50k'] },
  ],
  immigration: [
    { key: 'destination', label: 'Destination country', type: 'text' },
    { key: 'visa_type', label: 'Visa type', type: 'select', options: ['Work visa', 'Permanent residency', 'Family reunification', 'Visitor visa'] },
    { key: 'current_status', label: 'Current status / occupation', type: 'text' },
    { key: 'notes', label: 'Anything else we should know?', type: 'textarea' },
  ],
  business: [
    { key: 'sector', label: 'Business sector', type: 'text' },
    { key: 'destination', label: 'Target market', type: 'text' },
    { key: 'investment', label: 'Investment range', type: 'select', options: ['< $50k', '$50k–$250k', '$250k–$1M', '> $1M'] },
    { key: 'summary', label: 'Business summary', type: 'textarea' },
  ],
  consultation: [
    { key: 'topic', label: 'Consultation topic', type: 'text' },
    { key: 'preferred_date', label: 'Preferred date', type: 'text' },
    { key: 'details', label: 'What would you like to discuss?', type: 'textarea' },
  ],
  partnership: [
    { key: 'organization', label: 'Organization name', type: 'text' },
    { key: 'role', label: 'Your role', type: 'text' },
    { key: 'proposal', label: 'Proposal summary', type: 'textarea' },
  ],
};

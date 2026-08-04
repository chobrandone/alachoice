import { useMutation } from '@tanstack/react-query';
import { api } from './api';
import type {
  InquiryInput,
  NewsletterInput,
  QuoteRequestInput,
  EventRegistrationInput,
} from '@ala/types';

export interface RegistrationResult {
  registration_ref: string;
  status: string;
}

export const useSubmitInquiry = () =>
  useMutation({ mutationFn: (body: InquiryInput) => api.post('/inquiries', body) });

export const useSubscribeNewsletter = () =>
  useMutation({ mutationFn: (body: NewsletterInput) => api.post('/newsletter', body) });

export const useSubmitQuote = () =>
  useMutation({ mutationFn: (body: QuoteRequestInput) => api.post('/quote-requests', body) });

export const useRegisterForEvent = (slug: string) =>
  useMutation({
    mutationFn: (body: EventRegistrationInput) =>
      api.post<RegistrationResult>(`/events/${slug}/register`, body).then((r) => r.data),
  });

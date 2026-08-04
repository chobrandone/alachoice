import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type {
  Application,
  ApplicationCreateInput,
  ApplicationUpdateInput,
  ClientDocument,
  ClientProfileUpdate,
  SessionClient,
  Appointment,
  AvailabilitySlot,
  AppointmentBookInput,
} from '@ala/types';

/** Slot with the joined consultant name. */
export type OpenSlot = AvailabilitySlot & { consultant?: { full_name?: string } | null };
/** Appointment with joined service/consultant names. */
export type PortalAppointment = Appointment & {
  service?: { title_en?: string } | null;
  consultant?: { full_name?: string } | null;
};

const opt = { portalAuth: true } as const;

/* ---- Applications ---- */
export const useApplications = () =>
  useQuery({
    queryKey: ['portal', 'applications'],
    queryFn: () => api.get<Application[]>('/portal/applications', opt).then((r) => r.data),
  });

export const useApplication = (id: string | undefined) =>
  useQuery({
    queryKey: ['portal', 'applications', id],
    queryFn: () => api.get<Application>(`/portal/applications/${id}`, opt).then((r) => r.data),
    enabled: !!id,
  });

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: ApplicationCreateInput) =>
      api.post<Application>('/portal/applications', body, opt).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'applications'] }),
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: ApplicationUpdateInput }) =>
      api.patch<Application>(`/portal/applications/${id}`, body, opt).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'applications'] }),
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/portal/applications/${id}`, opt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'applications'] }),
  });
}

export function useSignApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, signature, signed_name }: { id: string; signature: string; signed_name: string }) =>
      api.post<Application>(`/portal/applications/${id}/sign`, { signature, signed_name }, opt).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'applications'] }),
  });
}

/* ---- Documents ---- */
export const useDocuments = () =>
  useQuery({
    queryKey: ['portal', 'documents'],
    queryFn: () => api.get<ClientDocument[]>('/portal/documents', opt).then((r) => r.data),
  });

export function useUploadDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (form: FormData) =>
      api.post<ClientDocument>('/portal/documents', form, opt).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'documents'] }),
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/portal/documents/${id}`, opt),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['portal', 'documents'] }),
  });
}

/* ---- Appointments ---- */
export const useOpenSlots = () =>
  useQuery({
    queryKey: ['portal', 'slots'],
    queryFn: () => api.get<OpenSlot[]>('/portal/slots', opt).then((r) => r.data),
  });

export const useAppointments = () =>
  useQuery({
    queryKey: ['portal', 'appointments'],
    queryFn: () => api.get<PortalAppointment[]>('/portal/appointments', opt).then((r) => r.data),
  });

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: AppointmentBookInput) =>
      api.post<Appointment>('/portal/appointments', body, opt).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['portal', 'slots'] });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<Appointment>(`/portal/appointments/${id}/cancel`, undefined, opt).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portal', 'appointments'] });
      qc.invalidateQueries({ queryKey: ['portal', 'slots'] });
    },
  });
}

/* ---- Profile ---- */
export function useUpdateProfile() {
  return useMutation({
    mutationFn: (body: ClientProfileUpdate) =>
      api.patch<SessionClient>('/portal/profile', body, opt).then((r) => r.data),
  });
}

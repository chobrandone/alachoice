import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type ApiMeta } from '@/lib/api';

export interface ListResult<T> {
  data: T[];
  meta?: ApiMeta;
}

export interface ListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

function toQuery(params: ListParams): string {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.search) q.set('search', params.search);
  if (params.sort) q.set('sort', params.sort);
  if (params.order) q.set('order', params.order);
  const s = q.toString();
  return s ? `?${s}` : '';
}

/** Admin list with pagination/search. `path` is the admin resource path e.g. '/admin/services'. */
export function useAdminList<T>(path: string, params: ListParams = {}) {
  return useQuery({
    queryKey: [path, params],
    queryFn: async (): Promise<ListResult<T>> => {
      const r = await api.get<T[]>(`${path}${toQuery(params)}`, { auth: true });
      return { data: r.data, meta: r.meta };
    },
  });
}

export function useAdminItem<T>(path: string, id: string | undefined) {
  return useQuery({
    queryKey: [path, 'item', id],
    queryFn: () => api.get<T>(`${path}/${id}`, { auth: true }).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreate<T>(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<T>) => api.post<T>(path, body, { auth: true }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [path] }),
  });
}

export function useUpdate<T>(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<T> }) =>
      api.patch<T>(`${path}/${id}`, body, { auth: true }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: [path] }),
  });
}

export function useRemove(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`${path}/${id}`, { auth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [path] }),
  });
}

export function useReorder(path: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: { id: string; sort_order: number }[]) =>
      api.patch(`${path}/reorder`, { items }, { auth: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [path] }),
  });
}

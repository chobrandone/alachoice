import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ApiError } from '@/lib/api';
import type { ResourceConfig } from '../lib/fields';
import {
  useAdminList,
  useCreate,
  useUpdate,
  useRemove,
  useReorder,
} from '../lib/crud';
import { DataTable } from './DataTable';
import { Drawer } from './Drawer';
import { ResourceForm } from './ResourceForm';
import { ConfirmDialog } from './ConfirmDialog';
import { useToast } from './Toast';

type Row = { id: string } & Record<string, unknown>;

export function ResourceModule({ config }: { config: ResourceConfig }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Row | null | undefined>(undefined); // undefined=closed, null=create
  const [deleting, setDeleting] = useState<Row | null>(null);

  const list = useAdminList<Row>(config.path, {
    page,
    pageSize: 20,
    search: search || undefined,
    sort: config.defaultSort,
  });
  const create = useCreate<Row>(config.path);
  const update = useUpdate<Row>(config.path);
  const remove = useRemove(config.path);
  const reorder = useReorder(config.path);

  const rows = list.data?.data ?? [];
  const isOpen = editing !== undefined;

  const buildInitial = (row: Row | null): Record<string, unknown> => {
    if (row) return { ...row };
    const init: Record<string, unknown> = { ...(config.defaults ?? {}) };
    for (const f of config.fields) if (!(f.name in init)) init[f.name] = f.type === 'boolean' ? false : '';
    return init;
  };

  const onSubmit = (values: Record<string, unknown>) => {
    // Strip empty strings for optional fields so they store as null.
    const payload: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(values)) {
      if (['id', 'created_at', 'updated_at'].includes(k)) continue;
      payload[k] = v === '' ? null : v;
    }
    const onError = (e: unknown) =>
      toast('error', e instanceof ApiError ? e.message : 'Save failed');

    if (editing) {
      update.mutate(
        { id: editing.id, body: payload },
        {
          onSuccess: () => {
            toast('success', `${config.labelSingular} updated`);
            setEditing(undefined);
          },
          onError,
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast('success', `${config.labelSingular} created`);
          setEditing(undefined);
        },
        onError,
      });
    }
  };

  const onDelete = () => {
    if (!deleting) return;
    remove.mutate(deleting.id, {
      onSuccess: () => {
        toast('success', `${config.labelSingular} deleted`);
        setDeleting(null);
      },
      onError: (e) => toast('error', e instanceof ApiError ? e.message : 'Delete failed'),
    });
  };

  const onMove = (row: Row, dir: -1 | 1) => {
    const idx = rows.findIndex((r) => r.id === row.id);
    const swap = idx + dir;
    if (swap < 0 || swap >= rows.length) return;
    const next = [...rows];
    [next[idx], next[swap]] = [next[swap], next[idx]];
    reorder.mutate(
      next.map((r, i) => ({ id: r.id, sort_order: i })),
      { onError: (e) => toast('error', e instanceof ApiError ? e.message : 'Reorder failed') },
    );
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-ala-navy">{config.labelPlural}</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ala-grey-500" />
            <input
              type="search"
              placeholder="Search…"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="h-10 w-56 rounded-input border border-ala-grey-200 bg-white pl-9 pr-3 text-sm focus:border-ala-navy focus:outline-none"
            />
          </div>
          <Button size="sm" onClick={() => setEditing(null)}>
            <Plus className="h-4 w-4" /> New
          </Button>
        </div>
      </div>

      {list.isError && (
        <p className="mb-4 rounded-card bg-ala-red/10 px-4 py-3 text-sm text-ala-red">
          {list.error instanceof ApiError ? list.error.message : 'Failed to load'}
        </p>
      )}

      <DataTable<Row>
        columns={config.columns}
        rows={rows}
        loading={list.isLoading}
        meta={list.data?.meta}
        onPage={setPage}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => setDeleting(r)}
        reorderable={config.orderable}
        onMove={onMove}
      />

      <Drawer
        open={isOpen}
        onOpenChange={(o) => !o && setEditing(undefined)}
        title={editing ? `Edit ${config.labelSingular}` : `New ${config.labelSingular}`}
      >
        {isOpen && (
          <ResourceForm
            fields={config.fields}
            initial={buildInitial(editing ?? null)}
            onSubmit={onSubmit}
            onCancel={() => setEditing(undefined)}
            busy={create.isPending || update.isPending}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        message={`This will permanently delete this ${config.labelSingular.toLowerCase()}. This cannot be undone.`}
        onConfirm={onDelete}
        busy={remove.isPending}
      />
    </div>
  );
}

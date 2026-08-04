import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ApiError } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { formatDate } from '@/lib/format';
import { useAdminList, useCreate, useUpdate, useRemove } from '../lib/crud';
import { DataTable } from '../components/DataTable';
import { Drawer } from '../components/Drawer';
import { ResourceForm } from '../components/ResourceForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import type { FieldConfig, ColumnConfig } from '../lib/fields';
import type { AdminUser } from '@ala/types';

const roleOptions = [
  { value: 'editor', label: 'Editor' },
  { value: 'super_admin', label: 'Super Admin' },
];

const createFields: FieldConfig[] = [
  { name: 'full_name', label: 'Full name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'text', required: true },
  { name: 'password', label: 'Password', type: 'text', required: true, help: 'Minimum 8 characters' },
  { name: 'role', label: 'Role', type: 'select', options: roleOptions },
  { name: 'is_active', label: 'Active', type: 'boolean' },
];

const editFields: FieldConfig[] = [
  { name: 'full_name', label: 'Full name', type: 'text', required: true },
  { name: 'role', label: 'Role', type: 'select', options: roleOptions },
  { name: 'is_active', label: 'Active', type: 'boolean' },
];

type Row = AdminUser & { id: string };

export function Users() {
  const toast = useToast();
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const list = useAdminList<Row>('/admin/users');
  const create = useCreate<Row>('/admin/users');
  const update = useUpdate<Row>('/admin/users');
  const remove = useRemove('/admin/users');

  const columns: ColumnConfig<Row>[] = [
    { key: 'full_name', label: 'Name' },
    { key: 'email', label: 'Email' },
    {
      key: 'role',
      label: 'Role',
      render: (r) => (
        <span className="rounded-full bg-ala-navy/10 px-2 py-0.5 text-xs font-medium text-ala-navy">
          {r.role}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Active',
      render: (r) => (r.is_active ? 'Yes' : 'No'),
    },
    { key: 'created_at', label: 'Created', render: (r) => formatDate(String(r.created_at)) },
  ];

  const onSubmit = (values: Record<string, unknown>) => {
    const onError = (e: unknown) => toast('error', e instanceof ApiError ? e.message : 'Save failed');
    if (editing) {
      const body = { full_name: values.full_name, role: values.role, is_active: values.is_active };
      update.mutate({ id: editing.id, body: body as Partial<Row> }, {
        onSuccess: () => {
          toast('success', 'User updated');
          setEditing(undefined);
        },
        onError,
      });
    } else {
      create.mutate(values as Partial<Row>, {
        onSuccess: () => {
          toast('success', 'User created');
          setEditing(undefined);
        },
        onError,
      });
    }
  };

  const initial = editing
    ? { full_name: editing.full_name, role: editing.role, is_active: editing.is_active }
    : { full_name: '', email: '', password: '', role: 'editor', is_active: true };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-ala-navy">Users</h1>
        <Button size="sm" onClick={() => setEditing(null)}>
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <DataTable<Row>
        columns={columns}
        rows={list.data?.data ?? []}
        loading={list.isLoading}
        onEdit={(r) => setEditing(r)}
        onDelete={(r) => setDeleting(r)}
      />

      <Drawer
        open={editing !== undefined}
        onOpenChange={(o) => !o && setEditing(undefined)}
        title={editing ? 'Edit User' : 'New User'}
      >
        {editing !== undefined && (
          <ResourceForm
            fields={editing ? editFields : createFields}
            initial={initial}
            onSubmit={onSubmit}
            onCancel={() => setEditing(undefined)}
            busy={create.isPending || update.isPending}
          />
        )}
      </Drawer>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        message="This will permanently delete this admin account."
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast('success', 'User deleted');
              setDeleting(null);
            },
            onError: (e) => toast('error', e instanceof ApiError ? e.message : 'Delete failed'),
          })
        }
        busy={remove.isPending}
      />
    </div>
  );
}

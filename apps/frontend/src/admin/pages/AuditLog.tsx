import { useState } from 'react';
import { formatDate } from '@/lib/format';
import { useAdminList } from '../lib/crud';
import { DataTable } from '../components/DataTable';
import type { ColumnConfig } from '../lib/fields';
import type { AuditLog as AuditRow } from '@ala/types';

type Row = AuditRow & { id: string };

const actionColor: Record<string, string> = {
  create: 'bg-emerald-100 text-emerald-700',
  update: 'bg-amber-100 text-amber-700',
  delete: 'bg-ala-red/10 text-ala-red',
  reorder: 'bg-ala-navy/10 text-ala-navy',
};

export function AuditLog() {
  const [page, setPage] = useState(1);
  const list = useAdminList<Row>('/admin/audit-logs', { page, pageSize: 30 });

  const columns: ColumnConfig<Row>[] = [
    {
      key: 'action',
      label: 'Action',
      render: (r) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-medium ${actionColor[String(r.action)] ?? 'bg-ala-grey-200 text-ala-grey-500'}`}
        >
          {String(r.action)}
        </span>
      ),
    },
    { key: 'entity', label: 'Entity' },
    { key: 'entity_id', label: 'Record', render: (r) => <span className="font-mono text-xs">{String(r.entity_id ?? '—').slice(0, 8)}</span> },
    { key: 'ip', label: 'IP', render: (r) => <span className="text-ala-grey-500">{String(r.ip ?? '—')}</span> },
    { key: 'created_at', label: 'When', render: (r) => formatDate(String(r.created_at)) },
  ];

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl font-bold text-ala-navy">Audit Log</h1>
      <DataTable<Row>
        columns={columns}
        rows={list.data?.data ?? []}
        loading={list.isLoading}
        meta={list.data?.meta}
        onPage={setPage}
      />
    </div>
  );
}

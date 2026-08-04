import { Pencil, Trash2, GripVertical, ChevronLeft, ChevronRight } from 'lucide-react';
import { Spinner } from '@/components/ui/Skeleton';
import type { ColumnConfig } from '../lib/fields';
import type { ApiMeta } from '@/lib/api';

interface DataTableProps<T extends { id: string }> {
  columns: ColumnConfig<T>[];
  rows: T[];
  loading?: boolean;
  meta?: ApiMeta;
  onPage?: (page: number) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  reorderable?: boolean;
  onMove?: (row: T, dir: -1 | 1) => void;
}

export function DataTable<T extends { id: string }>({
  columns,
  rows,
  loading,
  meta,
  onPage,
  onEdit,
  onDelete,
  reorderable,
  onMove,
}: DataTableProps<T>) {
  const page = meta?.page ?? 1;
  const pageSize = (meta?.pageSize ?? rows.length) || 1;
  const total = meta?.total ?? rows.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="overflow-hidden rounded-card border border-ala-grey-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-ala-grey-200 bg-ala-grey-50 text-xs uppercase tracking-wide text-ala-grey-500">
              {reorderable && <th className="w-10 px-3 py-3" />}
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-semibold">
                  {c.label}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 text-right font-semibold">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-ala-grey-500">
                  <Spinner className="h-6 w-6" />
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-ala-grey-500">
                  No records yet.
                </td>
              </tr>
            ) : (
              rows.map((row, i) => (
                <tr key={row.id} className="border-b border-ala-grey-200 last:border-0 hover:bg-ala-grey-50/60">
                  {reorderable && (
                    <td className="px-3 py-3">
                      <div className="flex flex-col text-ala-grey-500">
                        <button
                          type="button"
                          aria-label="Move up"
                          disabled={i === 0}
                          onClick={() => onMove?.(row, -1)}
                          className="disabled:opacity-30"
                        >
                          <GripVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  )}
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-middle text-ala-ink">
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {reorderable && (
                          <button
                            type="button"
                            aria-label="Move down"
                            disabled={i === rows.length - 1}
                            onClick={() => onMove?.(row, 1)}
                            className="rounded p-1.5 text-ala-grey-500 hover:bg-ala-grey-100 disabled:opacity-30"
                          >
                            <GripVertical className="h-4 w-4 rotate-180" />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            aria-label="Edit"
                            onClick={() => onEdit(row)}
                            className="rounded p-1.5 text-ala-navy hover:bg-ala-navy/10"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            aria-label="Delete"
                            onClick={() => onDelete(row)}
                            className="rounded p-1.5 text-ala-red hover:bg-ala-red/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {onPage && pages > 1 && (
        <div className="flex items-center justify-between border-t border-ala-grey-200 px-4 py-3 text-sm text-ala-grey-500">
          <span>
            Page {page} of {pages} · {total} total
          </span>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1}
              onClick={() => onPage(page - 1)}
              className="rounded p-1.5 hover:bg-ala-grey-100 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= pages}
              onClick={() => onPage(page + 1)}
              className="rounded p-1.5 hover:bg-ala-grey-100 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

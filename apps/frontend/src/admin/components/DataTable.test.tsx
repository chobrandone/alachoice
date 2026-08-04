import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DataTable } from './DataTable';
import type { ColumnConfig } from '../lib/fields';

interface Row {
  id: string;
  title_en: string;
}
const columns: ColumnConfig<Row>[] = [{ key: 'title_en', label: 'Title' }];

describe('DataTable', () => {
  it('shows an empty state when there are no rows', () => {
    render(<DataTable<Row> columns={columns} rows={[]} />);
    expect(screen.getByText('No records yet.')).toBeInTheDocument();
  });

  it('renders a cell value from the column key', () => {
    render(<DataTable<Row> columns={columns} rows={[{ id: '1', title_en: 'Services' }]} />);
    expect(screen.getByText('Services')).toBeInTheDocument();
  });

  it('invokes onEdit and onDelete for the matching row', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(
      <DataTable<Row>
        columns={columns}
        rows={[{ id: '42', title_en: 'Events' }]}
        onEdit={onEdit}
        onDelete={onDelete}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(onEdit).toHaveBeenCalledWith({ id: '42', title_en: 'Events' });
    expect(onDelete).toHaveBeenCalledWith({ id: '42', title_en: 'Events' });
  });
});

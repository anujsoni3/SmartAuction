import React from 'react';

interface Column<T extends Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  density?: 'compact' | 'normal';
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  emptyMessage = 'No data available',
  density = 'compact'
}: TableProps<T>) {
  const cellPadding = density === 'compact' ? 'px-3 py-3' : 'px-4 py-4';

  return (
    <div className="theme-surface theme-transition overflow-x-auto rounded-2xl scrollbar-thin">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="theme-border border-b bg-[var(--app-panel)]/60">
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${cellPadding} theme-muted text-left text-xs font-semibold uppercase tracking-[0.12em]`}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="py-10 text-center text-slate-500"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={(row.id as string | number | undefined) ?? index}
                className="theme-border border-b transition-colors hover:bg-[var(--app-panel)]/45"
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={`${cellPadding} theme-text align-top`}>
                    {column.render
                      ? column.render(row[column.key as keyof T], row)
                      : String(row[column.key as keyof T] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
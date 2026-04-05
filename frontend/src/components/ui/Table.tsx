import React from 'react';

type BivariantRenderer<T extends object> = {
  bivarianceHack: (value: unknown, row: T) => React.ReactNode;
}['bivarianceHack'];

interface Column<T extends object> {
  key: keyof T | string;
  label: string;
  render?: BivariantRenderer<T>;
}

interface TableProps<T extends object> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  density?: 'compact' | 'normal';
}

export function Table<T extends object>({
  columns,
  data,
  emptyMessage = 'No data available',
  density = 'compact'
}: TableProps<T>) {
  const cellPadding = density === 'compact' ? 'px-3 py-3' : 'px-4 py-4';

  const getCellValue = (row: T, key: keyof T | string): unknown => {
    return (row as Record<string, unknown>)[String(key)];
  };

  return (
    <div className="theme-surface theme-transition overflow-x-auto rounded-2xl scrollbar-thin">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="theme-border border-b bg-[var(--app-panel)]/60">
            {columns.map((column) => (
              <th
                key={String(column.key)}
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
                key={String(getCellValue(row, 'id') ?? index)}
                className="theme-border border-b transition-colors hover:bg-[var(--app-panel)]/45"
              >
                {columns.map((column) => (
                  <td key={String(column.key)} className={`${cellPadding} theme-text align-top`}>
                    {column.render
                      ? column.render(getCellValue(row, column.key), row)
                      : String(getCellValue(row, column.key) ?? '-')}
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
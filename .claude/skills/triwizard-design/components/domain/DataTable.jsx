import React from 'react';

/**
 * DataTable — ledger-style table. Columns: {key,label,align,width,render}.
 * Rows are plain objects. Optional row click + zebra wells.
 */
export function DataTable({ columns = [], rows = [], onRowClick, zebra = true, dense = false, style = {} }) {
  const pad = dense ? '8px 12px' : '12px 16px';
  return (
    <div style={{
      border: '1px solid var(--border-1)', borderRadius: 'var(--radius-md)',
      overflow: 'hidden', background: 'var(--surface-card)', boxShadow: 'var(--shadow-md)', ...style,
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--font-serif)' }}>
        <thead>
          <tr style={{ background: 'var(--surface-sunken)' }}>
            {columns.map((c) => (
              <th key={c.key} style={{
                textAlign: c.align || 'left', padding: pad, width: c.width,
                fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', fontWeight: 'var(--fw-medium)',
                textTransform: 'uppercase', letterSpacing: 'var(--tracking-wider)', color: 'var(--text-3)',
                borderBottom: '1px solid var(--border-2)', whiteSpace: 'nowrap',
              }}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={row.id ?? ri} onClick={onRowClick ? () => onRowClick(row, ri) : undefined}
              style={{
                cursor: onRowClick ? 'pointer' : 'default',
                background: zebra && ri % 2 ? 'var(--surface-sunken)' : 'transparent',
                transition: 'background var(--dur-fast) var(--ease-out)',
              }}
              onMouseEnter={(e) => onRowClick && (e.currentTarget.style.background = 'var(--accent-soft)')}
              onMouseLeave={(e) => onRowClick && (e.currentTarget.style.background = zebra && ri % 2 ? 'var(--surface-sunken)' : 'transparent')}>
              {columns.map((c) => (
                <td key={c.key} style={{
                  textAlign: c.align || 'left', padding: pad,
                  fontSize: 'var(--text-sm)', color: 'var(--text-1)',
                  borderBottom: ri < rows.length - 1 ? '1px solid var(--border-1)' : 'none',
                  fontVariantNumeric: c.align === 'right' ? 'tabular-nums' : 'normal',
                  fontFamily: c.mono ? 'var(--font-mono)' : 'var(--font-serif)',
                }}>
                  {c.render ? c.render(row[c.key], row) : row[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

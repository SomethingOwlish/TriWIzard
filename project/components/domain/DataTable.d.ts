import * as React from 'react';

export interface Column {
  key: string;
  label: React.ReactNode;
  align?: 'left' | 'center' | 'right';
  width?: number | string;
  /** Render cell value as mono (codes, numbers). */
  mono?: boolean;
  /** Custom cell renderer. */
  render?: (value: any, row: any) => React.ReactNode;
}

/**
 * @startingPoint section="TTRPG" subtitle="Ledger data table" viewport="700x520"
 */
export interface DataTableProps {
  columns: Column[];
  rows: Array<Record<string, any>>;
  onRowClick?: (row: any, index: number) => void;
  zebra?: boolean;
  dense?: boolean;
  style?: React.CSSProperties;
}

/**
 * Ledger-style data table — chronologies, rosters, stat tables.
 * @startingPoint section="TTRPG" subtitle="Ledger data table" viewport="700x300"
 */
export function DataTable(props: DataTableProps): JSX.Element;

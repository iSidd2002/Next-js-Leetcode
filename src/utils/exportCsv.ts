import type { Problem } from '@/types';

/**
 * Compute the ideal column width (in characters) for a set of values + header.
 */
function colWidth(header: string, values: string[]): number {
  const maxContent = values.reduce((max, v) => Math.max(max, v.length), 0);
  return Math.min(Math.max(header.length + 4, maxContent + 4), 100);
}

/**
 * Download learned problems as an Excel (.xlsx) file with auto-fitted wide columns.
 * Columns: Question Name | Link | Topics | Pattern
 *
 * Uses SheetJS (xlsx) so every cell is fully visible without manual column resizing.
 */
export async function downloadLearnedCSV(problems: Problem[]): Promise<void> {
  // Lazy-load xlsx so it doesn't bloat the initial bundle
  const XLSX = await import('xlsx');

  const rows = problems.map((p) => ({
    'Question Name': p.title ?? '',
    'Link': p.url ?? '',
    'Topics': (p.topics ?? []).join(', '),
    'Pattern': p.pattern ?? '',
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Compute column widths from actual data
  const names    = rows.map((r) => r['Question Name']);
  const links    = rows.map((r) => r['Link']);
  const topics   = rows.map((r) => r['Topics']);
  const patterns = rows.map((r) => r['Pattern']);

  ws['!cols'] = [
    { wch: colWidth('Question Name', names) },
    { wch: colWidth('Link', links) },
    { wch: colWidth('Topics', topics) },
    { wch: colWidth('Pattern', patterns) },
  ];

  // Freeze the header row so it stays visible while scrolling
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Learned Problems');

  const date = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `learned-problems-${date}.xlsx`);
}

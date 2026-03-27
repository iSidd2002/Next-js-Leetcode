import type { Problem } from '@/types';

/**
 * Escape a single CSV cell value.
 * Wraps in quotes and doubles any internal quotes.
 */
function escapeCell(value: string | undefined | null): string {
  const str = value ?? '';
  // If the value contains a comma, newline, or quote — wrap it
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Download learned problems as a CSV file.
 * Columns: Question Name | Link | Topics | Pattern
 */
export function downloadLearnedCSV(problems: Problem[]): void {
  const headers = ['Question Name', 'Link', 'Topics', 'Pattern'];

  const rows = problems.map((p) => [
    escapeCell(p.title),
    escapeCell(p.url),
    escapeCell((p.topics ?? []).join(', ')),
    escapeCell(p.pattern ?? ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const date = new Date().toISOString().split('T')[0];
  const link = document.createElement('a');
  link.href = url;
  link.download = `learned-problems-${date}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

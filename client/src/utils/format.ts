/** Pretty-prints the ISO timestamps returned by TypeORM columns. */
export function formatDateTime(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Shortens the server-side UUIDs for display. */
export function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

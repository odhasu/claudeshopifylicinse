export default function normalizeDomain(d: string | undefined | null): string {
  return (d || '').replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '').toLowerCase();
}

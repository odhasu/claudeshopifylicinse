export default function vxChecksum(a: string, b: string, c: string): string {
  const combined = a + b + c + 'VXL9';
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = ((hash << 5) + hash) + combined.charCodeAt(i);
    hash = hash & 0xFFFF;
  }
  return hash.toString(16).toUpperCase().padStart(4, '0');
}

// Clear Supabase session from localStorage
const supabaseKeys = Object.keys(localStorage).filter(k => k.includes('supabase') || k.includes('auth'));
supabaseKeys.forEach(k => localStorage.removeItem(k));
console.log('✓ Cleared Supabase session keys:', supabaseKeys);
  
// Now reload
window.location.href = 'http://localhost:3001/theme/account';

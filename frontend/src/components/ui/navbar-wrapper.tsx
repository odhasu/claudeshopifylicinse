'use client';

import { usePathname } from 'next/navigation';
import { NavBar } from '@/components/ui/tubelight-navbar';

/** Renders the global tubelight NavBar on all routes except docs/admin,
 *  which have their own top navigation. */
export function NavBarWrapper() {
  const pathname = usePathname();
  // Suppress navbar on docs and admin pages (which have their own top nav)
  const isDocs = /\/theme\/docs\/?$/.test(pathname);
  const isAdmin = pathname === '/admin' || pathname.startsWith('/admin/');
  const isCheckout = pathname.startsWith('/theme/checkout');
  if (isDocs || isAdmin || isCheckout) return null;
  return <NavBar />;
}

'use client';

import { usePathname } from 'next/navigation';

const HIDDEN_ON = ['/theme/docs', '/theme/account'];

export function SideGradients() {
  const pathname = usePathname();
  const hidden = HIDDEN_ON.some((p) => pathname.includes(p));
  if (hidden) return null;

  return (
    <>
      <div className="fixed inset-y-0 left-0 w-16 sm:w-90 bg-gradient-to-r from-[#3A0CA3]/5 to-transparent pointer-events-none z-30" />
      <div className="fixed inset-y-0 right-0 w-16 sm:w-90 bg-gradient-to-l from-[#3A0CA3]/5 to-transparent pointer-events-none z-30" />
    </>
  );
}

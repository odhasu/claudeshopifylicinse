import type { ReactNode } from 'react';
import { SideGradients } from '@/components/ui/side-gradients';

export default function ThemeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative overflow-x-hidden">
      <SideGradients />
      {children}
    </div>
  );
}

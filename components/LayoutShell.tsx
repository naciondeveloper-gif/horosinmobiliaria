'use client';

import { usePathname } from 'next/navigation';

export default function LayoutShell({
  children,
  navbar,
  footer,
}: {
  children: React.ReactNode;
  navbar: React.ReactNode;
  footer: React.ReactNode;
}) {
  const isAdmin = usePathname() === '/login';

  if (isAdmin) return <>{children}</>;

  return (
    <>
      {navbar}
      {children}
      {footer}
    </>
  );
}

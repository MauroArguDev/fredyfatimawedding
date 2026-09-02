import type { ReactNode } from 'react';
import { Button } from '@/components/admin/primitives/button';
import { Toaster } from '@/components/admin/primitives/sonner';
import { ADMIN_SHELL_ROOT_ID } from '@/components/admin/adminShellRoot';

interface AdminShellProps {
  title: string;
  logoutLabel: string;
  onLogout: () => void;
  children: ReactNode;
}

export const AdminShell = ({
  title,
  logoutLabel,
  onLogout,
  children,
}: AdminShellProps): ReactNode => {
  return (
    <div id={ADMIN_SHELL_ROOT_ID} className="admin-shell flex min-h-dvh flex-col">
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <Button type="button" variant="outline" onClick={onLogout}>
          {logoutLabel}
        </Button>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      <Toaster />
    </div>
  );
};

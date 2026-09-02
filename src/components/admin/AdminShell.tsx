import type { ReactNode } from 'react';
import { MoonIcon, SunIcon } from 'lucide-react';
import { Button } from '@/components/admin/primitives/button';
import { Toaster } from '@/components/admin/primitives/sonner';
import { ADMIN_SHELL_ROOT_ID } from '@/components/admin/adminShellRoot';
import { useAdminTheme } from '@/components/admin/useAdminTheme';
import { adminShellCopy } from '@/content/appShell';
import { cn } from '@/lib/utils';

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
  const { theme, toggleTheme } = useAdminTheme();

  return (
    <div
      id={ADMIN_SHELL_ROOT_ID}
      className={cn('admin-shell flex min-h-dvh flex-col', theme === 'dark' && 'dark')}
    >
      <header className="flex items-center justify-between gap-4 border-b border-border px-4 py-3 sm:px-6">
        <h1 className="text-lg font-semibold">{title}</h1>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label={
              theme === 'dark'
                ? adminShellCopy.switchToLightTheme
                : adminShellCopy.switchToDarkTheme
            }
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </Button>
          <Button type="button" variant="outline" onClick={onLogout}>
            {logoutLabel}
          </Button>
        </div>
      </header>
      <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
      <Toaster theme={theme} />
    </div>
  );
};

export const ADMIN_SHELL_ROOT_ID = 'admin-shell-root';

export function getAdminShellRootContainer(): HTMLElement | null {
  return document.getElementById(ADMIN_SHELL_ROOT_ID);
}

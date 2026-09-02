import { useCallback, useEffect, useState } from 'react';

export type AdminTheme = 'light' | 'dark';

const ADMIN_THEME_STORAGE_KEY = 'admin-theme';

function readStoredTheme(): AdminTheme | null {
  try {
    const stored = window.localStorage.getItem(ADMIN_THEME_STORAGE_KEY);

    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

function readSystemTheme(): AdminTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

interface UseAdminThemeResult {
  theme: AdminTheme;
  toggleTheme: () => void;
}

export function useAdminTheme(): UseAdminThemeResult {
  const [theme, setTheme] = useState<AdminTheme>(() => readStoredTheme() ?? readSystemTheme());

  useEffect(() => {
    window.localStorage.setItem(ADMIN_THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  return { theme, toggleTheme };
}

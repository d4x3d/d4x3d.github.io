const STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'dark';
  const stored = (localStorage.getItem(STORAGE_KEY) as Theme | null) || null;
  if (stored) return stored;
  return 'dark';
}

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  localStorage.setItem(STORAGE_KEY, theme);
}

export function toggleTheme(): Theme {
  const next: Theme = (document.documentElement.classList.contains('dark') ? 'light' : 'dark');
  applyTheme(next);
  return next;
}

export function ensureThemeApplied() {
  applyTheme(getInitialTheme());
}

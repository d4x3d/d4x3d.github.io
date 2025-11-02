import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { ensureThemeApplied, toggleTheme } from '../lib/theme';

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  useEffect(() => {
    ensureThemeApplied();
    setDark(document.documentElement.classList.contains('dark'));
  }, []);
  const onClick = () => {
    const next = toggleTheme();
    setDark(next === 'dark');
  };
  return (
    <button
      onClick={onClick}
      className="fixed right-4 top-4 z-20 bg-black text-white dark:bg-yellow-300 dark:text-black border-4 border-black px-3 py-2 shadow-[6px_6px_0_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[4px_4px_0_rgba(0,0,0,1)] transition-all"
      aria-label="Toggle theme"
    >
      {dark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
    </button>
  );
}

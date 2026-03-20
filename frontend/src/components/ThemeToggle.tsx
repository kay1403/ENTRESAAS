'use client';

import { useTheme } from './ThemeProvider';
import { Moon, Sun } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder pour éviter le décalage
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
      aria-label="Changer le thème"
    >
      <Sun className={`h-5 w-5 transition-all duration-200 ${
        theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
      }`} />
      <Moon className={`h-5 w-5 absolute inset-0 m-auto transition-all duration-200 ${
        theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
      }`} />
    </button>
  );
}

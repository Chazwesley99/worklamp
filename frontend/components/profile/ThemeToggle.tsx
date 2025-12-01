'use client';

import React, { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      applyTheme(savedTheme);
    } else {
      // Default to dark mode
      setTheme('dark');
      applyTheme('dark');
    }
  }, []);

  const applyTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);
  };

  return (
    <div className="flex items-center space-x-3">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
      </Button>
      <span className="text-sm text-gray-500 dark:text-gray-400">
        {theme === 'light' ? 'Light' : 'Dark'}
      </span>
    </div>
  );
}

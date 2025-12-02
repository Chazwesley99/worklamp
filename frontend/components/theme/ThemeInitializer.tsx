'use client';

/**
 * ThemeInitializer - Prevents flash of unstyled content by initializing theme before render
 * Requirement 18.1: Default to dark mode
 * Requirement 18.3: Persist theme preference across sessions
 */
export function ThemeInitializer() {
  // This script runs before React hydration to prevent FOUC
  const themeScript = `
    (function() {
      try {
        const savedTheme = localStorage.getItem('theme');
        const theme = savedTheme || 'dark'; // Default to dark mode (Requirement 18.1)
        
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
        
        // Save default if not set (Requirement 18.3)
        if (!savedTheme) {
          localStorage.setItem('theme', 'dark');
        }
      } catch (e) {
        // If localStorage is not available, default to dark mode
        document.documentElement.classList.add('dark');
      }
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: themeScript }} />;
}

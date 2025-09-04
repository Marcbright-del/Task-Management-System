
import React, { useState, useEffect } from 'react';

export const ThemeSwitcher: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setIsDarkMode(isDark);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="bg-base-100 p-3 rounded-lg flex justify-between items-center">
      <span className="font-semibold text-sm">Theme</span>
      <button
        onClick={toggleTheme}
        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-base-300"
      >
        <span
          className={`${
            isDarkMode ? 'translate-x-6' : 'translate-x-1'
          } inline-block w-4 h-4 transform bg-white dark:bg-slate-500 rounded-full transition-transform`}
        />
      </button>
    </div>
  );
};
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export const THEMES = [
  { id: 'aurora', name: 'Aurora Borealis', color: '#2dd4bf', desc: 'Fresh teal-indigo aurora blobs' },
  { id: 'sunset', name: 'Neon Sunset', color: '#ff7e5f', desc: 'Warm coral and violet rays' },
  { id: 'prism', name: 'Cyberpunk Prism', color: '#ff007f', desc: 'Velvet dark with hot neon glow' },
  { id: 'matrix', name: 'Emerald Matrix', color: '#a3e635', desc: 'Classic digital green obsidian grid' }
];

export const ThemeProvider = ({ children }) => {
  // Try loading from localStorage first, default to 'aurora'
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('ats_theme') || 'aurora';
  });

  const changeTheme = (newTheme) => {
    if (THEMES.some(t => t.id === newTheme)) {
      setThemeState(newTheme);
      localStorage.setItem('ats_theme', newTheme);
      document.documentElement.setAttribute('data-theme', newTheme);
    }
  };

  // Sync theme attribute with DOM on start/change
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, changeTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

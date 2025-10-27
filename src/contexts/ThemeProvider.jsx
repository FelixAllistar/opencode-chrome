import { createContext, useContext, useEffect, useState } from 'react';
import { THEMES, THEME_VARIABLES, DEFAULT_THEME } from '../utils/themes.js';
import { useStorage } from '../hooks/useStorage.js';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useStorage('theme', DEFAULT_THEME);
  const [isDark, setIsDark] = useState(true); // For now, default to dark mode

  useEffect(() => {
    applyTheme(theme, isDark);
  }, [theme, isDark]);

  const applyTheme = (themeName, darkMode) => {
    const themeData = THEMES[themeName];
    if (!themeData) return;

    const root = document.documentElement;

    // Apply theme variables
    Object.entries(THEME_VARIABLES).forEach(([cssVar, themeKey]) => {
      const color = themeData[themeKey]?.[darkMode ? 'dark' : 'light'];
      if (color) {
        root.style.setProperty(cssVar, color);
      }
    });

    // Apply theme class to root
    root.classList.remove('light', 'dark');
    root.classList.add(darkMode ? 'dark' : 'light');
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const toggleDarkMode = () => {
    setIsDark(!isDark);
  };

  return (
    <ThemeContext.Provider value={{
      theme,
      isDark,
      changeTheme,
      toggleDarkMode,
      themes: Object.keys(THEMES)
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
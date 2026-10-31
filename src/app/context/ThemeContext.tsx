import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { Classes } from '@blueprintjs/core';

/** Same key the previous toggle used, so existing preferences carry over. */
export const THEME_STORAGE_KEY = 'blueprintjs-dark-mode';
const DARK_CLASS = Classes.DARK;

const readSavedPreference = (): boolean | null => {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return saved === null ? null : JSON.parse(saved) === true;
  } catch {
    return null;
  }
};

const systemPrefersDark = (): boolean =>
  window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? true;

/**
 * Applies the theme to <body>. index.html runs the same logic inline before
 * React loads so there's no flash of the wrong theme.
 */
const applyTheme = (isDark: boolean) => {
  document.body.classList.toggle(DARK_CLASS, isDark);
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
};

interface IThemeContext {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<IThemeContext>({
  isDark: true,
  toggleTheme: () => undefined,
});

/**
 * Tracks light/dark mode. Follows the operating system until the user picks
 * a theme explicitly, then remembers that choice.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(
    () => readSavedPreference() ?? systemPrefersDark(),
  );

  useEffect(() => applyTheme(isDark), [isDark]);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!media) {
      return;
    }
    const onChange = (e: MediaQueryListEvent) => {
      if (readSavedPreference() === null) {
        setIsDark(e.matches);
      }
    };
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode or storage disabled; the choice just won't persist.
      }
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);

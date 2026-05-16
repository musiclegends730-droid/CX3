import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { THEMES, DEFAULT_THEME_ID, applyTheme, getThemeById, type AppTheme } from "@/lib/themes";
import { getGlobalTheme, setGlobalTheme as persistGlobalTheme } from "@/lib/auth";

const THEME_KEY = "cx3_user_theme";

interface ThemeContextType {
  currentTheme: AppTheme;
  setTheme: (id: string) => void;
  themes: AppTheme[];
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(() =>
    getThemeById(
      localStorage.getItem(THEME_KEY) ??
      getGlobalTheme() ??
      DEFAULT_THEME_ID
    )
  );

  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  const setTheme = (id: string) => {
    const theme = getThemeById(id);
    setCurrentTheme(theme);
    localStorage.setItem(THEME_KEY, id);
    applyTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export function useAdminTheme() {
  const { setTheme } = useTheme();
  const setGlobal = (id: string) => {
    persistGlobalTheme(id);
    setTheme(id);
  };
  return { setGlobal };
}

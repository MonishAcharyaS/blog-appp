"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // 1. Check current class on <html> set by inline head script
    const isDark = document.documentElement.classList.contains("dark");
    const currentTheme: Theme = isDark ? "dark" : "light";
    setThemeState(currentTheme);
    setMounted(true);

    // 2. Listen for OS prefers-color-scheme changes if user hasn't explicitly set localStorage
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = (e: MediaQueryListEvent) => {
      const storedTheme = localStorage.getItem("theme");
      if (!storedTheme) {
        const nextTheme: Theme = e.matches ? "dark" : "light";
        setThemeState(nextTheme);
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleMediaChange);
    return () => mediaQuery.removeEventListener("change", handleMediaChange);
  }, []);

  const setTheme = (nextTheme: Theme) => {
    setThemeState(nextTheme);
    localStorage.setItem("theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

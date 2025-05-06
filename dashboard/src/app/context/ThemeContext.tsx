"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or default to system
  useEffect(() => {
    const storedTheme = localStorage.getItem("theme") as Theme | null;
    if (storedTheme) {
      setTheme(storedTheme);
    } else {
      // Default to dark theme instead of checking system preference
      setTheme("dark");
    }
    setMounted(true);
  }, []);

  // Update localStorage and apply theme class when theme changes
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("theme", theme);
    
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove("light-theme", "dark-theme");
    
    // Determine which theme to apply
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches 
        ? "dark" 
        : "light";
      root.classList.add(`${systemTheme}-theme`);
    } else {
      root.classList.add(`${theme}-theme`);
    }
  }, [theme, mounted]);

  // Prevent hydration mismatch by only rendering once mounted
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a default implementation instead of throwing an error
    return {
      theme: "dark" as Theme,
      setTheme: (theme: Theme) => {
        console.warn("ThemeProvider not found, setting theme to", theme);
        if (typeof window !== 'undefined') {
          localStorage.setItem("theme", theme);
        }
      }
    };
  }
  return context;
}

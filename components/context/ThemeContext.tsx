import React, { createContext, useContext, ReactNode } from 'react';
import { theme as defaultTheme } from './theme';

// Theme interface
export interface Theme {
  // Background colors
  background: {
    primary: string;      // Main app background
    secondary: string;    // Card backgrounds
    tertiary: string;     // Subtle backgrounds
    overlay: string;      // Modal overlays
  };
  
  // Text colors
  text: {
    primary: string;      // Main text
    secondary: string;    // Secondary text
    tertiary: string;     // Muted text
    inverse: string;      // Text on colored backgrounds
    placeholder: string;  // Input placeholders
  };
  
  // Button colors
  button: {
    primary: string;      // Primary actions
    secondary: string;    // Secondary actions
    tertiary: string;     // Tertiary actions
    disabled: string;     // Disabled state
    danger: string;       // Destructive actions
  };
  
  // Status colors
  status: {
    success: string;      // Success states
    warning: string;      // Warning states
    error: string;        // Error states
    info: string;         // Information states
  };
  
  // Border colors
  border: {
    primary: string;      // Main borders
    secondary: string;    // Subtle borders
    accent: string;       // Accent borders
  };
  
  // Shadow colors
  shadow: {
    primary: string;      // Main shadows
    secondary: string;    // Subtle shadows
  };
  
  // Special colors
  special: {
    accent: string;       // Brand accent color
    highlight: string;    // Highlight color
    gradient: {
      start: string;      // Gradient start
      end: string;        // Gradient end
    };
  };
}



// Theme context
interface ThemeContextType {
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider
interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <ThemeContext.Provider value={{ theme: defaultTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook to use theme
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}



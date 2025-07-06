import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ColorTheme, ThemeType, themes, defaultTheme } from '../../utils/theme';

interface ThemeContextType {
  theme: ColorTheme;
  themeType: ThemeType;
  setTheme: (themeType: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = defaultTheme 
}) => {
  const [themeType, setThemeType] = useState<ThemeType>(initialTheme);
  
  const setTheme = (newThemeType: ThemeType) => {
    setThemeType(newThemeType);
  };
  
  const theme = themes[themeType];
  
  return (
    <ThemeContext.Provider value={{ theme, themeType, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}; 
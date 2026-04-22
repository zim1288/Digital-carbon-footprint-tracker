import React, { createContext, useState, useContext } from 'react';
import { useColorScheme } from 'react-native';

// Define what our context looks like
type ThemeContextType = {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
};

// Create the actual context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Create a Provider component to wrap our app
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Get the phone's default system theme (dark or light)
  const systemTheme = useColorScheme();
  
  // State to hold our current theme, starting with the system default
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  // The function to flip the switch
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook so we can easily grab the theme in any file
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
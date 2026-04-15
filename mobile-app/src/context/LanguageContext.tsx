// src/context/LanguageContext.tsx
import React, { createContext, useState, useContext } from 'react';

// Dictionary holding our translations
export const translations = {
  en: {
    menuTitle: "Menu",
    menuSubtitle: "EcoBit Settings",
    manualLog: "Manually Log Activity",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language: English",
    aboutUs: "About Us / Credits",
    logOut: "Log Out",
  },
  bn: {
    menuTitle: "মেনু",
    menuSubtitle: "ইকোবিট সেটিংস",
    manualLog: "ম্যানুয়ালি অ্যাক্টিভিটি লগ করুন",
    lightMode: "লাইট মোড",
    darkMode: "ডার্ক মোড",
    language: "ভাষা: বাংলা",
    aboutUs: "আমাদের সম্পর্কে / ক্রেডিট",
    logOut: "লগ আউট",
  }
};

// Define available languages
type Language = 'en' | 'bn';

// Define what our context looks like
type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;
};

// Create the actual context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create a Provider component to wrap our app
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  // Start with English as default
  const [language, setLanguage] = useState<Language>('en');

  // Toggle between English and Bengali
  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  // Helper function to grab the correct text based on current language
  const t = (key: keyof typeof translations.en) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook so we can easily grab the language in any file
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
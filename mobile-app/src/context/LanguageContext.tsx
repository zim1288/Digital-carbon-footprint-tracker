import React, { createContext, useState, useContext } from 'react';

// Dictionary holding our translations (Comments kept in English!)
export const translations = {
  en: {
    // Menu
    menuTitle: "Menu",
    menuSubtitle: "EcoBit Settings",
    manualLog: "Manual Log",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    language: "Language: English",
    aboutUs: "About Us / Credits",
    logOut: "Log Out",
    // Tracker Screen
    todaysFootprint: "TODAY'S FOOTPRINT",
    kmDriven: "km driven",
    charges: "charges",
    logActivity: "Log Activity",
    streaming: "Streaming",
    socialWeb: "Social & Web",
    videoCalls: "Video Calls",
    generalApps: "General Apps",
    hrs: "hrs",
    est: "Est.",
    // Analytics Screen
    aiTitle: "AI Impact Analysis",
    aiDesc: "Get a personalized deep-dive into your carbon habits powered by Gemini AI.",
    analyzeBtn: "Analyze My Data ✨",
    sourceEmissions: "Source of Emissions",
    noData: "No data logged for today yet. Use the Tracker tab or Manual Entry to log activity!",
    weeklyTrend: "Weekly Trend (gCO₂)",
    Mon: "Mon", Tue: "Tue", Wed: "Wed", Thu: "Thu", Fri: "Fri", Sat: "Sat", Sun: "Sun",
    // Tips Screen
    askCoachTitle: "Ask EcoBit Coach",
    coachSays: "EcoBit Says:",
    askAnything: "Ask me anything about digital sustainability!",
    chatPlaceholder: "E.g. How much carbon does an email use?",
    ecoRecs: "Eco-Recommendations",
    recSub: "Personalized ways to reduce your footprint.",
    // Manual Log Screen
    manualEntryTitle: "Manual Entry",
    activityType: "Activity Type",
    activityPlaceholder: "e.g. Video Editing, Gaming, Downloading",
    durationMins: "Duration (Minutes)",
    dataUsedMB: "Data Used (MB)",
    saveActivity: "Save Activity",
    // Login Screen
    monitorFootprint: "Monitor your digital carbon footprint",
    createAccount: "Create an account",
    fullName: "Full Name",
    email: "Email",
    password: "Password",
    login: "Login",
    signUp: "Sign Up",
    pleaseWait: "Please wait...",
    dontHaveAccount: "Don't have an account? Sign Up",
    alreadyHaveAccount: "Already have an account? Login",
    // Bottom Navigation Tabs
    tabTracker: "Tracker",
    tabAnalysis: "Analysis",
    tabTips: "Tips"
  },
  bn: {
    // Menu
    menuTitle: "মেনু",
    menuSubtitle: "ইকোবিট সেটিংস",
    manualLog: "ম্যানুয়াল লগ",
    lightMode: "লাইট মোড",
    darkMode: "ডার্ক মোড",
    language: "ভাষা: বাংলা",
    aboutUs: "আমাদের সম্পর্কে / ক্রেডিট",
    logOut: "লগ আউট",
    // Tracker Screen
    todaysFootprint: "আজকের ফুটপ্রিন্ট",
    kmDriven: "কিমি চালানো হয়েছে",
    charges: "চার্জ",
    logActivity: "অ্যাক্টিভিটি লগ করুন",
    streaming: "স্ট্রিমিং",
    socialWeb: "সোশ্যাল ও ওয়েব",
    videoCalls: "ভিডিও কল",
    generalApps: "সাধারণ অ্যাপস",
    hrs: "ঘণ্টা",
    est: "আনুমানিক",
    // Analytics Screen
    aiTitle: "এআই ইমপ্যাক্ট অ্যানালাইসিস",
    aiDesc: "জেমিনি এআই দ্বারা আপনার কার্বন অভ্যাসের বিস্তারিত জানুন।",
    analyzeBtn: "আমার ডেটা বিশ্লেষণ করুন ✨",
    sourceEmissions: "নির্গমনের উৎস",
    noData: "আজ কোনো ডেটা লগ করা হয়নি। ট্র্যাকার বা ম্যানুয়াল এন্ট্রি ব্যবহার করুন!",
    weeklyTrend: "সাপ্তাহিক ট্রেন্ড (gCO₂)",
    Mon: "সোম", Tue: "মঙ্গল", Wed: "বুধ", Thu: "বৃহঃ", Fri: "শুক্র", Sat: "শনি", Sun: "রবি",
    // Tips Screen
    askCoachTitle: "ইকোবিট কোচকে জিজ্ঞাসা করুন",
    coachSays: "ইকোবিট বলছে:",
    askAnything: "ডিজিটাল টেকসইতা সম্পর্কে আমাকে যেকোনো কিছু জিজ্ঞাসা করুন!",
    chatPlaceholder: "উদাঃ একটি ইমেইলে কত কার্বন খরচ হয়?",
    ecoRecs: "ইকো-সুপারিশ",
    recSub: "আপনার ফুটপ্রিন্ট কমানোর ব্যক্তিগত উপায়।",
    // Manual Log Screen
    manualEntryTitle: "ম্যানুয়াল এন্ট্রি",
    activityType: "অ্যাক্টিভিটির ধরন",
    activityPlaceholder: "উদাঃ ভিডিও এডিটিং, গেমিং, ডাউনলোডিং",
    durationMins: "সময়কাল (মিনিট)",
    dataUsedMB: "ব্যবহৃত ডেটা (এমবি)",
    saveActivity: "অ্যাক্টিভিটি সেভ করুন",
    // Login Screen
    monitorFootprint: "আপনার ডিজিটাল কার্বন ফুটপ্রিন্ট মনিটর করুন",
    createAccount: "একটি অ্যাকাউন্ট তৈরি করুন",
    fullName: "পুরো নাম",
    email: "ইমেইল",
    password: "পাসওয়ার্ড",
    login: "লগইন",
    signUp: "সাইন আপ",
    pleaseWait: "অপেক্ষা করুন...",
    dontHaveAccount: "অ্যাকাউন্ট নেই? সাইন আপ",
    alreadyHaveAccount: "অ্যাকাউন্ট আছে? লগইন",
    // Bottom Navigation Tabs
    tabTracker: "ট্র্যাকার",
    tabAnalysis: "অ্যানালাইসিস",
    tabTips: "টিপস"
  }
};

type Language = 'en' | 'bn';

type LanguageContextType = {
  language: Language;
  toggleLanguage: () => void;
  t: (key: keyof typeof translations.en) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key: keyof typeof translations.en) => {
    return translations[language][key];
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
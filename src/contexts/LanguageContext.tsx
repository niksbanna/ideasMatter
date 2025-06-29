import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Language configuration
export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean; // Right-to-left languages
}

export const SUPPORTED_LANGUAGES: LanguageConfig[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true }
];

interface LanguageContextType {
  currentLanguage: string;
  setLanguage: (language: string) => void;
  t: (key: string, fallback?: string) => string;
  isRTL: boolean;
  availableLanguages: LanguageConfig[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<Record<string, any>>({});

  // Detect browser language on mount
  useEffect(() => {
    const detectBrowserLanguage = () => {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      const langCode = browserLang.split('-')[0].toLowerCase();
      
      // Check if we support this language
      const supported = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
      return supported ? langCode : 'en';
    };

    // Try to get saved language from localStorage, otherwise detect browser language
    const savedLanguage = localStorage.getItem('ideasmatter-language');
    const initialLanguage = savedLanguage || detectBrowserLanguage();
    
    setCurrentLanguage(initialLanguage);
    loadTranslations(initialLanguage);
  }, []);

  // Load translations for a specific language
  const loadTranslations = async (language: string) => {
    try {
      const response = await import(`../locales/${language}.json`);
      setTranslations(response.default || response);
    } catch (error) {
      console.error(`Failed to load translations for ${language}:`, error);
      // Fallback to English if translation loading fails
      if (language !== 'en') {
        try {
          const fallbackResponse = await import('../locales/en.json');
          setTranslations(fallbackResponse.default || fallbackResponse);
        } catch (fallbackError) {
          console.error('Failed to load fallback English translations:', fallbackError);
        }
      }
    }
  };

  // Change language
  const setLanguage = async (language: string) => {
    if (language === currentLanguage) return;
    
    setCurrentLanguage(language);
    localStorage.setItem('ideasmatter-language', language);
    await loadTranslations(language);
    
    // Update document direction for RTL languages
    const languageConfig = SUPPORTED_LANGUAGES.find(lang => lang.code === language);
    document.documentElement.dir = languageConfig?.rtl ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  };

  // Translation function with nested key support
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Return fallback or key if translation not found
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : (fallback || key);
  };

  // Check if current language is RTL
  const isRTL = SUPPORTED_LANGUAGES.find(lang => lang.code === currentLanguage)?.rtl || false;

  const contextValue: LanguageContextType = {
    currentLanguage,
    setLanguage,
    t,
    isRTL,
    availableLanguages: SUPPORTED_LANGUAGES
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// HOC for components that need translation
export const withTranslation = <P extends object>(
  Component: React.ComponentType<P & { t: (key: string, fallback?: string) => string }>
) => {
  return (props: P) => {
    const { t } = useLanguage();
    return <Component {...props} t={t} />;
  };
};
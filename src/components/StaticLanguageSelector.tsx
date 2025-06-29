import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, CheckCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export const StaticLanguageSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageSelect = (languageCode: string) => {
    setLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLangInfo = availableLanguages.find(lang => lang.code === currentLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        title="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="text-sm font-medium">
          {currentLangInfo?.flag} {currentLangInfo?.nativeName}
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-slate-500 px-2 py-1 mb-2">
              Select Language
            </div>
            {availableLanguages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-slate-100 transition-colors ${
                  currentLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-slate-500">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t border-slate-200 p-2">
            <div className="text-xs text-slate-500 px-2 py-1">
              Static content translations powered by community contributors
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
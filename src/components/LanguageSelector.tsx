import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Volume2, Loader2, CheckCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES, translationService, type LanguageOption, type Translation } from '../services/translation';
import { generateSpeech } from '../services/elevenlabs';
import { audioCache } from '../services/audioCache';

interface LanguageSelectorProps {
  title: string;
  description: string;
  proposalId: string;
  onTranslationChange?: (translations: { title: Translation; description: Translation } | null) => void;
  onAudioChange?: (audioBlob: Blob | null, language: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  title,
  description,
  proposalId,
  onTranslationChange,
  onAudioChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [translations, setTranslations] = useState<{ title: Translation; description: Translation } | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Detect browser language on mount
  useEffect(() => {
    const browserLang = translationService.detectBrowserLanguage();
    setSelectedLanguage(browserLang);
  }, []);

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

  const handleLanguageSelect = async (languageCode: string) => {
    setIsOpen(false);
    setError(null);
    
    if (languageCode === selectedLanguage) return;
    
    setSelectedLanguage(languageCode);

    // If selecting English, clear translations
    if (languageCode === 'en') {
      setTranslations(null);
      setAudioBlob(null);
      onTranslationChange?.(null);
      onAudioChange?.(null, languageCode);
      return;
    }

    // Translate content
    try {
      setIsTranslating(true);
      const translatedContent = await translationService.translateProposal(title, description, languageCode);
      setTranslations(translatedContent);
      onTranslationChange?.(translatedContent);

      // Generate audio for translated content
      await generateAudioForLanguage(languageCode, translatedContent);
    } catch (err) {
      console.error('Error translating content:', err);
      setError('Failed to translate content. Please try again.');
    } finally {
      setIsTranslating(false);
    }
  };

  const generateAudioForLanguage = async (languageCode: string, translatedContent: { title: Translation; description: Translation }) => {
    const languageInfo = translationService.getLanguageInfo(languageCode);
    if (!languageInfo?.voiceId) {
      console.warn(`No voice available for language: ${languageCode}`);
      return;
    }

    try {
      setIsGeneratingAudio(true);
      
      // Combine title and description for audio
      const textForAudio = `${translatedContent.title.translatedText}. ${translatedContent.description.translatedText}`;
      
      // Check cache first
      const cacheKey = `${proposalId}_${languageCode}`;
      const cachedAudio = audioCache.getCachedAudio(cacheKey, textForAudio);
      
      if (cachedAudio) {
        setAudioBlob(cachedAudio);
        onAudioChange?.(cachedAudio, languageCode);
        console.log('Using cached audio for language:', languageCode);
        return;
      }

      // Generate new audio
      const audioBlob = await generateSpeech(textForAudio, languageInfo.voiceId);
      
      // Cache the audio
      audioCache.setCachedAudio(cacheKey, textForAudio, audioBlob);
      
      setAudioBlob(audioBlob);
      onAudioChange?.(audioBlob, languageCode);
    } catch (err) {
      console.error('Error generating audio:', err);
      setError('Failed to generate audio. Please check your ElevenLabs configuration.');
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const selectedLangInfo = translationService.getLanguageInfo(selectedLanguage);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
        disabled={isTranslating || isGeneratingAudio}
      >
        <Globe className="h-4 w-4 text-slate-600" />
        <span className="text-sm font-medium">
          {selectedLangInfo?.flag} {selectedLangInfo?.nativeName}
        </span>
        {(isTranslating || isGeneratingAudio) ? (
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
        ) : (
          <ChevronDown className={`h-4 w-4 text-slate-600 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-slate-500 px-2 py-1 mb-2">
              Select Language
            </div>
            {SUPPORTED_LANGUAGES.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageSelect(language.code)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left hover:bg-slate-100 transition-colors ${
                  selectedLanguage === language.code ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                }`}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs text-slate-500">{language.name}</div>
                </div>
                {language.voiceId && (
                  <Volume2 className="h-3 w-3 text-slate-400" title="Voice available" />
                )}
                {selectedLanguage === language.code && (
                  <CheckCircle className="h-4 w-4 text-blue-600" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Status Messages */}
      {isTranslating && (
        <div className="mt-2 text-sm text-blue-600 flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Translating content...</span>
        </div>
      )}

      {isGeneratingAudio && (
        <div className="mt-2 text-sm text-purple-600 flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Generating audio...</span>
        </div>
      )}

      {error && (
        <div className="mt-2 text-sm text-red-600 flex items-center space-x-2">
          <span>{error}</span>
        </div>
      )}

      {translations && selectedLanguage !== 'en' && !isTranslating && (
        <div className="mt-2 text-sm text-emerald-600 flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>Content translated to {selectedLangInfo?.nativeName}</span>
        </div>
      )}
    </div>
  );
};
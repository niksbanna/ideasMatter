import React, { useState } from 'react';
import { Languages, Volume2, Play, Pause, Eye, EyeOff } from 'lucide-react';
import { type Translation } from '../services/translation';

interface TranslatedContentProps {
  originalTitle: string;
  originalDescription: string;
  translations: { title: Translation; description: Translation };
  audioBlob: Blob | null;
  language: string;
  languageFlag: string;
  languageName: string;
}

export const TranslatedContent: React.FC<TranslatedContentProps> = ({
  originalTitle,
  originalDescription,
  translations,
  audioBlob,
  language,
  languageFlag,
  languageName
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio] = useState(() => audioBlob ? new Audio(URL.createObjectURL(audioBlob)) : null);

  React.useEffect(() => {
    if (audio) {
      audio.addEventListener('ended', () => setIsPlaying(false));
      return () => {
        audio.removeEventListener('ended', () => setIsPlaying(false));
        audio.pause();
        URL.revokeObjectURL(audio.src);
      };
    }
  }, [audio]);

  const toggleAudio = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 rounded-full p-2">
            <Languages className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 flex items-center space-x-2">
              <span>{languageFlag}</span>
              <span>Translated to {languageName}</span>
            </h3>
            <p className="text-sm text-slate-600">AI-powered translation</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {audioBlob && (
            <button
              onClick={toggleAudio}
              className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              <Volume2 className="h-4 w-4" />
              <span>{isPlaying ? 'Pause' : 'Listen'}</span>
            </button>
          )}
          
          <button
            onClick={() => setShowOriginal(!showOriginal)}
            className="flex items-center space-x-2 bg-slate-600 hover:bg-slate-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
          >
            {showOriginal ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span>{showOriginal ? 'Hide' : 'Show'} Original</span>
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Translated Content */}
        <div className="bg-white rounded-lg p-4 border border-blue-200">
          <h4 className="text-lg font-bold text-slate-900 mb-3">
            {translations.title.translatedText}
          </h4>
          <p className="text-slate-700 leading-relaxed">
            {translations.description.translatedText}
          </p>
        </div>

        {/* Original Content (Collapsible) */}
        {showOriginal && (
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-sm font-medium text-slate-600">Original (English):</span>
            </div>
            <h4 className="text-lg font-bold text-slate-700 mb-3">
              {originalTitle}
            </h4>
            <p className="text-slate-600 leading-relaxed">
              {originalDescription}
            </p>
          </div>
        )}
      </div>

      {/* Translation Info */}
      <div className="mt-4 pt-4 border-t border-blue-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Powered by Google Gemini AI</span>
          <span>
            {audioBlob ? `Audio: ElevenLabs ${languageName} Voice` : 'Text translation only'}
          </span>
        </div>
      </div>
    </div>
  );
};
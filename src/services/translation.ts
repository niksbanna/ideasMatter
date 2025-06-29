// Translation service with caching and language detection
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Translation {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  timestamp: number;
}

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  voiceId?: string; // ElevenLabs voice ID for this language
}

// Supported languages with ElevenLabs voice IDs
export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸', voiceId: 'pNInz6obpgDQGcFmaJgB' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', voiceId: 'VR6AewLTigWG4xSOukaG' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', voiceId: 'XB0fDUnXU5powFXDhCwa' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', voiceId: 'ErXwobaYiN019PkySvjV' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', voiceId: 'AZnzlk1XvdvUeBnXmlld' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', voiceId: 'yoZ06aMxZJJ28mfd3POQ' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', voiceId: 'bVMeCyTHy58xNoL34h3p' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', voiceId: 'PCigumGleR5JuwdMBtYy' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', voiceId: 'Xb7hH8MSUJpSbSDYk0k2' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳', voiceId: 'onwK4e9ZLuTAKqWW03F9' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', voiceId: 'D38z5RcWu1voky8WS1ja' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', voiceId: 'SOYHLrjzK2X1ezoPC6cr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', voiceId: 'JBFqnCBsd6RMkjVDRZzb' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', voiceId: 'M2FncmNKrTA2aiNE8N5a' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', voiceId: 'Ra8qVsM2qJNebGlmn1Q6' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰', voiceId: 'OpQXqPgqC0E5KeDNHKPe' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮', voiceId: 'gA7A3Ow6DkqRA3kqm2Jt' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', voiceId: 'EXAVITQu4vr4xnSDxMaL' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', voiceId: 'wpfLlRqy3jVcBcClCkVK' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', voiceId: 'a0KkVfGWsXXpYFUkgUXG' }
];

class TranslationService {
  private genAI: GoogleGenerativeAI | null = null;
  private cache = new Map<string, Translation>();
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  // Detect browser language and return best match
  detectBrowserLanguage(): string {
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Check if we support this language
    const supported = SUPPORTED_LANGUAGES.find(lang => lang.code === langCode);
    return supported ? langCode : 'en';
  }

  // Generate cache key for translation
  private generateCacheKey(text: string, targetLang: string): string {
    const textHash = this.hashString(text);
    return `${textHash}_${targetLang}`;
  }

  // Simple hash function for cache keys
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  // Check if translation is cached and valid
  getCachedTranslation(text: string, targetLang: string): Translation | null {
    const cacheKey = this.generateCacheKey(text, targetLang);
    const cached = this.cache.get(cacheKey);

    if (!cached) return null;

    // Check if cache is expired
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(cacheKey);
      return null;
    }

    return cached;
  }

  // Cache translation
  setCachedTranslation(translation: Translation): void {
    const cacheKey = this.generateCacheKey(translation.originalText, translation.targetLanguage);
    this.cache.set(cacheKey, translation);
  }

  // Translate text using Gemini AI
  async translateText(text: string, targetLanguage: string, sourceLanguage: string = 'auto'): Promise<Translation> {
    // Check cache first
    const cached = this.getCachedTranslation(text, targetLanguage);
    if (cached) {
      console.log('Translation cache hit');
      return cached;
    }

    if (!this.genAI) {
      throw new Error('Translation service not configured. Please set VITE_GEMINI_API_KEY.');
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.3, // Lower temperature for more consistent translations
        }
      });

      const targetLangInfo = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
      const targetLangName = targetLangInfo?.name || targetLanguage;

      const prompt = `
        Translate the following text to ${targetLangName}. 
        
        IMPORTANT RULES:
        1. Provide ONLY the translation, no explanations or additional text
        2. Maintain the original meaning and tone
        3. Keep proper nouns (like "IdeasMatter") unchanged
        4. Preserve formatting and structure
        5. If the text is already in ${targetLangName}, return it unchanged
        
        Text to translate: "${text}"
        
        Translation:
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const translatedText = response.text().trim();

      // Remove any quotes or extra formatting
      const cleanTranslation = translatedText.replace(/^["']|["']$/g, '');

      const translation: Translation = {
        originalText: text,
        translatedText: cleanTranslation,
        sourceLanguage: sourceLanguage,
        targetLanguage: targetLanguage,
        timestamp: Date.now()
      };

      // Cache the translation
      this.setCachedTranslation(translation);

      return translation;
    } catch (error) {
      console.error('Error translating text:', error);
      throw new Error('Failed to translate text');
    }
  }

  // Translate proposal content (title + description)
  async translateProposal(title: string, description: string, targetLanguage: string): Promise<{
    title: Translation;
    description: Translation;
  }> {
    const [titleTranslation, descriptionTranslation] = await Promise.all([
      this.translateText(title, targetLanguage),
      this.translateText(description, targetLanguage)
    ]);

    return {
      title: titleTranslation,
      description: descriptionTranslation
    };
  }

  // Get language info by code
  getLanguageInfo(code: string): LanguageOption | undefined {
    return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
  }

  // Clear expired cache entries
  clearExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, translation] of this.cache.entries()) {
      if (now - translation.timestamp > this.CACHE_DURATION) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleared ${expiredKeys.length} expired translation cache entries`);
    }
  }

  // Get cache statistics
  getCacheStats(): { size: number; entries: Array<{ text: string; language: string; age: string }> } {
    const entries = Array.from(this.cache.values()).map(translation => ({
      text: translation.originalText.substring(0, 50) + '...',
      language: translation.targetLanguage,
      age: this.formatAge(Date.now() - translation.timestamp)
    }));

    return {
      size: this.cache.size,
      entries
    };
  }

  private formatAge(ageMs: number): string {
    const minutes = Math.floor(ageMs / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  }
}

// Export singleton instance
export const translationService = new TranslationService();

// Initialize cache cleanup
if (typeof window !== 'undefined') {
  // Clear expired cache on page load
  translationService.clearExpiredCache();
  
  // Set up periodic cleanup every hour
  setInterval(() => {
    translationService.clearExpiredCache();
  }, 60 * 60 * 1000);
}
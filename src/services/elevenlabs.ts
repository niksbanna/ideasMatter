// ElevenLabs Text-to-Speech Service with multi-language support
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1';

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface TTSRequest {
  text: string;
  voice_id?: string;
  model_id?: string;
  voice_settings?: VoiceSettings;
}

// Language-specific voice configurations
export const LANGUAGE_VOICES: Record<string, { voiceId: string; modelId: string; name: string }> = {
  'en': { voiceId: 'pNInz6obpgDQGcFmaJgB', modelId: 'eleven_monolingual_v1', name: 'Adam (English)' },
  'es': { voiceId: 'VR6AewLTigWG4xSOukaG', modelId: 'eleven_multilingual_v2', name: 'Valentino (Spanish)' },
  'fr': { voiceId: 'XB0fDUnXU5powFXDhCwa', modelId: 'eleven_multilingual_v2', name: 'Charlotte (French)' },
  'de': { voiceId: 'ErXwobaYiN019PkySvjV', modelId: 'eleven_multilingual_v2', name: 'Klaus (German)' },
  'it': { voiceId: 'AZnzlk1XvdvUeBnXmlld', modelId: 'eleven_multilingual_v2', name: 'Giulia (Italian)' },
  'pt': { voiceId: 'yoZ06aMxZJJ28mfd3POQ', modelId: 'eleven_multilingual_v2', name: 'Rodrigo (Portuguese)' },
  'ru': { voiceId: 'bVMeCyTHy58xNoL34h3p', modelId: 'eleven_multilingual_v2', name: 'Viktor (Russian)' },
  'ja': { voiceId: 'PCigumGleR5JuwdMBtYy', modelId: 'eleven_multilingual_v2', name: 'Akira (Japanese)' },
  'ko': { voiceId: 'Xb7hH8MSUJpSbSDYk0k2', modelId: 'eleven_multilingual_v2', name: 'Min-jun (Korean)' },
  'zh': { voiceId: 'onwK4e9ZLuTAKqWW03F9', modelId: 'eleven_multilingual_v2', name: 'Wei (Chinese)' },
  'ar': { voiceId: 'D38z5RcWu1voky8WS1ja', modelId: 'eleven_multilingual_v2', name: 'Omar (Arabic)' },
  'hi': { voiceId: 'SOYHLrjzK2X1ezoPC6cr', modelId: 'eleven_multilingual_v2', name: 'Arjun (Hindi)' },
  'nl': { voiceId: 'JBFqnCBsd6RMkjVDRZzb', modelId: 'eleven_multilingual_v2', name: 'Lars (Dutch)' },
  'sv': { voiceId: 'M2FncmNKrTA2aiNE8N5a', modelId: 'eleven_multilingual_v2', name: 'Erik (Swedish)' },
  'no': { voiceId: 'Ra8qVsM2qJNebGlmn1Q6', modelId: 'eleven_multilingual_v2', name: 'Magnus (Norwegian)' },
  'da': { voiceId: 'OpQXqPgqC0E5KeDNHKPe', modelId: 'eleven_multilingual_v2', name: 'Mikkel (Danish)' },
  'fi': { voiceId: 'gA7A3Ow6DkqRA3kqm2Jt', modelId: 'eleven_multilingual_v2', name: 'Aino (Finnish)' },
  'pl': { voiceId: 'EXAVITQu4vr4xnSDxMaL', modelId: 'eleven_multilingual_v2', name: 'Jakub (Polish)' },
  'tr': { voiceId: 'wpfLlRqy3jVcBcClCkVK', modelId: 'eleven_multilingual_v2', name: 'Emre (Turkish)' },
  'uk': { voiceId: 'a0KkVfGWsXXpYFUkgUXG', modelId: 'eleven_multilingual_v2', name: 'Oleksandr (Ukrainian)' }
};

export const generateSpeech = async (
  text: string,
  voiceId?: string,
  apiKey?: string,
  languageCode?: string
): Promise<Blob> => {
  try {
    const API_KEY = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    // Determine voice and model based on language or use provided voiceId
    let finalVoiceId = voiceId;
    let modelId = 'eleven_monolingual_v1';

    if (languageCode && LANGUAGE_VOICES[languageCode]) {
      const langConfig = LANGUAGE_VOICES[languageCode];
      finalVoiceId = langConfig.voiceId;
      modelId = langConfig.modelId;
    } else if (!finalVoiceId) {
      // Default to English voice
      finalVoiceId = LANGUAGE_VOICES['en'].voiceId;
    }

    // Optimize voice settings based on language
    const voiceSettings: VoiceSettings = {
      stability: languageCode === 'en' ? 0.5 : 0.6, // Slightly more stable for non-English
      similarity_boost: languageCode === 'en' ? 0.5 : 0.7, // Higher similarity for accented languages
      style: 0.0,
      use_speaker_boost: true,
    };

    const response = await fetch(`${ELEVENLABS_API_URL}/text-to-speech/${finalVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': API_KEY,
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: voiceSettings,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorData.detail || 'Unknown error'}`);
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw new Error('Failed to generate speech audio');
  }
};

export const getAvailableVoices = async (apiKey?: string): Promise<any[]> => {
  try {
    const API_KEY = apiKey || import.meta.env.VITE_ELEVENLABS_API_KEY;
    
    if (!API_KEY) {
      throw new Error('ElevenLabs API key not configured');
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/voices`, {
      headers: {
        'xi-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch voices: ${response.status}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
};

export const formatTextForSpeech = (policyContent: any): string => {
  const { problem, solution, impact, implementation } = policyContent;
  
  return `
    Policy Proposal Overview.
    
    Problem Statement: ${problem}
    
    Proposed Solution: ${solution}
    
    Expected Impact: ${impact}
    
    Implementation Plan: ${implementation}
  `.trim();
};

// Get voice information for a specific language
export const getVoiceForLanguage = (languageCode: string): { voiceId: string; modelId: string; name: string } | null => {
  return LANGUAGE_VOICES[languageCode] || null;
};

// Check if a language is supported for voice generation
export const isLanguageSupported = (languageCode: string): boolean => {
  return languageCode in LANGUAGE_VOICES;
};

// Get all supported languages for voice generation
export const getSupportedLanguages = (): string[] => {
  return Object.keys(LANGUAGE_VOICES);
};
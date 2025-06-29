// Tavus AI Video Generation Service
const TAVUS_API_URL = 'https://tavusapi.com/v2';

export interface VideoGenerationRequest {
  script: string;
  replica_id?: string;
  video_name?: string;
  callback_url?: string;
}

export interface VideoGenerationResponse {
  video_id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  video_url?: string;
  download_url?: string;
  created_at: string;
}

export const generateExplainerVideo = async (
  script: string,
  replicaId?: string,
  apiKey?: string
): Promise<VideoGenerationResponse> => {
  try {
    const API_KEY = apiKey || import.meta.env.VITE_TAVUS_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${TAVUS_API_URL}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify({
        script: script,
        replica_id: replicaId || import.meta.env.VITE_TAVUS_DEFAULT_REPLICA_ID,
        video_name: `Policy Explainer - ${Date.now()}`,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = `Tavus API error: ${response.status} - ${errorData.message || 'Unknown error'}`;
      console.error('Tavus API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        errorData,
        url: `${TAVUS_API_URL}/videos`
      });
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error generating video:', error);
    // Preserve the original error message for better debugging
    throw error;
  }
};

export const getVideoStatus = async (
  videoId: string,
  apiKey?: string
): Promise<VideoGenerationResponse> => {
  try {
    const API_KEY = apiKey || import.meta.env.VITE_TAVUS_API_KEY;
    
    if (!API_KEY) {
      throw new Error('Tavus API key not configured');
    }

    const response = await fetch(`${TAVUS_API_URL}/videos/${videoId}`, {
      headers: {
        'x-api-key': API_KEY,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = `Failed to get video status: ${response.status} - ${errorData.message || 'Unknown error'}`;
      console.error('Tavus Video Status Error:', {
        videoId,
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error('Error getting video status:', error);
    // Preserve the original error message
    throw error;
  }
};

export const generateVideoScript = async (policyContent: any): Promise<string> => {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  try {
    const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
      Create a compelling 20-second video script for a policy explainer video based on this policy proposal:
      
      Problem: ${policyContent.problem}
      Solution: ${policyContent.solution}
      Impact: ${policyContent.impact}
      Implementation: ${policyContent.implementation}
      
      Requirements:
      - Keep it under 120 words (20 seconds when spoken)
      - Make it engaging and easy to understand
      - Focus on the key benefits and impact
      - Use conversational, accessible language
      - Include a clear call-to-action to vote
      - Structure it as a natural speaking script
      - Be concise and direct
      
      Format as plain text without any special formatting or stage directions.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating video script:', error);
    // Fallback script - shorter and more concise
    return `This policy proposal addresses a key community issue with a practical solution. The benefits are clear and implementation is straightforward. Your vote can help make this positive change happen. Cast your vote today and be part of the solution.`;
  }
};
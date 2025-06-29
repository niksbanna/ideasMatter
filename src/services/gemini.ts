import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI - You'll need to set your API key
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

export interface PolicyDraft {
  problem: string;
  solution: string;
  impact: string;
  implementation: string;
}

export interface SocialContent {
  linkedin: {
    title: string;
    description: string;
    hashtags: string[];
  };
  twitter: {
    title: string;
    description: string;
    hashtags: string[];
  };
  instagram: {
    title: string;
    description: string;
    hashtags: string[];
  };
}

export const generatePolicyDraft = async (title: string, description: string): Promise<PolicyDraft> => {
  try {
    // Check if API key is configured
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env file.');
    }

    // Use the updated model name from your curl example
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 1000, // Limit response length
        temperature: 0.7,
      }
    });

    const prompt = `
      Create a concise policy proposal for: "${title}"
      Description: ${description}
      
      Respond with ONLY a valid JSON object containing exactly these 4 fields:
      - problem: Brief problem description (max 200 words)
      - solution: Proposed solution (max 200 words)  
      - impact: Expected benefits (max 150 words)
      - implementation: Implementation steps (max 150 words)
      
      Example format:
      {"problem":"Brief problem statement...","solution":"Proposed solution...","impact":"Expected benefits...","implementation":"Implementation steps..."}
      
      Do not include any other text, formatting, or explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response - remove any markdown, code blocks, or extra text
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    text = text.replace(/^[^{]*/, ''); // Remove any text before the first {
    text = text.replace(/[^}]*$/, ''); // Remove any text after the last }
    
    // Find the JSON object in the response
    const jsonMatch = text.match(/\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    // Additional cleanup for malformed responses
    if (text.startsWith('": {')) {
      text = '{' + text;
    }
    
    try {
      const parsed = JSON.parse(text);
      
      // Validate that all required fields are present and not empty
      const requiredFields = ['problem', 'solution', 'impact', 'implementation'];
      const isValid = requiredFields.every(field => 
        parsed[field] && 
        typeof parsed[field] === 'string' && 
        parsed[field].trim().length > 10 && // Minimum meaningful length
        parsed[field].trim().length < 1000 && // Maximum length check
        !parsed[field].toLowerCase().includes('please try again') &&
        !parsed[field].toLowerCase().includes('not available')
      );
      
      if (!isValid) {
        console.warn('Generated content failed validation, using fallback');
        return generateFallbackPolicy(title, description);
      }
      
      return {
        problem: cleanText(parsed.problem),
        solution: cleanText(parsed.solution),
        impact: cleanText(parsed.impact),
        implementation: cleanText(parsed.implementation)
      };
    } catch (parseError) {
      console.warn('Failed to parse JSON response from Gemini:', text.substring(0, 200) + '...');
      
      // Try to extract content manually if JSON parsing fails
      const sections = extractSectionsFromText(text);
      if (sections) {
        return sections;
      }
      
      // If all else fails, generate a structured response based on the input
      return generateFallbackPolicy(title, description);
    }
  } catch (error) {
    console.error('Error generating policy draft:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw error; // Re-throw API key errors as-is
      } else if (error.message.includes('404')) {
        throw new Error('Gemini API endpoint not found. Please check your API configuration.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Invalid Gemini API key. Please check your VITE_GEMINI_API_KEY in the .env file.');
      } else if (error.message.includes('429')) {
        throw new Error('Gemini API rate limit exceeded. Please try again later.');
      } else {
        throw new Error(`Failed to generate policy draft: ${error.message}`);
      }
    } else {
      throw new Error('Failed to generate policy draft. Please check your API configuration.');
    }
  }
};

export const generateSocialContent = async (proposal: {
  title: string;
  description: string;
  category: string;
  author_name: string;
}): Promise<SocialContent> => {
  try {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      throw new Error('Gemini API key is not configured');
    }

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.8,
      }
    });

    const prompt = `
      Create optimized social media content for sharing this policy proposal:
      
      Title: "${proposal.title}"
      Description: "${proposal.description}"
      Category: "${proposal.category}"
      Author: "${proposal.author_name}"
      
      Generate platform-specific content with these requirements:
      
      LinkedIn (Professional):
      - Title: Professional, thought-provoking (max 100 chars)
      - Description: Detailed, professional tone, encourages discussion (max 300 chars)
      - Hashtags: 5-7 professional hashtags including category-specific ones
      
      Twitter/X (Concise):
      - Title: Catchy, brief (max 50 chars)
      - Description: Engaging, action-oriented with emojis (max 200 chars)
      - Hashtags: 3-5 trending hashtags
      
      Instagram (Visual/Engaging):
      - Title: Inspiring, visual (max 60 chars)
      - Description: Inspiring, community-focused with emojis (max 250 chars)
      - Hashtags: 8-12 popular hashtags including lifestyle ones
      
      Respond with ONLY a valid JSON object:
      {
        "linkedin": {
          "title": "...",
          "description": "...",
          "hashtags": ["#tag1", "#tag2", ...]
        },
        "twitter": {
          "title": "...",
          "description": "...",
          "hashtags": ["#tag1", "#tag2", ...]
        },
        "instagram": {
          "title": "...",
          "description": "...",
          "hashtags": ["#tag1", "#tag2", ...]
        }
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().trim();
    
    // Clean up the response
    text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    text = text.replace(/^[^{]*/, '');
    text = text.replace(/[^}]*$/, '');
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      text = jsonMatch[0];
    }
    
    try {
      const parsed = JSON.parse(text);
      
      // Validate structure
      if (parsed.linkedin && parsed.twitter && parsed.instagram) {
        return parsed;
      } else {
        throw new Error('Invalid structure');
      }
    } catch (parseError) {
      console.warn('Failed to parse social content, using fallback');
      return generateFallbackSocialContent(proposal);
    }
  } catch (error) {
    console.error('Error generating social content:', error);
    return generateFallbackSocialContent(proposal);
  }
};

const generateFallbackSocialContent = (proposal: {
  title: string;
  description: string;
  category: string;
  author_name: string;
}): SocialContent => {
  const categoryTag = `#${proposal.category.replace(/\s+/g, '')}`;
  
  return {
    linkedin: {
      title: `Policy Innovation: ${proposal.title.substring(0, 80)}`,
      description: `Exploring ${proposal.category.toLowerCase()} solutions with this thoughtful proposal by ${proposal.author_name}. What's your perspective on this approach to policy innovation?`,
      hashtags: ['#PolicyInnovation', '#PublicPolicy', '#CivicEngagement', categoryTag, '#Leadership', '#SocialImpact', '#Democracy']
    },
    twitter: {
      title: proposal.title.substring(0, 50),
      description: `💡 Fresh ${proposal.category.toLowerCase()} policy idea by ${proposal.author_name}! Join the conversation 🗳️`,
      hashtags: ['#PolicyProposal', '#CivicTech', categoryTag, '#Democracy', '#Innovation']
    },
    instagram: {
      title: `Change Starts Here`,
      description: `🏛️ Making democracy accessible! Check out this ${proposal.category.toLowerCase()} proposal. Every voice matters in shaping our future! 💪✨`,
      hashtags: ['#PolicyProposal', '#CivicEngagement', '#Democracy', '#MakeADifference', '#YourVoiceMatters', categoryTag, '#PublicPolicy', '#SocialChange', '#Community', '#Innovation', '#Future', '#Empowerment']
    }
  };
};

// Helper function to clean text content
const cleanText = (text: string): string => {
  return text
    .trim()
    .replace(/^\*\*|\*\*$/g, '') // Remove bold markdown
    .replace(/^\*|\*$/g, '') // Remove italic markdown
    .replace(/\n\s*\n/g, '\n') // Remove extra line breaks
    .substring(0, 800); // Limit length
};

// Helper function to extract sections from non-JSON text
const extractSectionsFromText = (text: string): PolicyDraft | null => {
  try {
    const problemMatch = text.match(/(?:problem|PROBLEM)[":\s]*(.*?)(?=(?:solution|SOLUTION|impact|IMPACT|implementation|IMPLEMENTATION|$))/is);
    const solutionMatch = text.match(/(?:solution|SOLUTION)[":\s]*(.*?)(?=(?:impact|IMPACT|implementation|IMPLEMENTATION|$))/is);
    const impactMatch = text.match(/(?:impact|IMPACT)[":\s]*(.*?)(?=(?:implementation|IMPLEMENTATION|$))/is);
    const implementationMatch = text.match(/(?:implementation|IMPLEMENTATION)[":\s]*(.*?)$/is);
    
    if (problemMatch && solutionMatch && impactMatch && implementationMatch) {
      return {
        problem: cleanText(problemMatch[1]),
        solution: cleanText(solutionMatch[1]),
        impact: cleanText(impactMatch[1]),
        implementation: cleanText(implementationMatch[1])
      };
    }
  } catch (error) {
    console.warn('Failed to extract sections from text:', error);
  }
  return null;
};

// Fallback policy generator with concise content
const generateFallbackPolicy = (title: string, description: string): PolicyDraft => {
  return {
    problem: `The issue of "${title}" presents significant challenges that require immediate attention. ${description.substring(0, 200)}... This situation affects our community and needs a structured policy response to ensure effective resolution.`,
    
    solution: `To address "${title}", we propose implementing a comprehensive policy framework that establishes clear guidelines, allocates resources effectively, and creates accountability mechanisms. This solution will provide structured approaches to tackle the core issues while ensuring sustainable outcomes.`,
    
    impact: `Implementation of this policy will result in measurable improvements including enhanced efficiency, better resource allocation, and positive community outcomes. Stakeholders will benefit from clear direction and established goals that can be tracked and evaluated over time.`,
    
    implementation: `The policy will be implemented in three phases over 12 months: Phase 1 - Framework establishment and approval (months 1-3), Phase 2 - Stakeholder engagement and resource allocation (months 4-8), Phase 3 - Full rollout with monitoring systems (months 9-12).`
  };
};
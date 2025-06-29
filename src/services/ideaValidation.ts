// AI-powered idea validation service - Updated to be more lenient
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ValidationResult {
  isValid: boolean;
  score: number; // 0-100, higher is better
  reasons: string[];
  category: 'approved' | 'rejected' | 'needs_review';
  feedback?: string;
}

export interface ValidationCriteria {
  ethical: boolean;
  appropriate: boolean;
  constructive: boolean;
  relevant: boolean;
  respectful: boolean;
}

class IdeaValidationService {
  private genAI: GoogleGenerativeAI | null = null;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (apiKey && apiKey !== 'your_gemini_api_key_here') {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }

  async validateIdea(title: string, description: string, category: string): Promise<ValidationResult> {
    if (!this.genAI) {
      // Fallback validation when AI is not available
      return this.performBasicValidation(title, description);
    }

    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash',
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.2, // Lower temperature for more consistent validation
        }
      });

      const prompt = `
        You are an AI content moderator for IdeasMatter, a platform where people share all kinds of ideas - from silly questions to serious policy proposals. Your job is to be VERY LENIENT and only reject content that is clearly harmful or inappropriate.

        IMPORTANT: You should APPROVE most content, including:
        - Silly or fun questions (like "Is cereal soup?")
        - Simple opinions or preferences
        - Casual discussions about any topic
        - Creative or unusual ideas
        - Questions that might seem trivial
        - Personal experiences or stories
        - Product suggestions or reviews
        - Entertainment discussions

        ONLY REJECT content that is clearly:
        - Hate speech targeting specific groups
        - Explicit sexual content
        - Promoting violence or illegal activities
        - Spam or completely nonsensical
        - Personal attacks or harassment
        - Dangerous misinformation that could cause harm

        CONTENT TO EVALUATE:
        Title: "${title}"
        Description: "${description}"
        Category: "${category}"

        RESPOND WITH ONLY A VALID JSON OBJECT:
        {
          "isValid": boolean,
          "score": number (0-100),
          "criteria": {
            "ethical": boolean,
            "appropriate": boolean,
            "constructive": boolean,
            "relevant": boolean,
            "respectful": boolean
          },
          "category": "approved" | "rejected" | "needs_review",
          "reasons": ["reason1", "reason2", ...],
          "feedback": "Brief explanation for the decision"
        }

        SCORING GUIDE (BE GENEROUS):
        - 90-100: Great content, clearly appropriate
        - 80-89: Good content, minor concerns but still fine
        - 70-79: Acceptable content, some issues but not problematic
        - 50-69: Borderline content, might need review but probably okay
        - 30-49: Problematic content with significant issues
        - 0-29: Clearly inappropriate, must be rejected

        APPROVAL THRESHOLD: Score >= 50 (much lower than before)

        REJECTION CRITERIA (VERY STRICT - only reject if clearly harmful):
        - Explicit hate speech with slurs or calls for violence
        - Graphic sexual content or pornography
        - Detailed instructions for illegal activities
        - Direct threats or harassment of individuals
        - Dangerous misinformation (like fake medical advice)
        - Obvious spam with no meaningful content

        REMEMBER: When in doubt, APPROVE the content. It's better to allow silly or unusual ideas than to suppress legitimate expression.
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
        
        // Validate the response structure
        if (this.isValidResponse(parsed)) {
          return {
            isValid: parsed.isValid && parsed.score >= 50, // Much lower threshold
            score: parsed.score,
            reasons: parsed.reasons || [],
            category: parsed.category,
            feedback: parsed.feedback
          };
        } else {
          console.warn('Invalid AI validation response structure');
          return this.performBasicValidation(title, description);
        }
      } catch (parseError) {
        console.warn('Failed to parse AI validation response');
        return this.performBasicValidation(title, description);
      }
    } catch (error) {
      console.error('Error in AI validation:', error);
      return this.performBasicValidation(title, description);
    }
  }

  private isValidResponse(response: any): boolean {
    return (
      typeof response === 'object' &&
      typeof response.isValid === 'boolean' &&
      typeof response.score === 'number' &&
      Array.isArray(response.reasons) &&
      ['approved', 'rejected', 'needs_review'].includes(response.category)
    );
  }

  private performBasicValidation(title: string, description: string): ValidationResult {
    const content = `${title} ${description}`.toLowerCase();
    
    // Only check for clearly inappropriate content
    const severelyInappropriateKeywords = [
      // Explicit hate speech
      'kill all', 'murder all', 'genocide', 'ethnic cleansing',
      // Explicit sexual content
      'porn', 'xxx', 'sexual explicit', 'nude pics',
      // Direct threats
      'i will kill', 'going to murder', 'bomb threat',
      // Obvious spam
      'click here now', 'buy viagra', 'get rich quick scheme'
    ];

    const foundSevereIssues = severelyInappropriateKeywords.filter(keyword => 
      content.includes(keyword)
    );

    // Check for minimum content quality
    const hasMinimumLength = title.length >= 3 && description.length >= 10;
    const hasReasonableContent = /[a-zA-Z]/.test(content); // Contains letters
    
    let score = 85; // Start with a high score (much more lenient)
    const reasons: string[] = [];

    // Only deduct points for severe issues
    if (foundSevereIssues.length > 0) {
      score -= 60;
      reasons.push('Contains clearly inappropriate or harmful content');
    }

    if (!hasMinimumLength) {
      score -= 15; // Reduced penalty
      reasons.push('Content is too brief');
    }

    if (!hasReasonableContent) {
      score -= 25; // Reduced penalty
      reasons.push('Content appears to be spam or nonsensical');
    }

    // Add points for any positive indicators
    if (content.includes('?')) {
      score += 5; // Questions are good
    }

    if (content.includes('idea') || content.includes('think') || content.includes('opinion')) {
      score += 5; // Opinion sharing is good
    }

    // Be much more lenient - only reject if there are severe issues AND low score
    const isValid = score >= 50 && foundSevereIssues.length === 0;
    
    return {
      isValid,
      score: Math.max(0, Math.min(100, score)),
      reasons: reasons.length > 0 ? reasons : ['Content reviewed and approved'],
      category: isValid ? 'approved' : (score >= 30 ? 'needs_review' : 'rejected'),
      feedback: isValid 
        ? 'Content meets community standards'
        : foundSevereIssues.length > 0 
          ? 'Content contains inappropriate material that violates community guidelines'
          : 'Content needs minor improvements but can be shared'
    };
  }

  // Additional validation for specific content types (more lenient)
  validateForHateSpeech(content: string): boolean {
    const hateSpeechPatterns = [
      /\b(kill|murder|genocide)\s+(all|every)\s*(people|person|group|race)/i,
      /\b(should\s+)?(die|burn|suffer)\s+(all|every)/i,
      /\b(inferior|superior)\s+(race|people|group)\s+(should|must|need)/i
    ];

    return !hateSpeechPatterns.some(pattern => pattern.test(content));
  }

  validateForSpam(title: string, description: string): boolean {
    const spamIndicators = [
      /click\s+here\s+now/i,
      /buy\s+now\s+limited/i,
      /free\s+money\s+guaranteed/i,
      /\$\d+.*\$\d+.*\$\d+/g, // Multiple dollar amounts
      /(www\.|http).*\.(com|net|org).*buy/i // URLs with buy
    ];

    const content = `${title} ${description}`;
    const spamCount = spamIndicators.reduce((count, pattern) => {
      const matches = content.match(pattern);
      return count + (matches ? matches.length : 0);
    }, 0);

    return spamCount < 2; // Allow some commercial language
  }

  // Generate improvement suggestions for rejected ideas (more helpful)
  generateImprovementSuggestions(validationResult: ValidationResult): string[] {
    const suggestions: string[] = [];

    if (!validationResult.isValid) {
      if (validationResult.reasons.includes('Contains clearly inappropriate or harmful content')) {
        suggestions.push('Remove any offensive, harmful, or inappropriate language');
        suggestions.push('Focus on constructive discussion and respectful communication');
      }

      if (validationResult.reasons.includes('Content is too brief')) {
        suggestions.push('Add more detail to help others understand your idea');
        suggestions.push('Explain why this topic interests you or why it matters');
      }

      if (validationResult.reasons.includes('Content appears to be spam or nonsensical')) {
        suggestions.push('Write a clear, coherent idea or question');
        suggestions.push('Make sure your content is meaningful and relevant');
      }
    }

    // Add general improvement suggestions for lower scores
    if (validationResult.score < 70) {
      suggestions.push('Consider adding more context or background information');
      suggestions.push('Explain what you hope to learn or discuss');
    }

    // If no specific issues, provide encouraging feedback
    if (suggestions.length === 0) {
      suggestions.push('Your idea looks good! Consider adding more details to spark discussion');
      suggestions.push('Think about what aspects of this topic you find most interesting');
    }

    return suggestions;
  }
}

export const ideaValidationService = new IdeaValidationService();
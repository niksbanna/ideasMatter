import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface Report {
  id: string;
  idea_id: string;
  user_id: string;
  report_text: string;
  status: 'pending' | 'reviewed' | 'resolved';
  ai_decision?: 'BLOCK' | 'ALLOW';
  created_at: string;
  updated_at: string;
}

export const submitReport = async (ideaId: string, reportText: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to submit reports');
  }

  try {
    // Step 1: Save the report to database
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert([{
        idea_id: ideaId,
        user_id: user.id,
        report_text: reportText,
        status: 'pending'
      }])
      .select('id')
      .single();

    if (reportError) {
      throw new Error(`Failed to submit report: ${reportError.message}`);
    }

    // Step 2: Get the idea content for AI moderation
    const { data: ideaData, error: ideaError } = await supabase
      .from('proposals')
      .select('title, description, status')
      .eq('id', ideaId)
      .single();

    if (ideaError) {
      console.error('Error fetching idea for moderation:', ideaError);
      return; // Report was saved, but we can't moderate
    }

    // Step 3: Send to AI for moderation
    try {
      const aiDecision = await moderateContent(ideaData.title, ideaData.description, reportText);
      
      // Step 4: Update report with AI decision
      await supabase
        .from('reports')
        .update({ ai_decision: aiDecision })
        .eq('id', reportData.id);

      // Step 5: If AI decides to block, hide the content
      if (aiDecision === 'BLOCK') {
        await supabase
          .from('proposals')
          .update({ status: 'hidden' })
          .eq('id', ideaId);
      }
    } catch (aiError) {
      console.error('Error in AI moderation:', aiError);
      // Report was still saved successfully
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    throw error;
  }
};

const moderateContent = async (title: string, description: string, reportText: string): Promise<'BLOCK' | 'ALLOW'> => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    console.warn('Gemini API not configured, defaulting to ALLOW');
    return 'ALLOW';
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        maxOutputTokens: 100,
        temperature: 0.1, // Very low temperature for consistent moderation
      }
    });

    const prompt = `
      You are an AI content moderator. Review the reported content and decide whether it should be BLOCKED or ALLOWED.

      CONTENT TO REVIEW:
      Title: "${title}"
      Description: "${description}"
      
      REPORT REASON: "${reportText}"

      BLOCK content if it contains:
      - Hate speech or discrimination
      - Explicit threats or violence
      - Harassment or personal attacks
      - Explicit sexual content
      - Spam or malicious content
      - Dangerous misinformation

      ALLOW content if it:
      - Is a legitimate opinion or idea
      - Contains mild disagreement or criticism
      - Is silly, fun, or trivial (even if reported)
      - Has minor issues but isn't harmful
      - Is educational or informative

      IMPORTANT: Be conservative - only BLOCK content that is clearly harmful. When in doubt, choose ALLOW.

      Respond with ONLY one word: "BLOCK" or "ALLOW"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const decision = response.text().trim().toUpperCase();

    // Validate response
    if (decision === 'BLOCK' || decision === 'ALLOW') {
      return decision as 'BLOCK' | 'ALLOW';
    } else {
      console.warn('Invalid AI moderation response:', decision);
      return 'ALLOW'; // Default to allow if response is unclear
    }
  } catch (error) {
    console.error('Error in AI moderation:', error);
    return 'ALLOW'; // Default to allow if AI fails
  }
};

export const getUserReports = async (): Promise<Report[]> => {
  const user = getCurrentUser();
  if (!user) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching user reports:', error);
    return [];
  }
};

export const getReportsForIdea = async (ideaId: string): Promise<Report[]> => {
  try {
    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .eq('idea_id', ideaId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching reports for idea:', error);
    return [];
  }
};
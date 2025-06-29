import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { submitVoteWithBlockchain } from './blockchainVoting';

export interface Vote {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: 'up' | 'down' | 'yes' | 'no' | 'like';
  created_at: string;
}

export interface Comment {
  id: string;
  proposal_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: string;
}

export interface Save {
  id: string;
  proposal_id: string;
  user_id: string;
  created_at: string;
}

// Enhanced vote function with blockchain integration
export const submitVote = async (
  proposalId: string, 
  voteType: 'up' | 'down' | 'yes' | 'no' | 'like',
  walletAddress?: string
): Promise<{
  success: boolean;
  blockchainTxId?: string;
  error?: string;
}> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to vote');
  }
  
  try {
    // Use blockchain voting service
    const result = await submitVoteWithBlockchain(proposalId, voteType, walletAddress);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to submit vote');
    }

    return {
      success: true,
      blockchainTxId: result.blockchainResult?.txId,
      error: result.blockchainResult?.success === false ? result.blockchainResult.error : undefined
    };
  } catch (error) {
    console.error('Error submitting vote:', error);
    throw new Error('Failed to submit vote');
  }
};

export const getUserVote = async (proposalId: string): Promise<'up' | 'down' | 'yes' | 'no' | 'like' | null> => {
  const user = getCurrentUser();
  if (!user) return null;
  
  try {
    const { data, error } = await supabase
      .from('proposal_votes')
      .select('vote_type')
      .eq('proposal_id', proposalId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data?.vote_type || null;
  } catch (error) {
    console.error('Error getting user vote:', error);
    return null;
  }
};

// Comment functions
export const submitComment = async (proposalId: string, userName: string, content: string): Promise<void> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to comment');
  }

  try {
    const { error } = await supabase
      .from('proposal_comments')
      .insert([{
        proposal_id: proposalId,
        user_id: user.id,
        user_name: userName,
        content: content.trim()
      }]);

    if (error) throw error;
  } catch (error) {
    console.error('Error submitting comment:', error);
    throw new Error('Failed to submit comment');
  }
};

export const getComments = async (proposalId: string): Promise<Comment[]> => {
  try {
    const { data, error } = await supabase
      .from('proposal_comments')
      .select('*')
      .eq('proposal_id', proposalId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching comments:', error);
    return [];
  }
};

// Save functions
export const toggleSave = async (proposalId: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('You must be logged in to save proposals');
  }
  
  try {
    // Check if already saved
    const { data: existingSave } = await supabase
      .from('proposal_saves')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingSave) {
      // Remove save
      const { error } = await supabase
        .from('proposal_saves')
        .delete()
        .eq('id', existingSave.id);
      
      if (error) throw error;
      return false; // Not saved anymore
    } else {
      // Add save
      const { error } = await supabase
        .from('proposal_saves')
        .insert([{
          proposal_id: proposalId,
          user_id: user.id
        }]);
      
      if (error) throw error;
      return true; // Now saved
    }
  } catch (error) {
    console.error('Error toggling save:', error);
    throw new Error('Failed to save proposal');
  }
};

export const isSaved = async (proposalId: string): Promise<boolean> => {
  const user = getCurrentUser();
  if (!user) return false;
  
  try {
    const { data, error } = await supabase
      .from('proposal_saves')
      .select('id')
      .eq('proposal_id', proposalId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking save status:', error);
    return false;
  }
};

// Share function
export const shareProposal = async (proposal: { title: string; description: string }): Promise<void> => {
  const url = window.location.href;
  
  if (navigator.share) {
    try {
      await navigator.share({
        title: proposal.title,
        text: proposal.description,
        url: url,
      });
    } catch (error) {
      // User cancelled sharing or sharing failed
      console.log('Sharing cancelled or failed:', error);
      // Fallback to clipboard
      await copyToClipboard(url);
    }
  } else {
    // Fallback to copying URL
    await copyToClipboard(url);
  }
};

const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
    // You could show a toast notification here
    alert('Link copied to clipboard!');
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    alert('Link copied to clipboard!');
  }
};
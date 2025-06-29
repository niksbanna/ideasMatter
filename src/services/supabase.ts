import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with validation
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration. Please check your .env file.');
  console.error('Required variables: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
}

if (supabaseUrl === 'your_supabase_url_here' || supabaseKey === 'your_supabase_anon_key_here') {
  console.error('Please replace placeholder values in .env file with actual Supabase credentials');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export interface Proposal {
  id: string;
  title: string;
  description: string;
  author_id: string;
  author_name: string;
  user_id?: string; // For authenticated users
  category: string;
  status: 'draft' | 'active' | 'completed' | 'rejected' | 'hidden';
  idea_type: 'proposal' | 'poll';
  ai_draft?: {
    problem: string;
    solution: string;
    impact: string;
    implementation: string;
  } | null;
  votes_up: number;
  votes_down: number;
  votes_yes?: number;
  votes_no?: number;
  likes?: number;
  created_at: string;
  updated_at: string;
  validation_score?: number;
  validation_reasons?: string[];
  blockchain_tx_id?: string;
  blockchain_confirmed_round?: number;
  blockchain_timestamp?: number;
  blockchain_status?: string;
}

export interface IdeaSubmission {
  title: string;
  description: string;
  author_name: string;
  category?: string;
  user_id?: string; // For authenticated users
  status?: 'draft' | 'active' | 'completed' | 'rejected' | 'hidden';
  idea_type?: 'proposal' | 'poll';
  validation_score?: number;
  validation_reasons?: string[];
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  filterCategory?: string;
  filterType?: string;
  filterStatus?: string;
  searchTerm?: string;
}

export const submitIdea = async (idea: IdeaSubmission): Promise<string> => {
  try {
    // Validate Supabase configuration before making request
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseKey === 'your_supabase_anon_key_here') {
      throw new Error('Supabase is not properly configured. Please check your .env file and ensure you have valid Supabase credentials.');
    }

    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('You must be logged in to submit ideas');
    }

    const { data, error } = await supabase
      .from('proposals')
      .insert([
        {
          title: idea.title,
          description: idea.description,
          author_name: idea.author_name,
          user_id: session.user.id,
          category: idea.category || 'General',
          status: idea.status || 'draft',
          idea_type: idea.idea_type || 'poll',
          votes_up: 0,
          votes_down: 0,
          votes_yes: 0,
          votes_no: 0,
          likes: 0,
          validation_score: idea.validation_score,
          validation_reasons: idea.validation_reasons
        }
      ])
      .select('id')
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('No data returned from database');
    }
    
    return data.id;
  } catch (error) {
    console.error('Error submitting idea:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('You must be logged in')) {
        throw error; // Re-throw auth errors as-is
      } else if (error.message.includes('404')) {
        throw new Error('Database table not found. Please ensure the proposals table has been created in your Supabase project.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        throw new Error('Authentication failed. Please sign in and try again.');
      } else if (error.message.includes('Supabase is not properly configured')) {
        throw error; // Re-throw configuration errors as-is
      } else {
        throw new Error(`Failed to submit idea: ${error.message}`);
      }
    } else {
      throw new Error('An unexpected error occurred while submitting your idea');
    }
  }
};

export const getProposals = async (params: PaginationParams = {}): Promise<{
  data: Proposal[];
  count: number;
}> => {
  try {
    // Validate Supabase configuration before making request
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseKey === 'your_supabase_anon_key_here') {
      console.warn('Supabase is not properly configured. Returning empty proposals list.');
      return { data: [], count: 0 };
    }

    const {
      page = 1,
      pageSize = 10,
      sortBy = 'newest',
      filterCategory = 'all',
      filterType = 'all',
      filterStatus = 'all',
      searchTerm = ''
    } = params;

    // Start building the query
    let query = supabase
      .from('proposals')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filterStatus !== 'all') {
      query = query.eq('status', filterStatus);
    } else {
      // Only fetch active and completed proposals for public view (exclude rejected and hidden ones)
      query = query.in('status', ['active', 'completed']);
    }

    if (filterCategory !== 'all') {
      query = query.eq('category', filterCategory);
    }

    if (filterType !== 'all') {
      query = query.eq('idea_type', filterType);
    }

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,author_name.ilike.%${searchTerm}%`);
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        query = query.order('created_at', { ascending: false });
        break;
      case 'oldest':
        query = query.order('created_at', { ascending: true });
        break;
      case 'most_votes':
        // This is a simplification - ideally we'd calculate total votes in the database
        query = query.order('votes_up', { ascending: false });
        break;
      case 'trending':
        // This is a simplification - ideally we'd have a trending algorithm in the database
        query = query.order('created_at', { ascending: false });
        break;
      default:
        query = query.order('created_at', { ascending: false });
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching proposals:', error);
      return { data: [], count: 0 };
    }
    
    return { 
      data: data || [], 
      count: count || 0 
    };
  } catch (error) {
    console.error('Error fetching proposals:', error);
    return { data: [], count: 0 };
  }
};

export const getUserProposals = async (): Promise<Proposal[]> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return [];
    }

    // Fetch all user proposals including drafts, rejected, and hidden ones
    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user proposals:', error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching user proposals:', error);
    return [];
  }
};

export const getProposal = async (id: string): Promise<Proposal | null> => {
  try {
    // Validate Supabase configuration before making request
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseKey === 'your_supabase_anon_key_here') {
      console.warn('Supabase is not properly configured. Cannot fetch proposal.');
      return null;
    }

    const { data, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching proposal:', error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching proposal:', error);
    return null;
  }
};

export const updateProposalDraft = async (id: string, aiDraft: any, status: string = 'active'): Promise<void> => {
  try {
    // Validate Supabase configuration before making request
    if (!supabaseUrl || !supabaseKey || 
        supabaseUrl === 'your_supabase_url_here' || 
        supabaseKey === 'your_supabase_anon_key_here') {
      throw new Error('Supabase is not properly configured. Cannot update proposal.');
    }

    const { error } = await supabase
      .from('proposals')
      .update({ 
        ai_draft: aiDraft,
        status: status
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating proposal draft:', error);
      throw new Error(`Failed to update proposal: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating proposal draft:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to update proposal');
    }
  }
};

export const deleteProposal = async (id: string): Promise<void> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      throw new Error('You must be logged in to delete proposals');
    }

    const { error } = await supabase
      .from('proposals')
      .delete()
      .eq('id', id)
      .eq('user_id', session.user.id); // Ensure user can only delete their own proposals

    if (error) {
      throw new Error(`Failed to delete proposal: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting proposal:', error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error('Failed to delete proposal');
    }
  }
};

export const canEditProposal = async (proposalId: string): Promise<boolean> => {
  try {
    // Get current user session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data, error } = await supabase
      .from('proposals')
      .select('user_id')
      .eq('id', proposalId)
      .single();

    if (error || !data) {
      return false;
    }

    return data.user_id === session.user.id;
  } catch (error) {
    console.error('Error checking edit permissions:', error);
    return false;
  }
};

export const getTotalProposalsCount = async (): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'completed']);

    if (error) {
      console.error('Error getting total count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error getting total count:', error);
    return 0;
  }
};
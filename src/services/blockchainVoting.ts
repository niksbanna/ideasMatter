import { supabase } from './supabase';
import { getCurrentUser } from './auth';
import { 
  submitVoteToBlockchain, 
  createDemoAccount, 
  type AlgorandVoteResult,
  type VoteTransaction 
} from './algorand';
import { 
  submitNodelyVote,
  isNodelyConfigured,
  type NodelyVoteResult
} from './nodelyAlgorand';
import algosdk from 'algosdk';

export interface BlockchainVoteRecord {
  id: string;
  proposal_id: string;
  user_id: string;
  vote_type: string;
  blockchain_tx_id?: string;
  blockchain_confirmed_round?: number;
  blockchain_timestamp?: number;
  blockchain_status: 'pending' | 'confirmed' | 'failed';
  created_at: string;
}

// Store for demo accounts (in production, use secure storage)
const demoAccounts = new Map<string, algosdk.Account>();

export const submitVoteWithBlockchain = async (
  proposalId: string,
  voteType: 'up' | 'down' | 'yes' | 'no' | 'like',
  walletAddress?: string
): Promise<{
  success: boolean;
  voteId?: string;
  blockchainResult?: AlgorandVoteResult | NodelyVoteResult;
  error?: string;
}> => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  try {
    // First, record the vote in the database
    const { data: existingVote } = await supabase
      .from('proposal_votes')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('user_id', user.id)
      .maybeSingle();

    let voteId: string;

    if (existingVote) {
      if (existingVote.vote_type === voteType) {
        // Remove vote if clicking the same vote type
        const { error } = await supabase
          .from('proposal_votes')
          .delete()
          .eq('id', existingVote.id);
        
        if (error) throw error;
        return { success: true };
      } else {
        // Update vote type if different
        const { error } = await supabase
          .from('proposal_votes')
          .update({ vote_type: voteType })
          .eq('id', existingVote.id);
        
        if (error) throw error;
        voteId = existingVote.id;
      }
    } else {
      // Insert new vote
      const { data, error } = await supabase
        .from('proposal_votes')
        .insert([{
          proposal_id: proposalId,
          user_id: user.id,
          vote_type: voteType
        }])
        .select('id')
        .single();
      
      if (error) throw error;
      voteId = data.id;
    }

    // If wallet is connected, record vote on blockchain
    let blockchainResult: AlgorandVoteResult | NodelyVoteResult | undefined;
    
    if (walletAddress) {
      try {
        // Get or create demo account for this user
        let voterAccount: algosdk.Account;
        
        if (demoAccounts.has(user.id)) {
          voterAccount = demoAccounts.get(user.id)!;
        } else {
          // Create demo account for blockchain voting
          voterAccount = createDemoAccount();
          demoAccounts.set(user.id, voterAccount);
        }

        // Submit vote to blockchain - use Nodely API if configured
        if (isNodelyConfigured()) {
          blockchainResult = await submitNodelyVote(
            voterAccount,
            proposalId,
            voteType
          );
        } else {
          // Fallback to regular Algorand client
          blockchainResult = await submitVoteToBlockchain(
            voterAccount,
            proposalId,
            voteType
          );
        }

        // Store blockchain transaction info
        if (blockchainResult.success && blockchainResult.txId) {
          await supabase
            .from('blockchain_votes')
            .upsert({
              proposal_id: proposalId,
              user_id: user.id,
              vote_type: voteType,
              blockchain_tx_id: blockchainResult.txId,
              blockchain_confirmed_round: blockchainResult.confirmedRound,
              blockchain_timestamp: Date.now(),
              blockchain_status: 'confirmed'
            });
        }
      } catch (blockchainError) {
        console.error('Blockchain voting error:', blockchainError);
        // Don't fail the entire vote if blockchain fails
        blockchainResult = {
          success: false,
          error: blockchainError instanceof Error ? blockchainError.message : 'Blockchain error'
        };
      }
    }

    return {
      success: true,
      voteId,
      blockchainResult
    };

  } catch (error) {
    console.error('Error submitting vote:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

export const getBlockchainVoteStatus = async (
  proposalId: string,
  userId: string
): Promise<BlockchainVoteRecord | null> => {
  try {
    const { data, error } = await supabase
      .from('blockchain_votes')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting blockchain vote status:', error);
    return null;
  }
};

export const getAllBlockchainVotes = async (proposalId: string): Promise<BlockchainVoteRecord[]> => {
  try {
    const { data, error } = await supabase
      .from('blockchain_votes')
      .select('*')
      .eq('proposal_id', proposalId)
      .eq('blockchain_status', 'confirmed')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error getting all blockchain votes:', error);
    return [];
  }
};

// Get demo account for user (for testing purposes)
export const getDemoAccount = (userId: string): algosdk.Account | null => {
  return demoAccounts.get(userId) || null;
};

// Initialize demo account for user
export const initializeDemoAccount = (userId: string): algosdk.Account => {
  if (!demoAccounts.has(userId)) {
    const account = createDemoAccount();
    demoAccounts.set(userId, account);
    return account;
  }
  return demoAccounts.get(userId)!;
};

// Submit a proposal to the blockchain
export const submitProposalToBlockchain = async (
  proposalId: string,
  title: string,
  description: string,
  walletAddress?: string
): Promise<{
  success: boolean;
  txId?: string;
  error?: string;
}> => {
  const user = getCurrentUser();
  if (!user) {
    return { success: false, error: 'User not authenticated' };
  }

  if (!walletAddress) {
    return { success: false, error: 'Wallet not connected' };
  }

  try {
    // Get or create demo account for this user
    let proposerAccount: algosdk.Account;
    
    if (demoAccounts.has(user.id)) {
      proposerAccount = demoAccounts.get(user.id)!;
    } else {
      // Create demo account for blockchain operations
      proposerAccount = createDemoAccount();
      demoAccounts.set(user.id, proposerAccount);
    }

    // Create proposal data for blockchain
    const proposalData = {
      type: 'PROPOSAL',
      id: proposalId,
      title: title.substring(0, 100), // Limit length for blockchain
      description: description.substring(0, 500), // Limit length for blockchain
      creator: user.id,
      timestamp: Date.now(),
      platform: 'IdeasMatter'
    };

    // Create note with proposal data (max 1024 bytes)
    const note = new TextEncoder().encode(JSON.stringify(proposalData));
    
    if (note.length > 1024) {
      throw new Error('Proposal data too large for transaction note');
    }

    // Get suggested transaction parameters
    const suggestedParams = isNodelyConfigured() 
      ? await algodClient.getTransactionParams().do()
      : await algodClient.getTransactionParams().do();
    
    // Create transaction
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: proposerAccount.addr,
      to: proposerAccount.addr, // Self-transaction to store proposal data
      amount: 1000, // 0.001 ALGO (minimal amount)
      note: note,
      suggestedParams: suggestedParams,
    });
    
    // Sign transaction
    const signedTxn = txn.signTxn(proposerAccount.sk);
    
    // Submit transaction
    const txId = txn.txID().toString();
    
    if (isNodelyConfigured()) {
      await algodClient.sendRawTransaction(signedTxn).do();
    } else {
      await algodClient.sendRawTransaction(signedTxn).do();
    }
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    // Update proposal with blockchain transaction info
    await supabase
      .from('proposals')
      .update({
        blockchain_tx_id: txId,
        blockchain_confirmed_round: confirmedTxn['confirmed-round'],
        blockchain_timestamp: Date.now(),
        blockchain_status: 'confirmed'
      })
      .eq('id', proposalId);
    
    return {
      success: true,
      txId: txId
    };
  } catch (error) {
    console.error('Error submitting proposal to blockchain:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown blockchain error'
    };
  }
};
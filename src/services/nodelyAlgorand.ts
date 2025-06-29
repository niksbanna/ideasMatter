import algosdk from 'algosdk';

// Nodely API configuration
const NODELY_API_URL = 'https://testnet-api.nodely.io';
const NODELY_API_KEY = import.meta.env.VITE_NODELY_API_KEY || '';

// Initialize Algorand client with Nodely API
export const algodClient = new algosdk.Algodv2(
  NODELY_API_KEY, 
  NODELY_API_URL, 
  ''
);

// Add Nodely API key to all requests
algodClient.setIntEncoding(algosdk.IntDecoding.SAFE);
algodClient.addHeader('X-API-Key', NODELY_API_KEY);

export interface NodelyVoteTransaction {
  proposalId: string;
  voterAddress: string;
  voteType: 'up' | 'down' | 'yes' | 'no' | 'like';
  timestamp: number;
  txId?: string;
}

export interface NodelyVoteResult {
  success: boolean;
  txId?: string;
  error?: string;
  confirmedRound?: number;
}

// Submit vote to Algorand blockchain via Nodely API
export const submitNodelyVote = async (
  voterAccount: algosdk.Account,
  proposalId: string,
  voteType: 'up' | 'down' | 'yes' | 'no' | 'like'
): Promise<NodelyVoteResult> => {
  try {
    // Check if Nodely API key is configured
    if (!NODELY_API_KEY) {
      throw new Error('Nodely API key not configured. Please set VITE_NODELY_API_KEY in your .env file.');
    }

    // Get suggested transaction parameters
    const suggestedParams = await algodClient.getTransactionParams().do();
    
    // Create vote data
    const voteData: NodelyVoteTransaction = {
      proposalId,
      voterAddress: voterAccount.addr,
      voteType,
      timestamp: Date.now()
    };
    
    // Create note with vote data (max 1024 bytes)
    const noteData = {
      type: 'VOTE',
      platform: 'IdeasMatter',
      proposal: proposalId.substring(0, 8), // Truncate for space
      vote: voteType,
      timestamp: voteData.timestamp
    };
    const note = new TextEncoder().encode(JSON.stringify(noteData));
    
    if (note.length > 1024) {
      throw new Error('Vote data too large for transaction note');
    }
    
    // Create transaction (minimal ALGOs transfer to record vote)
    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: voterAccount.addr,
      to: voterAccount.addr, // Self-transaction to store vote data
      amount: 1000, // 0.001 ALGO (minimal amount)
      note: note,
      suggestedParams: suggestedParams,
    });
    
    // Sign transaction
    const signedTxn = txn.signTxn(voterAccount.sk);
    
    // Submit transaction to Nodely API
    const txId = txn.txID().toString();
    await algodClient.sendRawTransaction(signedTxn).do();
    
    // Wait for confirmation
    const confirmedTxn = await algosdk.waitForConfirmation(algodClient, txId, 4);
    
    return {
      success: true,
      txId: txId,
      confirmedRound: confirmedTxn['confirmed-round']
    };
  } catch (error) {
    console.error('Error submitting vote to Nodely Algorand API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown blockchain error'
    };
  }
};

// Get transaction details from Nodely API
export const getNodelyTransaction = async (txId: string): Promise<any> => {
  try {
    if (!NODELY_API_KEY) {
      throw new Error('Nodely API key not configured');
    }
    
    const response = await fetch(`${NODELY_API_URL}/v2/transactions/${txId}`, {
      headers: {
        'X-API-Key': NODELY_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch transaction: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching transaction from Nodely API:', error);
    throw error;
  }
};

// Get account information from Nodely API
export const getNodelyAccountInfo = async (address: string): Promise<any> => {
  try {
    if (!NODELY_API_KEY) {
      throw new Error('Nodely API key not configured');
    }
    
    const response = await fetch(`${NODELY_API_URL}/v2/accounts/${address}`, {
      headers: {
        'X-API-Key': NODELY_API_KEY
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch account info: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching account info from Nodely API:', error);
    throw error;
  }
};

// Get Nodely explorer URL for transaction
export const getNodelyExplorerUrl = (txId: string): string => {
  return `https://testnet.algoexplorer.io/tx/${txId}`;
};

// Check if Nodely API is properly configured
export const isNodelyConfigured = (): boolean => {
  return !!NODELY_API_KEY && NODELY_API_KEY !== 'YOUR_NODELY_API_KEY';
};